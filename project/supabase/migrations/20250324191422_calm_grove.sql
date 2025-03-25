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
      role,
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
      CASE 
        WHEN NEW.email = 'admin@billit.pro' THEN 'admin'
        ELSE 'user'
      END,
      jsonb_build_object(
        'logo', null,
        'color', '#4F46E5',
        'font', 'Inter'
      ),
      NOW(),
      NOW()
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log the error details
    RAISE NOTICE 'Error creating profile for user %: %', NEW.id, SQLERRM;
    -- Return NEW to allow the user creation even if profile creation fails
    -- This prevents the entire transaction from failing
    RETURN NEW;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
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

-- Add helpful comments
COMMENT ON FUNCTION auth.get_oauth_provider IS 'Gets OAuth provider information for a user';
COMMENT ON FUNCTION auth.handle_oauth_user IS 'Handles metadata setup for OAuth users';
COMMENT ON FUNCTION auth.is_oauth_user IS 'Checks if a user signed up using OAuth';
COMMENT ON FUNCTION public.handle_new_user IS 'Creates a new user profile with OAuth support';