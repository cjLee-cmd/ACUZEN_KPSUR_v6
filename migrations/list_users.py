#!/usr/bin/env python3
"""
List All Users via Management API
"""

import os
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
    print("  👥 ALL USERS LIST")
    print("="*60)

    # List all users
    list_users_sql = """
SELECT
    email,
    name,
    role,
    created_at
FROM users
ORDER BY created_at;
"""

    print("\n🔍 Fetching users...")
    result = execute_sql(list_users_sql)

    if result:
        print("\n📋 Users in Database:")
        print(f"\n{'Email':30s} {'Name':20s} {'Role':10s} {'Created':20s}")
        print("-" * 85)

        if isinstance(result, list) and len(result) > 0:
            for row in result:
                email = row.get('email', 'unknown')
                name = row.get('name', 'unknown')
                role = row.get('role', 'unknown')
                created = str(row.get('created_at', 'unknown'))[:19]
                print(f"{email:30s} {name:20s} {role:10s} {created:20s}")

            print(f"\n   Total users: {len(result)}")
        else:
            print("No users found")

    print("\n" + "="*60)
    print("  ✅ LIST COMPLETE")
    print("="*60)
    print("\n")

if __name__ == '__main__':
    main()
