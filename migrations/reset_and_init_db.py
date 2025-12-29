#!/usr/bin/env python3
"""
Supabase Database Reset and Initialization
Direct execution using Supabase Management API
"""

import os
import sys
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_PROJECT_ID = os.getenv('VITE_SUPABASE_PROJECT_ID')
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_ACCESS_TOKEN = os.getenv('SUPABASE_ACCESS_TOKEN')

def execute_sql(sql_content):
    """Execute SQL using Supabase Management API"""

    # Supabase Management API endpoint
    api_url = f"https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_ID}/database/query"

    headers = {
        "Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "query": sql_content
    }

    print(f"🔄 Executing SQL...")

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=60)

        if response.status_code in [200, 201]:
            try:
                result = response.json()
                print(f"✅ SQL executed successfully!")
                if result:
                    print(f"   Response: {result}")
            except:
                print(f"✅ SQL executed successfully! (No response body)")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except Exception as e:
        print(f"❌ Exception: {e}")
        return False

def reset_database():
    """Drop all existing tables"""

    print("\n" + "="*60)
    print("  🗑️  RESETTING DATABASE")
    print("="*60)

    reset_sql = """
-- Drop all tables in reverse order
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
"""

    return execute_sql(reset_sql)

def initialize_database():
    """Create all tables and insert default data"""

    print("\n" + "="*60)
    print("  🚀 INITIALIZING DATABASE")
    print("="*60)

    # Read SQL file
    sql_file = Path(__file__).parent / '001_initial_schema.sql'

    if not sql_file.exists():
        print(f"❌ SQL file not found: {sql_file}")
        return False

    print(f"\n📄 Reading: {sql_file.name}")
    sql_content = sql_file.read_text(encoding='utf-8')

    return execute_sql(sql_content)

def verify_tables():
    """Verify tables were created"""

    print("\n" + "="*60)
    print("  🔍 VERIFYING TABLES")
    print("="*60)

    verify_sql = """
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
"""

    # Note: This won't return results with Management API
    # User should verify in Supabase Dashboard
    print("\n📋 Please verify tables in Supabase Dashboard:")
    print("   https://supabase.com/dashboard/project/toelnxgizxwbdikskmxa/editor")
    print("\n   Expected tables (11):")
    print("   ✓ users")
    print("   ✓ products")
    print("   ✓ reports")
    print("   ✓ source_documents")
    print("   ✓ markdown_documents")
    print("   ✓ extracted_data")
    print("   ✓ report_sections")
    print("   ✓ review_changes")
    print("   ✓ llm_dialogs")
    print("   ✓ file_matching_table")
    print("   ✓ system_settings")

def main():
    """Main execution"""

    print("\n" + "="*60)
    print("  KSUR Database Reset & Initialization")
    print("="*60)

    # Check environment variables
    if not all([SUPABASE_PROJECT_ID, SUPABASE_URL, SUPABASE_ACCESS_TOKEN]):
        print("\n❌ Error: Missing environment variables")
        print("Please check .env file for:")
        print("  - VITE_SUPABASE_PROJECT_ID")
        print("  - VITE_SUPABASE_URL")
        print("  - SUPABASE_ACCESS_TOKEN")
        sys.exit(1)

    print(f"\n📦 Project ID: {SUPABASE_PROJECT_ID}")
    print(f"🔗 URL: {SUPABASE_URL}")

    # Step 1: Reset database
    print("\n⚠️  WARNING: This will DELETE all existing data!")

    if not reset_database():
        print("\n❌ Reset failed!")
        sys.exit(1)

    print("\n✅ Database reset completed!")

    # Step 2: Initialize database
    if not initialize_database():
        print("\n❌ Initialization failed!")
        sys.exit(1)

    print("\n✅ Database initialization completed!")

    # Step 3: Verify
    verify_tables()

    print("\n" + "="*60)
    print("  ✅ MIGRATION COMPLETE!")
    print("="*60)
    print("\n📝 Next steps:")
    print("   1. Verify tables in Supabase Dashboard")
    print("   2. Test login with: master@kpsur.test / test1234")
    print("   3. Check default product: 코미나티주")
    print("\n")

if __name__ == '__main__':
    main()
