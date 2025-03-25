/*
  # Add admin role to profiles

  1. Changes
    - Add role column to profiles table
    - Add admin role check function
    - Update RLS policies to allow admin access

  2. Security
    - Enable RLS
    - Add policies for admin access
*/

-- Add role column to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user'::text
CHECK (role IN ('user', 'admin'));

-- Create admin check function
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policies to allow admin access
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    is_admin(auth.uid()) OR
    auth.uid() = id
  );

CREATE POLICY "Admins can view all invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (
    is_admin(auth.uid()) OR
    auth.uid() = user_id
  );

CREATE POLICY "Admins can view all bills"
  ON bills
  FOR SELECT
  TO authenticated
  USING (
    is_admin(auth.uid()) OR
    auth.uid() = user_id
  );