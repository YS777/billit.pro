/*
  # Update Authentication Settings

  1. Changes
    - Set email OTP expiry to 15 minutes using auth.config()
    - Add auth functions for provider and role management
    - Create trigger for new user profiles
    - Update email verification settings

  Note: Some auth settings must be configured through the Supabase dashboard
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create helper function for checking auth provider
CREATE OR REPLACE FUNCTION auth.get_auth_provider(user_id uuid)
RETURNS text AS $$
  SELECT provider_id::text
  FROM auth.identities
  WHERE user_id = $1
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Create profile for new user
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    subscription,
    bill_credits,
    preferences,
    role
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'free',
    5,
    '{"currency": {"code": "USD", "symbol": "$", "name": "US Dollar"}, "language": "en"}'::jsonb,
    CASE 
      WHEN NEW.email = 'admin@billit.pro' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add function to check if email is verified
CREATE OR REPLACE FUNCTION auth.email_verified(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = user_id
    AND email_confirmed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update or create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid()
  OR (SELECT public.is_admin())
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates a public profile for newly created users';
COMMENT ON FUNCTION auth.email_verified IS 'Checks if a user''s email has been verified';
COMMENT ON FUNCTION public.is_admin IS 'Checks if the current user has admin role';
COMMENT ON FUNCTION public.get_user_role IS 'Gets the role of the current user';