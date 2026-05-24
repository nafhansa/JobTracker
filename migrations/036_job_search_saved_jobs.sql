-- Job Search: saved_jobs table for bookmarking external job listings
-- Note: Using TEXT for user_id to match Firebase UID format (not UUID)
CREATE TABLE IF NOT EXISTS saved_jobs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  job_url TEXT,
  job_url_direct TEXT,
  description TEXT,
  job_type TEXT,
  is_remote BOOLEAN DEFAULT FALSE,
  min_amount NUMERIC,
  max_amount NUMERIC,
  currency TEXT DEFAULT 'USD',
  salary_source TEXT,
  salary_interval TEXT,
  date_posted TEXT,
  site TEXT,
  company_url TEXT,
  company_industry TEXT,
  company_logo TEXT,
  source_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_site ON saved_jobs(site);

-- Prevent duplicate saves of the same job URL for the same user
CREATE UNIQUE INDEX IF NOT EXISTS idx_saved_jobs_user_job_url ON saved_jobs(user_id, job_url) WHERE job_url IS NOT NULL;

-- RLS policies (service role bypasses RLS, but add for safety)
ALTER TABLE saved_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can do everything on saved_jobs" ON saved_jobs
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================================
-- ROLLBACK (uncomment to remove this feature entirely):
-- DROP TABLE IF EXISTS saved_jobs CASCADE;
-- =====================================================================