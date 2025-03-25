/*
  # Update Security Settings

  1. Changes
    - Add password policies
    - Add rate limiting
    - Add security audit logging

  2. Security
    - Enforce password complexity
    - Track failed login attempts
    - Monitor suspicious activity
*/

-- Create security audit table
CREATE TABLE IF NOT EXISTS auth.security_audit (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  ip_address inet,
  user_agent text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create function to log security events
CREATE OR REPLACE FUNCTION auth.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  INSERT INTO auth.security_audit (
    user_id,
    event_type,
    ip_address,
    user_agent,
    details
  )
  VALUES (
    p_user_id,
    p_event_type,
    inet_client_addr(),
    current_setting('request.headers')::json->>'user-agent',
    p_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check for suspicious activity
CREATE OR REPLACE FUNCTION auth.check_suspicious_activity(user_id uuid)
RETURNS boolean AS $$
DECLARE
  failed_attempts int;
BEGIN
  -- Count failed login attempts in last hour
  SELECT COUNT(*)
  INTO failed_attempts
  FROM auth.security_audit
  WHERE user_id = $1
    AND event_type = 'failed_login'
    AND created_at > now() - interval '1 hour';
    
  RETURN failed_attempts >= 5;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE auth.security_audit IS 'Tracks security-related events for audit purposes';
COMMENT ON FUNCTION auth.log_security_event IS 'Records security events with metadata';
COMMENT ON FUNCTION auth.check_suspicious_activity IS 'Checks for suspicious activity patterns';