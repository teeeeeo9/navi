#!/usr/bin/env python3
"""
Cleanup script for the Navi application:
1. Gets all users from the database
2. Gets and deletes all replicas for each user from Sensay
3. Drops the database
4. Creates a new database

Usage: python scripts/cleanup.py [--force]
"""

import os
import sys
import argparse
import logging
import traceback
from dotenv import load_dotenv

# Add parent directory to path so we can import from app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import app-specific modules
from app import create_app, db
from app.models import User
from app.services.sensay import get_sensay_client, SensayAPIError

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('cleanup')

def get_and_delete_replicas():
    """Get all users and delete their replicas from Sensay."""
    print("1 - Starting get_and_delete_replicas function")
    app = create_app()
    print("App created successfully")
    
    with app.app_context():
        try:
            print("2 - About to get Sensay client")
            # Get the Sensay client
            try:
                sensay_client = get_sensay_client()
                print("3 - Sensay client obtained successfully")
            except Exception as e:
                print(f"ERROR getting Sensay client: {str(e)}")
                print(traceback.format_exc())
                return
            
            # Get all users
            print("4 - Attempting to query users from database")
            try:
                users = User.query.all()
                print(f"5 - Found {len(users)} users in the database")
            except Exception as e:
                print(f"ERROR querying users: {str(e)}")
                print(traceback.format_exc())
                return
            
            total_replicas = 0
            deleted_replicas = 0
            
            # For each user, get and delete their replicas
            for user in users:
                print(f"Processing user: {user.username} (ID: {user.id})")
                if not user.sensay_user_id:
                    print(f"User {user.username} has no Sensay user ID, skipping")
                    continue
                
                try:
                    # Get replicas for the user
                    print(f"Listing replicas for user {user.sensay_user_id}")
                    replicas_response = sensay_client.list_replicas(user.sensay_user_id)
                    replicas = replicas_response.get('items', [])
                    total_replicas += len(replicas)
                    
                    print(f"Found {len(replicas)} replicas for user {user.username} ({user.sensay_user_id})")
                    
                    # Delete each replica
                    for replica in replicas:
                        replica_id = replica.get('uuid')
                        replica_name = replica.get('name', 'Unknown')
                        
                        try:
                            print(f"Deleting replica: {replica_name} ({replica_id})")
                            sensay_client.delete_replica(replica_id, user.sensay_user_id)
                            deleted_replicas += 1
                            print(f"Successfully deleted replica: {replica_id}")
                        except SensayAPIError as e:
                            print(f"Failed to delete replica {replica_id}: {str(e)}")
                
                except SensayAPIError as e:
                    print(f"Error getting replicas for user {user.sensay_user_id}: {str(e)}")
                except Exception as e:
                    print(f"Unexpected error: {str(e)}")
                    print(traceback.format_exc())
            
            print(f"Deletion summary: {deleted_replicas}/{total_replicas} replicas deleted")
            
        except Exception as e:
            print(f"Error during replica cleanup: {str(e)}")
            print(traceback.format_exc())

def drop_database():
    """Drop all database tables."""
    print("Starting drop_database function")
    app = create_app()
    with app.app_context():
        try:
            print("Dropping database tables...")
            db.drop_all()
            print("Database tables dropped successfully")
        except Exception as e:
            print(f"Error dropping database tables: {str(e)}")
            print(traceback.format_exc())
            raise

def create_database():
    """Create all database tables."""
    print("Starting create_database function")
    app = create_app()
    with app.app_context():
        try:
            print("Creating database tables...")
            db.create_all()
            print("Database tables created successfully")
        except Exception as e:
            print(f"Error creating database tables: {str(e)}")
            print(traceback.format_exc())
            raise

def main():
    # parser = argparse.ArgumentParser(description='Cleanup script for Navi application')
    # parser.add_argument('--force', action='store_true', help='Skip confirmation prompt')
    
    # args = parser.parse_args()
    
    # if not args.force:
    #     print("\nWARNING: This script will:")
    #     print("1. Delete all replicas for all users from Sensay")
    #     print("2. Drop all database tables")
    #     print("3. Create new empty database tables")
    #     print("\nAll data will be permanently lost!")
        
    #     confirmation = input("\nDo you want to continue? (y/N): ")
    #     if confirmation.lower() != 'y':
    #         print("Operation cancelled.")
    #         return
    
    print("\nStarting cleanup process...")
    
    # Step 1: Get and delete all replicas
    get_and_delete_replicas()
    
    # Step 2: Drop the database
    drop_database()
    
    # Step 3: Create a new database
    create_database()
    
    print("\nCleanup completed successfully!")

if __name__ == "__main__":
    main() 