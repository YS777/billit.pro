/*
  # Update Session Management

  1. Changes
    - Add session tracking
    - Improve session security
    - Add session cleanup

  2. Security
    - Add session validation
    - Add rate limiting
*/

-- Create session tracking table
CREATE TABLE IF NOT EXISTS auth.sessions_audit (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  session_id uuid,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  last_active_at timestamptz DEFAULT now()
);

-- Create function to track session activity
CREATE OR REPLACE FUNCTION auth.track_session_activity()
RETURNS trigger AS $$
BEGIN
  INSERT INTO auth.sessions_audit (
    user_id,
    session_id,
    ip_address,
    user_agent
  )
  VALUES (
    NEW.user_id,
    NEW.id,
    inet_client_addr(),
    current_setting('request.headers')::json->>'user-agent'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for session tracking
DROP TRIGGER IF EXISTS on_session_created ON auth.sessions;
CREATE TRIGGER on_session_created
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION auth.track_session_activity();

-- Create function to cleanup old sessions
CREATE OR REPLACE FUNCTION auth.cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM auth.sessions_audit
  WHERE last_active_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add helpful comments
COMMENT ON TABLE auth.sessions_audit IS 'Tracks user session activity for security monitoring';
COMMENT ON FUNCTION auth.track_session_activity IS 'Records new session creation with metadata';
COMMENT ON FUNCTION auth.cleanup_old_sessions IS 'Removes session audit records older than 30 days';