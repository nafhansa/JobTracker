-- Migration: Add salary range support
-- Run this manually in Supabase SQL Editor

-- Add new columns for salary range
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS potential_salary_min NUMERIC;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS potential_salary_max NUMERIC;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_type TEXT DEFAULT 'exact';

-- Migrate existing data: old salary becomes min value (exact mode)
UPDATE jobs 
SET potential_salary_min = potential_salary,
    salary_type = 'exact'
WHERE potential_salary IS NOT NULL AND potential_salary_min IS NULL;

-- Set salary_type to 'unspecified' for jobs without salary
UPDATE jobs 
SET salary_type = 'unspecified' 
WHERE salary_type IS NULL AND potential_salary_min IS NULL;

-- Optional: Keep old column for backward compatibility
-- If you want to drop the old column later, run:
-- ALTER TABLE jobs DROP COLUMN potential_salary;