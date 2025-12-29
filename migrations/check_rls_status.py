#!/usr/bin/env python3
"""
Check RLS Status via Management API
"""

import os
from pathlib import Path
from dotenv import load_dotenv
import requests

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

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=60)

        if response.status_code in [200, 201]:
            try:
                result = response.json()
                return result
            except:
                return None
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Response: {response.text}")
            return None

    except Exception as e:
        print(f"❌ Exception: {e}")
        return None

def main():
    """Main execution"""

    print("\n" + "="*60)
    print("  RLS STATUS CHECK")
    print("="*60)

    # Check RLS status
    rls_check_sql = """
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
"""

    print("\n🔍 Checking RLS Status...")
    result = execute_sql(rls_check_sql)

    if result:
        print("\n📋 Tables and RLS Status:")
        print(f"{'Table Name':30s} {'RLS Enabled':15s}")
        print("-" * 50)

        if isinstance(result, list) and len(result) > 0:
            for row in result:
                table_name = row.get('tablename', 'unknown')
                rls_enabled = '✅ ENABLED' if row.get('rls_enabled') else '❌ DISABLED'
                print(f"{table_name:30s} {rls_enabled:15s}")
        else:
            print("No data returned")

    # Check policies
    print("\n🔐 Checking RLS Policies...")
    policy_check_sql = """
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
"""

    result = execute_sql(policy_check_sql)

    if result:
        print("\n📜 RLS Policies:")

        current_table = None
        if isinstance(result, list):
            for row in result:
                table_name = row.get('tablename', 'unknown')
                policy_name = row.get('policyname', 'unknown')
                cmd = row.get('cmd', 'unknown')

                if current_table != table_name:
                    current_table = table_name
                    print(f"\n  📁 {table_name}:")

                print(f"     - {policy_name} ({cmd})")

    # Count check
    print("\n📊 Table Count:")
    count_sql = """
SELECT COUNT(*) as table_count
FROM pg_tables
WHERE schemaname = 'public';
"""

    result = execute_sql(count_sql)
    if result and isinstance(result, list) and len(result) > 0:
        count = result[0].get('table_count', 0)
        print(f"   Total tables in public schema: {count}")
        if count == 11:
            print(f"   ✅ Correct! Expected 11 tables.")
        else:
            print(f"   ⚠️  Warning: Expected 11 tables, found {count}")

    print("\n" + "="*60)
    print("  ✅ RLS CHECK COMPLETE")
    print("="*60)
    print("\n")

if __name__ == '__main__':
    main()
