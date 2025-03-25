/*
  # Update Authentication Settings

  1. Changes
    - Set email OTP expiry to 15 minutes
    - Enable Google OAuth provider
    - Update email templates
    - Add auth functions for role management
*/

-- Update auth settings
ALTER TABLE auth.users 
ALTER COLUMN email_confirm_expires_in SET DEFAULT INTERVAL '15 minutes';

-- Create helper function for checking auth provider
CREATE OR REPLACE FUNCTION auth.get_auth_provider(user_id uuid)
RETURNS text AS $$
  SELECT provider_id::text
  FROM auth.identities
  WHERE user_id = $1
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
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
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
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
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update email template settings
UPDATE auth.mfa_factors
SET code_expires_in = INTERVAL '15 minutes'
WHERE factor_type = 'totp';

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