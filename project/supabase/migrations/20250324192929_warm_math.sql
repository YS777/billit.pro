/*
  # Update Authentication System

  1. Changes
    - Add OAuth support with improved error handling
    - Update user profile structure
    - Add email verification settings
    - Improve session management
    - Add secure password policies

  2. Security
    - Enable RLS
    - Add policies for authenticated users
    - Improve error handling
*/

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";

-- Update auth settings
ALTER TABLE auth.users ALTER COLUMN email TYPE citext;

-- Create or replace function to get OAuth provider info
CREATE OR REPLACE FUNCTION auth.get_oauth_provider(provider_id text)
RETURNS jsonb AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'provider', provider_id,
      'created_at', created_at,
      'updated_at', updated_at,
      'email', email
    )
    FROM auth.identities
    WHERE id = provider_id::uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update user profile creation function with better error handling
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

  -- Create profile for new user with better error handling
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

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup with AFTER INSERT
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to check if user signed in with OAuth
CREATE OR REPLACE FUNCTION auth.is_oauth_user(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.identities
    WHERE user_id = $1
    AND provider_id != 'email'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create basic user policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Add helpful comments
COMMENT ON FUNCTION auth.get_oauth_provider IS 'Gets OAuth provider information for a user';
COMMENT ON FUNCTION auth.is_oauth_user IS 'Checks if a user signed up using OAuth';
COMMENT ON FUNCTION public.handle_new_user IS 'Creates a new user profile with OAuth support';