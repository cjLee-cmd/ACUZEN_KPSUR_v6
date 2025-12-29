#!/usr/bin/env python3
"""
Add Main Master User Account
"""

import os
import sys
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
    print("  👤 ADD MAIN MASTER USER")
    print("="*60)

    # Read SQL file
    sql_file = Path(__file__).parent / 'add_main_user.sql'

    if not sql_file.exists():
        print(f"❌ SQL file not found: {sql_file}")
        sys.exit(1)

    print(f"\n📄 Reading: {sql_file.name}")
    sql_content = sql_file.read_text(encoding='utf-8')

    if not execute_sql(sql_content):
        print("\n❌ User creation failed!")
        sys.exit(1)

    print("\n✅ User created successfully!")
    print("\n" + "="*60)
    print("  ✅ USER ADDED!")
    print("="*60)
    print("\n📝 Account Details:")
    print("   Email: main@main.com")
    print("   Password: 1111")
    print("   Role: Master")
    print("   Name: Main Master")
    print("\n")

if __name__ == '__main__':
    main()
