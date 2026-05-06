-- Performance indexes for scalability
-- Addresses missing composite indexes for common query patterns

-- Composite index for jobs subscription query (user_id + created_at DESC)
CREATE INDEX IF NOT EXISTS idx_jobs_user_created ON jobs(user_id, created_at DESC);

-- Composite index for freelance jobs subscription query
CREATE INDEX IF NOT EXISTS idx_freelance_jobs_user_created ON freelance_jobs(user_id, created_at DESC);

-- Index for rate_limits cleanup
CREATE INDEX IF NOT EXISTS idx_rate_limits_reset_at ON rate_limits(reset_at);

-- Index for analytics active users query (last_seen)
CREATE INDEX IF NOT EXISTS idx_analytics_active_users_last_seen ON analytics_active_users(last_seen DESC);

-- Composite index for analytics dashboard visits (user_id + timestamp)
CREATE INDEX IF NOT EXISTS idx_analytics_dashboard_user_time ON analytics_dashboard_visits(user_id, timestamp DESC);

-- Composite index for analytics logins (user_id + timestamp)
CREATE INDEX IF NOT EXISTS idx_analytics_logins_user_time ON analytics_logins(user_id, timestamp DESC);
