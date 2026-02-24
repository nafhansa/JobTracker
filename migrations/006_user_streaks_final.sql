-- User Streaks Table (Daily Only) - Ultra Simple Version

-- Drop existing objects
DROP FUNCTION IF EXISTS trigger_on_job_added_daily_streak() CASCADE;
DROP FUNCTION IF EXISTS increment_daily_streak CASCADE;
DROP TABLE IF EXISTS user_streaks CASCADE;

-- Create table
CREATE TABLE user_streaks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_active_date DATE,
  consecutive_days JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE INDEX idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX idx_user_streaks_last_active ON user_streaks(last_active_date DESC);

-- Function to increment daily streak
CREATE OR REPLACE FUNCTION increment_daily_streak(user_id_param TEXT)
RETURNS VOID AS $$
DECLARE
  current_date_val DATE := CURRENT_DATE;
  existing_streak RECORD;
BEGIN
  SELECT * INTO existing_streak
  FROM user_streaks
  WHERE user_id = user_id_param;

  IF NOT FOUND THEN
    INSERT INTO user_streaks (id, user_id, current_streak, best_streak, last_active_date, consecutive_days)
    VALUES (
      md5(random()::text),
      user_id_param,
      1,
      1,
      current_date_val,
      to_jsonb(ARRAY[current_date_val])
    );
  ELSE
    IF existing_streak.last_active_date = current_date_val - INTERVAL '1 day' THEN
      UPDATE user_streaks
      SET
        current_streak = existing_streak.current_streak + 1,
        best_streak = GREATEST(existing_streak.best_streak, existing_streak.current_streak + 1),
        last_active_date = current_date_val,
        consecutive_days = jsonb_set(existing_streak.consecutive_days, current_date_val::text),
        updated_at = NOW()
      WHERE id = existing_streak.id;
    ELSIF existing_streak.last_active_date < current_date_val - INTERVAL '1 day' THEN
      UPDATE user_streaks
      SET
        current_streak = 1,
        best_streak = GREATEST(existing_streak.best_streak, 1),
        last_active_date = current_date_val,
        consecutive_days = to_jsonb(ARRAY[current_date_val]),
        updated_at = NOW()
      WHERE id = existing_streak.id;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Update daily streak when new job is added
CREATE OR REPLACE FUNCTION trigger_on_job_added_daily_streak()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM increment_daily_streak(NEW.user_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER job_added_daily_streak_trigger
AFTER INSERT ON jobs
FOR EACH ROW
EXECUTE FUNCTION trigger_on_job_added_daily_streak();
