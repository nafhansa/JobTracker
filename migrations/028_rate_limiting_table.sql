-- Rate limiting table for serverless-compatible rate limiting
CREATE TABLE IF NOT EXISTS rate_limits (
  id SERIAL PRIMARY KEY,
  identifier TEXT NOT NULL UNIQUE,
  request_count INTEGER NOT NULL DEFAULT 1,
  reset_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier ON rate_limits(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- RLS policies
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role full access to rate_limits"
  ON rate_limits
  USING (true)
  WITH CHECK (true);

-- No public access - rate limiting is server-side only

-- Atomic rate limit check function (prevents race conditions)
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_max_requests INTEGER,
  p_window_ms INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_now TIMESTAMPTZ := NOW();
  v_reset_at TIMESTAMPTZ;
  v_count INTEGER;
  v_allowed BOOLEAN;
  v_remaining INTEGER;
BEGIN
  v_reset_at := v_now + (p_window_ms || ' milliseconds')::INTERVAL;

  -- Try to insert or update atomically
  INSERT INTO rate_limits (identifier, request_count, reset_at)
  VALUES (p_identifier, 1, v_reset_at)
  ON CONFLICT (identifier)
  DO UPDATE SET
    request_count = CASE
      WHEN rate_limits.reset_at < v_now THEN 1
      ELSE rate_limits.request_count + 1
    END,
    reset_at = CASE
      WHEN rate_limits.reset_at < v_now THEN v_reset_at
      ELSE rate_limits.reset_at
    END;

  -- Get the current count after upsert
  SELECT request_count, reset_at INTO v_count, v_reset_at
  FROM rate_limits
  WHERE identifier = p_identifier;

  IF v_count > p_max_requests THEN
    v_allowed := false;
    v_remaining := 0;
  ELSE
    v_allowed := true;
    v_remaining := p_max_requests - v_count;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'remaining', v_remaining,
    'reset_at', v_reset_at
  );
END;
$$;

-- Cleanup function to remove expired rate limit entries
CREATE OR REPLACE FUNCTION cleanup_expired_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits WHERE reset_at < NOW();
END;
$$ LANGUAGE plpgsql;
