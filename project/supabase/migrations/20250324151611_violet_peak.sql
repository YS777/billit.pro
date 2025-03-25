/*
  # Fix invoices table structure

  1. Changes
    - Rename columns to match TypeScript types
    - Add missing columns
    - Update column types
    - Add proper constraints

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Rename and modify columns to match TypeScript types
ALTER TABLE invoices 
  RENAME COLUMN due_date TO "dueDate";

-- Add missing columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'invoices' AND column_name = 'clientEmail'
  ) THEN
    ALTER TABLE invoices ADD COLUMN "clientEmail" text NOT NULL;
  END IF;
END $$;

-- Ensure items column is JSONB and has proper default
ALTER TABLE invoices 
  ALTER COLUMN items SET DEFAULT '[]'::jsonb,
  ALTER COLUMN items SET NOT NULL;

-- Add check constraint for status
ALTER TABLE invoices 
  DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE invoices
  ADD CONSTRAINT valid_status 
  CHECK (status = ANY (ARRAY['draft'::text, 'sent'::text, 'paid'::text, 'overdue'::text]));

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
DROP POLICY IF EXISTS "Users can create own invoices" ON invoices;
CREATE POLICY "Users can create own invoices"
  ON invoices
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices"
  ON invoices
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own invoices" ON invoices;
CREATE POLICY "Users can update own invoices"
  ON invoices
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own invoices" ON invoices;
CREATE POLICY "Users can delete own invoices"
  ON invoices
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);