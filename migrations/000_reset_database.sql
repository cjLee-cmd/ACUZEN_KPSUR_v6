-- ============================================================================
-- KSUR Database Reset Script
-- ============================================================================
-- ⚠️  WARNING: This will DELETE ALL data and tables!
-- Created: 2025-12-29
-- ============================================================================

-- Drop all tables in reverse order (to handle foreign key constraints)
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS file_matching_table CASCADE;
DROP TABLE IF EXISTS llm_dialogs CASCADE;
DROP TABLE IF EXISTS review_changes CASCADE;
DROP TABLE IF EXISTS report_sections CASCADE;
DROP TABLE IF EXISTS extracted_data CASCADE;
DROP TABLE IF EXISTS markdown_documents CASCADE;
DROP TABLE IF EXISTS source_documents CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================================================
-- Reset Complete
-- ============================================================================

-- Verify all tables are deleted
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- This query should return empty result (0 rows)
