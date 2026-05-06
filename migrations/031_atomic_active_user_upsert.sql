-- ===========================================
-- 031: Atomic active user upsert + unique constraint
-- Fixes race condition in analytics_active_users
-- ===========================================

-- Add unique constraint to enable atomic upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'analytics_active_users_user_id_key'
  ) THEN
    ALTER TABLE analytics_active_users ADD CONSTRAINT analytics_active_users_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Atomic upsert for active users (prevents duplicate records)
CREATE OR REPLACE FUNCTION update_active_user_atomic(
  p_user_id TEXT,
  p_user_email TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO analytics_active_users (user_id, user_email, last_seen)
  VALUES (p_user_id, COALESCE(p_user_email, ''), NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    user_email = COALESCE(EXCLUDED.user_email, analytics_active_users.user_email),
    last_seen = NOW();
END;
$$ LANGUAGE plpgsql;
