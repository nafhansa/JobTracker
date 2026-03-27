-- Migration: Onboarding System
-- Creates tables for user onboarding flow: language selection + 4 questions
-- Performance optimized for 10,000+ users

-- ============================================
-- PART 1: Add columns to users table
-- ============================================

ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'id' CHECK (language IN ('id', 'en')),
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_users_onboarding ON users(onboarding_completed) WHERE onboarding_completed = false;

-- ============================================
-- PART 2: Create job_roles table (predefined roles for autocomplete)
-- ============================================

CREATE TABLE IF NOT EXISTS job_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_id TEXT,
  category TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  search_vector TSVECTOR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_job_roles_category ON job_roles(category);
CREATE INDEX IF NOT EXISTS idx_job_roles_active ON job_roles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_job_roles_sort ON job_roles(sort_order);
CREATE INDEX IF NOT EXISTS idx_job_roles_search ON job_roles USING GIN(search_vector);

CREATE OR REPLACE FUNCTION update_job_roles_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('simple', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.name_id, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS job_roles_search_trigger ON job_roles;
CREATE TRIGGER job_roles_search_trigger
  BEFORE INSERT OR UPDATE ON job_roles
  FOR EACH ROW EXECUTE FUNCTION update_job_roles_search_vector();

-- Enable pg_trgm for ILIKE optimization (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- PART 3: Create user_onboarding table
-- ============================================

CREATE TABLE IF NOT EXISTS user_onboarding (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  
  job_search_stage TEXT NOT NULL CHECK (
    job_search_stage IN ('just_started', 'applied_some', 'actively_interviewing', 'employed_looking')
  ),
  
  target_roles JSONB DEFAULT '[]'::jsonb,
  
  work_preferences TEXT[] DEFAULT '{}',
  
  experience_level TEXT NOT NULL CHECK (
    experience_level IN ('no_experience', 'internship_only', 'less_than_1_year', 'one_to_three_years', 'three_plus_years')
  ),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON user_onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_target_roles ON user_onboarding USING GIN(target_roles);
CREATE INDEX IF NOT EXISTS idx_user_onboarding_work_prefs ON user_onboarding USING GIN(work_preferences);

-- ============================================
-- PART 4: Create updated_at trigger function (if not exists)
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_onboarding_timestamp ON user_onboarding;
CREATE TRIGGER update_user_onboarding_timestamp
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- PART 5: RLS Policies
-- ============================================

ALTER TABLE job_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

-- job_roles: readable by all
DROP POLICY IF EXISTS job_roles_select_all ON job_roles;
CREATE POLICY job_roles_select_all ON job_roles
  FOR SELECT USING (true);

-- user_onboarding: user can only read/write their own data
DROP POLICY IF EXISTS user_onboarding_select_own ON user_onboarding;
CREATE POLICY user_onboarding_select_own ON user_onboarding
  FOR SELECT USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS user_onboarding_insert_own ON user_onboarding;
CREATE POLICY user_onboarding_insert_own ON user_onboarding
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS user_onboarding_update_own ON user_onboarding;
CREATE POLICY user_onboarding_update_own ON user_onboarding
  FOR UPDATE USING (auth.uid()::text = user_id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON job_roles TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON user_onboarding TO authenticated;

-- ============================================
-- PART 6: Seed job_roles data
-- ============================================

INSERT INTO job_roles (name, name_id, category, sort_order) VALUES
-- Engineering
('Software Engineer', 'Insinyur Perangkat Lunak', 'Engineering', 1),
('Frontend Developer', 'Frontend Developer', 'Engineering', 2),
('Backend Developer', 'Backend Developer', 'Engineering', 3),
('Full Stack Developer', 'Full Stack Developer', 'Engineering', 4),
('Mobile Developer', 'Mobile Developer', 'Engineering', 5),
('iOS Developer', 'iOS Developer', 'Engineering', 6),
('Android Developer', 'Android Developer', 'Engineering', 7),
('DevOps Engineer', 'DevOps Engineer', 'Engineering', 8),
('Site Reliability Engineer', 'Site Reliability Engineer', 'Engineering', 9),
('QA Engineer', 'QA Engineer', 'Engineering', 10),
('Test Engineer', 'Test Engineer', 'Engineering', 11),
('Security Engineer', 'Security Engineer', 'Engineering', 12),
('Data Engineer', 'Data Engineer', 'Engineering', 13),
('Cloud Engineer', 'Cloud Engineer', 'Engineering', 14),
('System Administrator', 'Administrator Sistem', 'Engineering', 15),
('Tech Lead', 'Tech Lead', 'Engineering', 16),
('Engineering Manager', 'Engineering Manager', 'Engineering', 17),
('CTO', 'CTO', 'Engineering', 18),

-- Design
('UI/UX Designer', 'UI/UX Designer', 'Design', 20),
('Product Designer', 'Product Designer', 'Design', 21),
('Graphic Designer', 'Desainer Grafis', 'Design', 22),
('UX Researcher', 'UX Researcher', 'Design', 23),
('Visual Designer', 'Desainer Visual', 'Design', 24),
('Motion Designer', 'Motion Designer', 'Design', 25),
('UI Designer', 'UI Designer', 'Design', 26),
('UX Designer', 'UX Designer', 'Design', 27),
('Design Lead', 'Design Lead', 'Design', 28),
('Creative Director', 'Creative Director', 'Design', 29),

-- Product & Management
('Product Manager', 'Product Manager', 'Product', 30),
('Product Owner', 'Product Owner', 'Product', 31),
('Project Manager', 'Project Manager', 'Product', 32),
('Scrum Master', 'Scrum Master', 'Product', 33),
('Business Analyst', 'Business Analyst', 'Product', 34),
('Program Manager', 'Program Manager', 'Product', 35),
('Head of Product', 'Head of Product', 'Product', 36),

-- Data & AI
('Data Scientist', 'Data Scientist', 'Data', 40),
('Data Analyst', 'Data Analyst', 'Data', 41),
('Machine Learning Engineer', 'Machine Learning Engineer', 'Data', 42),
('AI Engineer', 'AI Engineer', 'Data', 43),
('Business Intelligence Analyst', 'Business Intelligence Analyst', 'Data', 44),
('Data Architect', 'Data Architect', 'Data', 45),
('Research Scientist', 'Research Scientist', 'Data', 46),
('NLP Engineer', 'NLP Engineer', 'Data', 47),
('Computer Vision Engineer', 'Computer Vision Engineer', 'Data', 48),

-- Marketing
('Marketing Manager', 'Marketing Manager', 'Marketing', 50),
('Digital Marketing Specialist', 'Spesialis Digital Marketing', 'Marketing', 51),
('Content Marketing Manager', 'Content Marketing Manager', 'Marketing', 52),
('SEO Specialist', 'Spesialis SEO', 'Marketing', 53),
('Social Media Manager', 'Social Media Manager', 'Marketing', 54),
('Growth Hacker', 'Growth Hacker', 'Marketing', 55),
('Brand Manager', 'Brand Manager', 'Marketing', 56),
('Marketing Analyst', 'Marketing Analyst', 'Marketing', 57),
('Performance Marketing', 'Performance Marketing', 'Marketing', 58),
('Email Marketing Specialist', 'Spesialis Email Marketing', 'Marketing', 59),

-- Sales
('Sales Manager', 'Sales Manager', 'Sales', 60),
('Account Executive', 'Account Executive', 'Sales', 61),
('Business Development', 'Business Development', 'Sales', 62),
('Sales Representative', 'Sales Representative', 'Sales', 63),
('Enterprise Sales', 'Enterprise Sales', 'Sales', 64),
('Sales Engineer', 'Sales Engineer', 'Sales', 65),

-- Finance & Accounting
('Finance Manager', 'Finance Manager', 'Finance', 70),
('Accountant', 'Akuntan', 'Finance', 71),
('Financial Analyst', 'Financial Analyst', 'Finance', 72),
('Tax Specialist', 'Spesialis Pajak', 'Finance', 73),
('Auditor', 'Auditor', 'Finance', 74),
('Controller', 'Controller', 'Finance', 75),
('CFO', 'CFO', 'Finance', 76),
('Treasury Analyst', 'Treasury Analyst', 'Finance', 77),

-- HR & Operations
('HR Manager', 'HR Manager', 'HR', 80),
('Recruiter', 'Recruiter', 'HR', 81),
('Talent Acquisition', 'Talent Acquisition', 'HR', 82),
('People Operations', 'People Operations', 'HR', 83),
('HR Business Partner', 'HR Business Partner', 'HR', 84),
('Operations Manager', 'Operations Manager', 'Operations', 85),
('Administrative Assistant', 'Asisten Administrasi', 'Operations', 86),
('Office Manager', 'Office Manager', 'Operations', 87),
('Executive Assistant', 'Executive Assistant', 'Operations', 88),

-- Customer Success
('Customer Success Manager', 'Customer Success Manager', 'Customer Success', 90),
('Customer Support', 'Customer Support', 'Customer Success', 91),
('Technical Support', 'Technical Support', 'Customer Success', 92),
('Account Manager', 'Account Manager', 'Customer Success', 93),
('Customer Experience', 'Customer Experience', 'Customer Success', 94),

-- Creative & Content
('Content Writer', 'Content Writer', 'Content', 100),
('Copywriter', 'Copywriter', 'Content', 101),
('Video Editor', 'Video Editor', 'Content', 102),
('Creative Director', 'Creative Director', 'Content', 103),
('Art Director', 'Art Director', 'Content', 104),
('Content Strategist', 'Content Strategist', 'Content', 105),
('Technical Writer', 'Technical Writer', 'Content', 106),

-- Other Common Roles
('Consultant', 'Konsultan', 'Other', 110),
('Analyst', 'Analis', 'Other', 111),
('Intern', 'Intern', 'Other', 112),
('Freelancer', 'Freelancer', 'Other', 113),
('Co-founder', 'Co-founder', 'Other', 114),
('CEO', 'CEO', 'Other', 115),
('COO', 'COO', 'Other', 116)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PART 7: Functions for onboarding
-- ============================================

CREATE OR REPLACE FUNCTION check_onboarding_status(p_user_id TEXT)
RETURNS TABLE (
  onboarding_completed BOOLEAN,
  language TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(u.onboarding_completed, false) as onboarding_completed,
    COALESCE(u.language, 'id') as language
  FROM users u
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION complete_user_onboarding(
  p_user_id TEXT,
  p_language TEXT,
  p_job_search_stage TEXT,
  p_target_roles JSONB,
  p_work_preferences TEXT[],
  p_experience_level TEXT
) RETURNS VOID AS $$
BEGIN
  UPDATE users 
  SET 
    language = p_language,
    onboarding_completed = true,
    onboarding_completed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_user_id;

  INSERT INTO user_onboarding (
    id, 
    user_id, 
    job_search_stage, 
    target_roles, 
    work_preferences, 
    experience_level
  ) VALUES (
    p_user_id,
    p_user_id,
    p_job_search_stage,
    p_target_roles,
    p_work_preferences,
    p_experience_level
  )
  ON CONFLICT (user_id) DO UPDATE SET
    job_search_stage = EXCLUDED.job_search_stage,
    target_roles = EXCLUDED.target_roles,
    work_preferences = EXCLUDED.work_preferences,
    experience_level = EXCLUDED.experience_level,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;