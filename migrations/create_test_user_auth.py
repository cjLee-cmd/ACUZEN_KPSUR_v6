#!/usr/bin/env python3
"""
Create Test User in Supabase Auth
이 스크립트는 Supabase Auth에 테스트 사용자를 생성합니다.
"""

import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

def create_auth_user():
    """Supabase Auth에 사용자 생성 (signup API 사용)"""

    print("\n" + "="*60)
    print("  Supabase Auth 사용자 생성")
    print("="*60)

    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

    # 생성할 사용자 정보
    user_email = "author@kpsur.test"
    user_password = "test1234"

    print(f"\n📧 이메일: {user_email}")
    print(f"🔑 비밀번호: {user_password}")
    print(f"\n🚀 사용자 생성 중...\n")

    try:
        # Supabase signup API 사용
        response = supabase.auth.sign_up({
            'email': user_email,
            'password': user_password,
            'options': {
                'data': {
                    'name': 'Test Author'
                }
            }
        })

        if response.user:
            print("✅ Supabase Auth 사용자 생성 성공!")
            print(f"   User ID: {response.user.id}")
            print(f"   Email: {response.user.email}")
            print(f"   확인 필요: {not response.user.email_confirmed_at}")

            if not response.user.email_confirmed_at:
                print("\n⚠️  이메일 확인이 필요할 수 있습니다.")
                print("   Supabase Dashboard에서 이메일 확인을 비활성화하거나")
                print("   확인 링크를 클릭해주세요.")

            return True
        else:
            print("❌ 사용자 생성 실패: 응답 없음")
            return False

    except Exception as e:
        error_msg = str(e)

        if 'already registered' in error_msg.lower() or 'already exists' in error_msg.lower():
            print("ℹ️  사용자가 이미 존재합니다.")
            return True
        else:
            print(f"❌ 오류 발생: {error_msg}")
            return False

def verify_user():
    """생성된 사용자 확인"""
    print("\n" + "="*60)
    print("  사용자 확인")
    print("="*60)

    from supabase import create_client

    supabase = create_client(SUPABASE_URL, os.getenv('SUPABASE_KEY'))

    print("\n🔐 로그인 테스트 중...\n")

    try:
        response = supabase.auth.sign_in_with_password({
            'email': 'author@kpsur.test',
            'password': 'test1234'
        })

        print("✅ 로그인 성공!")
        print(f"   User ID: {response.user.id if response.user else 'N/A'}")
        print(f"   Email: {response.user.email if response.user else 'N/A'}")

        # 로그아웃
        supabase.auth.sign_out()

        return True

    except Exception as e:
        print(f"❌ 로그인 실패: {str(e)}")
        return False

if __name__ == '__main__':
    success = create_auth_user()

    if success:
        print("\n⏳ 잠시 대기 중... (사용자 프로비저닝)")
        import time
        time.sleep(2)

        verify_user()

    print("\n" + "="*60)
    print("  완료")
    print("="*60)
    print()
