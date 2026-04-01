-- Migration: Create freelance_jobs table for Client Tracker
-- Optimized for 10,000+ users

-- Create freelance_jobs table
CREATE TABLE IF NOT EXISTS freelance_jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_contact TEXT,
  service_type TEXT NOT NULL,
  product TEXT NOT NULL,
  potential_price NUMERIC,
  actual_price NUMERIC,
  currency TEXT NOT NULL DEFAULT 'IDR',
  start_date DATE,
  end_date DATE,
  duration_days INTEGER,
  status TEXT NOT NULL DEFAULT 'ongoing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance optimization
CREATE INDEX idx_freelance_jobs_user_id ON freelance_jobs(user_id);
CREATE INDEX idx_freelance_jobs_user_status ON freelance_jobs(user_id, status);
CREATE INDEX idx_freelance_jobs_user_created ON freelance_jobs(user_id, created_at DESC);
CREATE INDEX idx_freelance_jobs_client_name ON freelance_jobs(user_id, client_name);
CREATE INDEX idx_freelance_jobs_start_date ON freelance_jobs(user_id, start_date);

-- Enable RLS
ALTER TABLE freelance_jobs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own freelance jobs" ON freelance_jobs
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own freelance jobs" ON freelance_jobs
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own freelance jobs" ON freelance_jobs
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own freelance jobs" ON freelance_jobs
  FOR DELETE USING (auth.uid()::text = user_id);

-- Trigger function for auto-updating updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to freelance_jobs
CREATE TRIGGER update_freelance_jobs_updated_at
  BEFORE UPDATE ON freelance_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add check constraint for status
ALTER TABLE freelance_jobs
  ADD CONSTRAINT check_freelance_job_status
  CHECK (status IN ('ongoing', 'completed', 'cancelled'));