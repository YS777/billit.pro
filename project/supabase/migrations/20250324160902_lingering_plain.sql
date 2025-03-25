/*
  # Add invoice templates and enhance invoice history

  1. New Tables
    - `invoice_templates`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `name` (text)
      - `data` (jsonb) - Stores template data
      - `is_default` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Changes
    - Add `template_id` to invoices table
    - Add `last_invoice_number` to profiles table
    - Add `branding` to profiles table

  3. Security
    - Enable RLS on invoice_templates
    - Add policies for template access
*/

-- Add branding and last invoice number to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS last_invoice_number integer DEFAULT 1000,
ADD COLUMN IF NOT EXISTS branding jsonb DEFAULT '{"logo": null, "color": "#4F46E5", "font": "Inter"}'::jsonb;

-- Create invoice templates table
CREATE TABLE IF NOT EXISTS invoice_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  name text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add template reference to invoices
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES invoice_templates(id);

-- Enable RLS
ALTER TABLE invoice_templates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own templates"
  ON invoice_templates
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create templates"
  ON invoice_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates"
  ON invoice_templates
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates"
  ON invoice_templates
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create function to update last_invoice_number
CREATE OR REPLACE FUNCTION increment_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles 
  SET last_invoice_number = last_invoice_number + 1
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-increment invoice number
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'increment_invoice_number_trigger'
  ) THEN
    CREATE TRIGGER increment_invoice_number_trigger
    AFTER INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION increment_invoice_number();
  END IF;
END $$;

-- Create default templates for each user
CREATE OR REPLACE FUNCTION create_default_templates()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO invoice_templates (user_id, name, data, is_default)
  VALUES (
    NEW.id,
    'Classic Template',
    '{
      "layout": "classic",
      "sections": {
        "header": {"enabled": true, "position": "top"},
        "items": {"enabled": true, "position": "middle"},
        "footer": {"enabled": true, "position": "bottom"}
      },
      "colors": {
        "primary": "#4F46E5",
        "secondary": "#6B7280",
        "accent": "#F3F4F6"
      }
    }'::jsonb,
    true
  );
  
  INSERT INTO invoice_templates (user_id, name, data)
  VALUES (
    NEW.id,
    'Modern Template',
    '{
      "layout": "modern",
      "sections": {
        "header": {"enabled": true, "position": "top"},
        "items": {"enabled": true, "position": "middle"},
        "footer": {"enabled": true, "position": "bottom"}
      },
      "colors": {
        "primary": "#2563EB",
        "secondary": "#4B5563",
        "accent": "#EFF6FF"
      }
    }'::jsonb
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for default templates
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'create_default_templates_trigger'
  ) THEN
    CREATE TRIGGER create_default_templates_trigger
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_templates();
  END IF;
END $$;