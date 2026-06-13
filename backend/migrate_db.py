#!/usr/bin/env python3
"""
Database Migration Script for QuickCommerce
Initializes database tables for both SQLite (local) and PostgreSQL (production)
"""

import sys
from database import engine, Base
from models import User, CartItem, UserProfile

def init_database():
    """Create all tables in the database"""
    try:
        print("=" * 60)
        print("QuickCommerce Database Migration")
        print("=" * 60)
        print(f"\nDatabase URL: {engine.url}")
        print(f"Database Dialect: {engine.dialect.name}")
        print("\nCreating tables...")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("\n✅ Successfully created tables:")
        for table_name in Base.metadata.tables.keys():
            print(f"   - {table_name}")
        
        print("\n" + "=" * 60)
        print("Migration Complete!")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print("\n❌ Migration failed!")
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return False

def verify_database():
    """Verify database connection and tables"""
    try:
        print("\n🔍 Verifying database connection...")
        
        with engine.connect() as connection:
            print("✅ Database connection successful")
            
            # Check if tables exist
            from sqlalchemy import inspect
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            
            print(f"\n📊 Found {len(tables)} tables in database:")
            for table in tables:
                print(f"   - {table}")
            
            required_tables = ['users', 'cart_items', 'user_profiles']
            missing_tables = [t for t in required_tables if t not in tables]
            
            if missing_tables:
                print(f"\n⚠️  Warning: Missing tables: {', '.join(missing_tables)}")
                return False
            else:
                print("\n✅ All required tables exist")
                return True
                
    except Exception as e:
        print(f"\n❌ Verification failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("\n")
    
    # Initialize database
    if init_database():
        # Verify tables
        verify_database()
        sys.exit(0)
    else:
        sys.exit(1)
