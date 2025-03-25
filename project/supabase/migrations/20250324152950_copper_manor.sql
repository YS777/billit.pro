/*
  # Add print jobs table and update bills table

  1. New Tables
    - `print_jobs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `status` (text): 'pending', 'processing', 'completed', 'failed'
      - `files` (jsonb): Array of file information
      - `crop_settings` (jsonb): Crop coordinates and settings
      - `payment_status` (text): 'pending', 'paid', 'failed'
      - `amount` (numeric): Total amount in INR
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Bills Table
    - Add `print_job_id` column
    - Add crop settings columns
    - Update status options

  3. Security
    - Enable RLS on print_jobs table
    - Add policies for authenticated users
    - Update bills table policies
*/

-- Create print_jobs table
CREATE TABLE IF NOT EXISTS print_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  status text NOT NULL DEFAULT 'pending',
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  crop_settings jsonb,
  payment_status text NOT NULL DEFAULT 'pending',
  amount numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status = ANY (ARRAY['pending', 'processing', 'completed', 'failed'])),
  CONSTRAINT valid_payment_status CHECK (payment_status = ANY (ARRAY['pending', 'paid', 'failed']))
);

-- Update bills table
ALTER TABLE bills 
  ADD COLUMN IF NOT EXISTS print_job_id uuid REFERENCES print_jobs(id),
  ADD COLUMN IF NOT EXISTS crop_x numeric,
  ADD COLUMN IF NOT EXISTS crop_y numeric,
  ADD COLUMN IF NOT EXISTS crop_width numeric,
  ADD COLUMN IF NOT EXISTS crop_height numeric;

-- Drop existing status constraint if it exists
ALTER TABLE bills DROP CONSTRAINT IF EXISTS valid_status;

-- Add updated status constraint
ALTER TABLE bills ADD CONSTRAINT valid_status 
  CHECK (status = ANY (ARRAY['processing', 'ready', 'printed', 'error']));

-- Enable RLS on print_jobs
ALTER TABLE print_jobs ENABLE ROW LEVEL SECURITY;

-- Print jobs policies
CREATE POLICY "Users can create print jobs"
  ON print_jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own print jobs"
  ON print_jobs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own print jobs"
  ON print_jobs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update bills policies for print job relationship
DROP POLICY IF EXISTS "Users can view own bills" ON bills;
CREATE POLICY "Users can view own bills"
  ON bills
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    auth.uid() = (SELECT user_id FROM print_jobs WHERE id = print_job_id)
  );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_print_jobs_updated_at
  BEFORE UPDATE ON print_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();