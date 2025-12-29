#!/usr/bin/env python3
"""
Supabase Database Migration Runner
Reads SQL file and executes it against Supabase database
"""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Load environment variables
load_dotenv()

# Supabase connection info from .env
SUPABASE_PROJECT_ID = os.getenv('VITE_SUPABASE_PROJECT_ID')
SUPABASE_URL = os.getenv('VITE_SUPABASE_URL')

# Extract database connection string
# Supabase connection format: postgresql://postgres:[password]@[host]:5432/postgres
DB_HOST = f"db.{SUPABASE_PROJECT_ID}.supabase.co"
DB_PORT = 5432
DB_NAME = "postgres"
DB_USER = "postgres"

# You need to set DB_PASSWORD in .env or enter it manually
DB_PASSWORD = os.getenv('SUPABASE_DB_PASSWORD')

def get_connection():
    """Create database connection"""
    if not DB_PASSWORD:
        print("❌ Error: SUPABASE_DB_PASSWORD not found in .env file")
        print("\nPlease add the following to your .env file:")
        print("SUPABASE_DB_PASSWORD=your_database_password")
        print("\nYou can find this password in:")
        print("Supabase Dashboard → Settings → Database → Connection string")
        sys.exit(1)

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            port=DB_PORT,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        return conn
    except Exception as e:
        print(f"❌ Connection Error: {e}")
        sys.exit(1)

def run_migration(sql_file_path: Path):
    """Run SQL migration file"""
    if not sql_file_path.exists():
        print(f"❌ SQL file not found: {sql_file_path}")
        sys.exit(1)

    print(f"\n📄 Reading SQL file: {sql_file_path.name}")
    sql_content = sql_file_path.read_text(encoding='utf-8')

    print(f"📦 Connecting to Supabase database...")
    print(f"   Host: {DB_HOST}")
    print(f"   Database: {DB_NAME}")

    conn = get_connection()
    cursor = conn.cursor()

    try:
        print(f"\n🚀 Executing migration...")
        cursor.execute(sql_content)

        print("✅ Migration completed successfully!")

        # Show created tables
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        tables = cursor.fetchall()

        print(f"\n📋 Created tables ({len(tables)}):")
        for table in tables:
            print(f"   - {table[0]}")

        # Show default users
        cursor.execute("SELECT email, role FROM users ORDER BY role;")
        users = cursor.fetchall()

        if users:
            print(f"\n👥 Default users ({len(users)}):")
            for email, role in users:
                print(f"   - {email} ({role})")

        # Show default products
        cursor.execute("SELECT product_name, ingredient_name FROM products;")
        products = cursor.fetchall()

        if products:
            print(f"\n💊 Sample products ({len(products)}):")
            for product_name, ingredient_name in products:
                print(f"   - {product_name} ({ingredient_name})")

    except Exception as e:
        print(f"\n❌ Migration Error: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

def reset_database():
    """Drop all tables and reset database"""
    print("\n⚠️  WARNING: This will DELETE all data!")
    response = input("Are you sure you want to reset the database? (yes/no): ")

    if response.lower() != 'yes':
        print("❌ Reset cancelled")
        return

    print("\n🗑️  Dropping all tables...")
    conn = get_connection()
    cursor = conn.cursor()

    try:
        # Drop all tables in reverse order (to handle foreign keys)
        tables = [
            'system_settings',
            'file_matching_table',
            'llm_dialogs',
            'review_changes',
            'report_sections',
            'extracted_data',
            'markdown_documents',
            'source_documents',
            'reports',
            'products',
            'users'
        ]

        for table in tables:
            cursor.execute(f"DROP TABLE IF EXISTS {table} CASCADE;")
            print(f"   Dropped: {table}")

        # Drop function
        cursor.execute("DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;")

        print("\n✅ Database reset completed!")

    except Exception as e:
        print(f"\n❌ Reset Error: {e}")
        sys.exit(1)
    finally:
        cursor.close()
        conn.close()

def main():
    """Main function"""
    print("\n" + "="*60)
    print("  KSUR Database Migration Tool")
    print("="*60)

    if len(sys.argv) > 1 and sys.argv[1] == '--reset':
        reset_database()
        print("\nDatabase has been reset. Run without --reset to apply migration.")
        return

    # Path to SQL migration file
    migration_file = Path(__file__).parent / '001_initial_schema.sql'

    # Run migration
    run_migration(migration_file)

    print("\n" + "="*60)
    print("  Migration Complete!")
    print("="*60)
    print("\n📝 Next steps:")
    print("   1. Verify tables in Supabase Dashboard → Database")
    print("   2. Check RLS policies are enabled")
    print("   3. Test login with default users:")
    print("      - master@kpsur.test / test1234")
    print("      - author@kpsur.test / test1234")
    print("\n")

if __name__ == '__main__':
    main()
