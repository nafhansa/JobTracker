-- Initial Schema Migration for Supabase
-- This migration creates all necessary tables for JobTracker application

-- Jobs Table
-- Note: Using TEXT for IDs to support Firebase document IDs (not UUIDs)
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL, -- Firebase UID (TEXT, not UUID)
  job_title TEXT NOT NULL DEFAULT 'Unknown Job Title',
  company TEXT NOT NULL DEFAULT 'Unknown Company', -- Allow null in data but set default
  industry TEXT NOT NULL DEFAULT 'Unknown Industry', -- Allow null in data but set default
  recruiter_email TEXT,
  application_url TEXT,
  job_type TEXT,
  location TEXT,
  potential_salary NUMERIC,
  currency TEXT NOT NULL DEFAULT 'IDR',
  status_applied BOOLEAN DEFAULT false,
  status_emailed BOOLEAN DEFAULT false,
  status_cv_responded BOOLEAN DEFAULT false,
  status_interview_email BOOLEAN DEFAULT false,
  status_contract_email BOOLEAN DEFAULT false,
  status_rejected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Users Table (additional user data beyond auth.users)
-- Note: id is Firebase UID (TEXT, not UUID)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, -- Firebase UID
  email TEXT,
  subscription_plan TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  is_pro BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions Table
-- Note: Using TEXT for IDs to support Firebase document IDs
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY, -- Firebase document ID
  user_id TEXT NOT NULL, -- Firebase UID
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  renews_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Analytics Tables
-- Note: Using TEXT for IDs to support Firebase document IDs
CREATE TABLE IF NOT EXISTS analytics_visits (
  id TEXT PRIMARY KEY, -- Firebase document ID
  type TEXT DEFAULT 'visit',
  page TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  device_info JSONB,
  ip_address TEXT,
  country TEXT,
  country_code TEXT
);

CREATE TABLE IF NOT EXISTS analytics_logins (
  id TEXT PRIMARY KEY, -- Firebase document ID
  type TEXT DEFAULT 'login',
  user_id TEXT, -- Firebase UID (TEXT, not UUID)
  user_email TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  device_info JSONB,
  ip_address TEXT,
  country TEXT,
  country_code TEXT
);

CREATE TABLE IF NOT EXISTS analytics_dashboard_visits (
  id TEXT PRIMARY KEY, -- Firebase document ID
  type TEXT DEFAULT 'dashboard',
  user_id TEXT, -- Firebase UID (TEXT, not UUID)
  user_email TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  session_id TEXT,
  device_info JSONB,
  ip_address TEXT,
  country TEXT,
  country_code TEXT
);

CREATE TABLE IF NOT EXISTS analytics_active_users (
  id TEXT PRIMARY KEY, -- Firebase document ID
  user_id TEXT, -- Firebase UID (TEXT, not UUID)
  user_email TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_micro_conversions (
  id TEXT PRIMARY KEY, -- Firebase document ID
  type TEXT NOT NULL,
  value NUMERIC,
  session_id TEXT,
  page TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics tables
CREATE INDEX IF NOT EXISTS idx_analytics_visits_timestamp ON analytics_visits(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_logins_user_id ON analytics_logins(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_logins_timestamp ON analytics_logins(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboard_visits_user_id ON analytics_dashboard_visits(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_dashboard_visits_timestamp ON analytics_dashboard_visits(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_active_users_user_id ON analytics_active_users(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_active_users_last_seen ON analytics_active_users(last_seen DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_micro_conversions_type ON analytics_micro_conversions(type);
CREATE INDEX IF NOT EXISTS idx_analytics_micro_conversions_timestamp ON analytics_micro_conversions(timestamp DESC);
