#!/usr/bin/env python3
"""
Cleanup Unnecessary Database Tables
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

SUPABASE_PROJECT_ID = os.getenv('VITE_SUPABASE_PROJECT_ID')
SUPABASE_ACCESS_TOKEN = os.getenv('SUPABASE_ACCESS_TOKEN')

def execute_sql(sql_content):
    """Execute SQL using Supabase Management API"""

    api_url = f"https://api.supabase.com/v1/projects/{SUPABASE_PROJECT_ID}/database/query"

    headers = {
        "Authorization": f"Bearer {SUPABASE_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {"query": sql_content}

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

def main():
    """Main execution"""

    print("\n" + "="*60)
    print("  🧹 CLEANUP UNNECESSARY TABLES")
    print("="*60)

    # Read SQL file
    sql_file = Path(__file__).parent / 'cleanup_unnecessary_tables.sql'

    if not sql_file.exists():
        print(f"❌ SQL file not found: {sql_file}")
        sys.exit(1)

    print(f"\n📄 Reading: {sql_file.name}")
    sql_content = sql_file.read_text(encoding='utf-8')

    if not execute_sql(sql_content):
        print("\n❌ Cleanup failed!")
        sys.exit(1)

    print("\n✅ Cleanup completed!")
    print("\n" + "="*60)
    print("  ✅ CLEANUP COMPLETE!")
    print("="*60)
    print("\n📝 Deleted tables:")
    print("   - cs_data")
    print("   - documents")
    print("   - final_reports")
    print("   - placeholders")
    print("   - profiles")
    print("   - raw_data")
    print("   - report_versions")
    print("   - section_drafts")
    print("   - test_titanic")
    print("   - test_users")
    print("   - titanic")
    print("   - uploaded_files")
    print("   - user_roles")
    print("\n")

if __name__ == '__main__':
    main()
