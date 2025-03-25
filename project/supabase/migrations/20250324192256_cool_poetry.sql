/*
  # Remove admin role and simplify user profiles

  1. Changes
    - Remove role column from profiles
    - Remove admin-related functions
    - Update profile creation to remove role handling
    - Simplify RLS policies
*/

-- Remove role column from profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS role;

-- Drop admin-related functions
DROP FUNCTION IF EXISTS public.check_user_role;
DROP FUNCTION IF EXISTS public.get_current_user_role;
DROP FUNCTION IF EXISTS public.is_admin;

-- Update profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  provider text;
  user_full_name text;
BEGIN
  -- Get the OAuth provider if exists
  provider := (
    SELECT provider_id::text
    FROM auth.identities
    WHERE user_id = NEW.id
    ORDER BY created_at DESC
    LIMIT 1
  );

  -- Get user's full name with proper fallback
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Create profile for new user
  BEGIN
    INSERT INTO public.profiles (
      id,
      full_name,
      email,
      subscription,
      bill_credits,
      preferences,
      branding,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      user_full_name,
      NEW.email,
      'free',
      5,
      jsonb_build_object(
        'currency', jsonb_build_object(
          'code', 'USD',
          'symbol', '$',
          'name', 'US Dollar'
        ),
        'language', 'en',
        'oauth_provider', provider
      ),
      jsonb_build_object(
        'logo', null,
        'color', '#4F46E5',
        'font', 'Inter'
      ),
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can view all invoices" ON invoices;
DROP POLICY IF EXISTS "Admins can view all bills" ON bills;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new simplified policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());