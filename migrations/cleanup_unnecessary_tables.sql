-- ============================================================================
-- Cleanup Unnecessary Tables
-- ============================================================================
-- Remove tables that are not part of the official schema
-- Created: 2025-12-29

-- Drop unnecessary tables
DROP TABLE IF EXISTS cs_data CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS final_reports CASCADE;
DROP TABLE IF EXISTS placeholders CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS raw_data CASCADE;
DROP TABLE IF EXISTS report_versions CASCADE;
DROP TABLE IF EXISTS section_drafts CASCADE;
DROP TABLE IF EXISTS test_titanic CASCADE;
DROP TABLE IF EXISTS test_users CASCADE;
DROP TABLE IF EXISTS titanic CASCADE;
DROP TABLE IF EXISTS uploaded_files CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;

-- ============================================================================
-- Cleanup Complete
-- ============================================================================
