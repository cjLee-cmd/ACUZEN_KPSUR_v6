#!/usr/bin/env python3
"""
Add Master User to users table
Supabase Management API를 사용하여 users 테이블에 직접 사용자 추가
"""

import os
import requests
from dotenv import load_dotenv

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

    payload = {
        "query": sql_content
    }

    try:
        response = requests.post(api_url, headers=headers, json=payload, timeout=60)

        if response.status_code in [200, 201]:
            print("✅ SQL 실행 성공")
            return True
        else:
            print(f"❌ SQL 실행 실패: HTTP {response.status_code}")
            print(f"   응답: {response.text[:200]}")
            return False

    except Exception as e:
        print(f"❌ 오류 발생: {str(e)}")
        return False

def main():
    print("\n" + "="*60)
    print("  users 테이블에 Master 사용자 추가")
    print("="*60)

    # Read SQL file
    sql_file = os.path.join(os.path.dirname(__file__), 'add_master_user.sql')

    with open(sql_file, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    print(f"\n📄 SQL 파일: {sql_file}")
    print(f"📧 사용자: main@main.com")
    print(f"👤 역할: Master")
    print(f"\n🚀 SQL 실행 중...\n")

    if execute_sql(sql_content):
        print("\n✅ Master 사용자가 users 테이블에 추가되었습니다.")
    else:
        print("\n❌ 실패했습니다.")

    print("\n" + "="*60)
    print()

if __name__ == '__main__':
    main()
