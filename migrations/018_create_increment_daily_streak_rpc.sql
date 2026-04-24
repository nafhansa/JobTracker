-- Migration: Create atomic increment_daily_streak RPC function
-- This replaces the read-then-write pattern to eliminate race conditions

CREATE OR REPLACE FUNCTION increment_daily_streak(
  p_user_id UUID,
  p_current_date DATE
)
RETURNS JSON
LANGUAGE plpgsql
AS $$
DECLARE
  v_existing RECORD;
  v_new_streak INT;
  v_new_best INT;
  v_consecutive_days JSONB;
  v_diff_days INT;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT * INTO v_existing FROM user_streaks WHERE user_id = p_user_id FOR UPDATE;

  IF NOT FOUND THEN
    -- Create new streak record
    INSERT INTO user_streaks (id, user_id, current_streak, best_streak, last_active_date, consecutive_days)
    VALUES (
      gen_random_uuid(),
      p_user_id,
      1,
      1,
      p_current_date,
      to_jsonb(ARRAY[p_current_date::text])
    );

    RETURN json_build_object(
      'current', 1,
      'best', 1
    );
  END IF;

  -- Calculate day difference
  v_diff_days := p_current_date - (v_existing.last_active_date::date);

  IF v_diff_days = 1 THEN
    -- Continue streak (yesterday was active)
    v_new_streak := v_existing.current_streak + 1;
    v_new_best := GREATEST(v_existing.best_streak, v_new_streak);

    -- Parse existing consecutive_days and add new date
    IF v_existing.consecutive_days IS NOT NULL THEN
      v_consecutive_days := v_existing.consecutive_days::jsonb || to_jsonb(ARRAY[p_current_date::text]);
    ELSE
      v_consecutive_days := to_jsonb(ARRAY[p_current_date::text]);
    END IF;
  ELSIF v_diff_days = 0 THEN
    -- Same day, no streak change
    v_new_streak := v_existing.current_streak;
    v_new_best := v_existing.best_streak;
    v_consecutive_days := COALESCE(v_existing.consecutive_days::jsonb, to_jsonb(ARRAY[p_current_date::text]));
  ELSE
    -- Streak broken (gap of 2+ days)
    v_new_streak := 1;
    v_new_best := v_existing.best_streak;
    v_consecutive_days := to_jsonb(ARRAY[p_current_date::text]);
  END IF;

  -- Only keep last 100 days for performance
  IF jsonb_array_length(v_consecutive_days) > 100 THEN
    v_consecutive_days := (
      SELECT to_jsonb(arr)
      FROM (
        SELECT array_agg(elem::text) AS arr
        FROM jsonb_array_elements(v_consecutive_days) AS elem
        OFFSET jsonb_array_length(v_consecutive_days) - 100
      ) sub
    );
  END IF;

  -- Update streak atomically
  UPDATE user_streaks SET
    current_streak = v_new_streak,
    best_streak = v_new_best,
    last_active_date = p_current_date,
    consecutive_days = v_consecutive_days,
    updated_at = NOW()
  WHERE user_id = p_user_id;

  RETURN json_build_object(
    'current', v_new_streak,
    'best', v_new_best
  );
END;
$$;