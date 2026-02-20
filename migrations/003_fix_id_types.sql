-- Fix ID Types Migration
-- This migration changes UUID columns to TEXT to support Firebase document IDs
-- Run this if you already created tables with UUID type

-- Drop existing tables if they exist (will recreate with TEXT IDs)
DROP TABLE IF EXISTS analytics_micro_conversions CASCADE;
DROP TABLE IF EXISTS analytics_active_users CASCADE;
DROP TABLE IF EXISTS analytics_dashboard_visits CASCADE;
DROP TABLE IF EXISTS analytics_logins CASCADE;
DROP TABLE IF EXISTS analytics_visits CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Now run 001_initial_schema.sql again to create tables with TEXT IDs
