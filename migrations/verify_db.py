#!/usr/bin/env python3
"""
Verify Supabase Database Setup
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')
SUPABASE_KEY = os.getenv('VITE_SUPABASE_PUBLISHABLE_KEY')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def verify_tables():
    """Verify all tables exist and have data"""

    print("\n" + "="*60)
    print("  DATABASE VERIFICATION")
    print("="*60)

    # Check users
    print("\n👥 Users Table:")
    try:
        users = supabase.table('users').select('email, role').execute()
        if users.data:
            print(f"   ✅ Found {len(users.data)} users:")
            for user in users.data:
                print(f"      - {user['email']} ({user['role']})")
        else:
            print("   ❌ No users found")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # Check products
    print("\n💊 Products Table:")
    try:
        products = supabase.table('products').select('product_name, ingredient_name, company_name').execute()
        if products.data:
            print(f"   ✅ Found {len(products.data)} products:")
            for product in products.data:
                print(f"      - {product['product_name']} ({product['ingredient_name']}) - {product['company_name']}")
        else:
            print("   ❌ No products found")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # Check system_settings
    print("\n⚙️  System Settings Table:")
    try:
        settings = supabase.table('system_settings').select('setting_key').execute()
        if settings.data:
            print(f"   ✅ Found {len(settings.data)} settings:")
            for setting in settings.data:
                print(f"      - {setting['setting_key']}")
        else:
            print("   ❌ No settings found")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    # Check reports
    print("\n📄 Reports Table:")
    try:
        reports = supabase.table('reports').select('report_name').execute()
        print(f"   ✅ Reports table exists (currently {len(reports.data)} reports)")
    except Exception as e:
        print(f"   ❌ Error: {e}")

    print("\n" + "="*60)
    print("  ✅ VERIFICATION COMPLETE")
    print("="*60)

if __name__ == '__main__':
    verify_tables()
