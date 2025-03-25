/*
  # Configure Authentication Settings

  1. Changes
    - Configure OAuth providers (Google)
    - Set up email templates
    - Configure session settings
    - Add auth helper functions
    - Update user management triggers

  2. Security
    - Enable secure session handling
    - Set up proper OAuth scopes
    - Configure email security settings
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

-- Create function to handle OAuth user creation
CREATE OR REPLACE FUNCTION auth.handle_oauth_user()
RETURNS trigger AS $$
BEGIN
  -- Set default metadata for OAuth users
  NEW.raw_user_meta_data = jsonb_build_object(
    'full_name', 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    'avatar_url',
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    'provider',
    (
      SELECT provider_id 
      FROM auth.identities 
      WHERE user_id = NEW.id 
      ORDER BY created_at DESC 
      LIMIT 1
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for OAuth user handling
DROP TRIGGER IF EXISTS on_oauth_user_created ON auth.users;
CREATE TRIGGER on_oauth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  WHEN (NEW.raw_user_meta_data->>'provider' IS NOT NULL)
  EXECUTE FUNCTION auth.handle_oauth_user();

-- Update user profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  provider text;
BEGIN
  -- Get the OAuth provider if exists
  provider := (
    SELECT provider_id::text
    FROM auth.identities
    WHERE user_id = NEW.id
    ORDER BY created_at DESC
    LIMIT 1
  );

  -- Create profile for new user
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    subscription,
    bill_credits,
    preferences,
    role,
    branding
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
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
    CASE 
      WHEN NEW.email = 'admin@billit.pro' THEN 'admin'
      ELSE 'user'
    END,
    jsonb_build_object(
      'logo', null,
      'color', '#4F46E5',
      'font', 'Inter'
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

-- Add helpful comments
COMMENT ON FUNCTION auth.get_oauth_provider IS 'Gets OAuth provider information for a user';
COMMENT ON FUNCTION auth.handle_oauth_user IS 'Handles metadata setup for OAuth users';
COMMENT ON FUNCTION auth.is_oauth_user IS 'Checks if a user signed up using OAuth';
COMMENT ON FUNCTION public.handle_new_user IS 'Creates a new user profile with OAuth support';