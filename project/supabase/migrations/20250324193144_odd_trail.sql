/*
  # Add Security Audit System

  1. New Tables
    - `auth.security_audit`: Tracks security-related events
    - Stores user actions, IP addresses, and event details

  2. Functions
    - Add logging function for security events
    - Add suspicious activity detection
    - Add audit trail capabilities

  3. Security
    - All functions are SECURITY DEFINER
    - Proper error handling and logging
*/

-- Create security audit table
CREATE TABLE IF NOT EXISTS auth.security_audit (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL CHECK (
    event_type IN (
      'login_success',
      'login_failure',
      'logout',
      'password_change',
      'email_change',
      'mfa_enabled',
      'mfa_disabled',
      'suspicious_activity'
    )
  ),
  ip_address inet,
  user_agent text,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS security_audit_user_id_idx ON auth.security_audit(user_id);
CREATE INDEX IF NOT EXISTS security_audit_event_type_idx ON auth.security_audit(event_type);
CREATE INDEX IF NOT EXISTS security_audit_created_at_idx ON auth.security_audit(created_at);

-- Create function to log security events with better error handling
CREATE OR REPLACE FUNCTION auth.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void AS $$
BEGIN
  -- Validate event type
  IF p_event_type NOT IN (
    'login_success',
    'login_failure',
    'logout',
    'password_change',
    'email_change',
    'mfa_enabled',
    'mfa_disabled',
    'suspicious_activity'
  ) THEN
    RAISE EXCEPTION 'Invalid event type: %', p_event_type;
  END IF;

  -- Insert audit record with error handling
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
      current_setting('request.headers', true)::json->>'user-agent',
      p_details
    );
  EXCEPTION WHEN OTHERS THEN
    -- Log error but don't fail the operation
    RAISE WARNING 'Failed to log security event: %', SQLERRM;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check for suspicious activity with improved detection
CREATE OR REPLACE FUNCTION auth.check_suspicious_activity(user_id uuid)
RETURNS boolean AS $$
DECLARE
  failed_attempts int;
  distinct_ips int;
  unusual_times int;
BEGIN
  -- Count failed login attempts in last hour
  SELECT COUNT(*)
  INTO failed_attempts
  FROM auth.security_audit
  WHERE user_id = $1
    AND event_type = 'login_failure'
    AND created_at > now() - interval '1 hour';

  -- Count distinct IP addresses in last hour
  SELECT COUNT(DISTINCT ip_address)
  INTO distinct_ips
  FROM auth.security_audit
  WHERE user_id = $1
    AND created_at > now() - interval '1 hour';

  -- Count logins during unusual hours (11 PM - 5 AM)
  SELECT COUNT(*)
  INTO unusual_times
  FROM auth.security_audit
  WHERE user_id = $1
    AND event_type = 'login_success'
    AND created_at > now() - interval '24 hours'
    AND EXTRACT(HOUR FROM created_at) BETWEEN 23 AND 5;

  -- Return true if any suspicious patterns are detected
  RETURN (
    failed_attempts >= 5 OR
    distinct_ips >= 3 OR
    unusual_times >= 3
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cleanup old audit logs
CREATE OR REPLACE FUNCTION auth.cleanup_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.security_audit
  WHERE created_at < now() - interval '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE auth.security_audit IS 'Tracks security-related events for audit purposes';
COMMENT ON FUNCTION auth.log_security_event IS 'Records security events with metadata and improved validation';
COMMENT ON FUNCTION auth.check_suspicious_activity IS 'Checks for suspicious activity patterns with enhanced detection';
COMMENT ON FUNCTION auth.cleanup_audit_logs IS 'Removes audit logs older than 90 days';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_security_audit_lookup 
ON auth.security_audit (user_id, event_type, created_at);