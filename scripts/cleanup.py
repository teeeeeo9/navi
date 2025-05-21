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
    app = create_app()
    with app.app_context():
        try:
            # Get the Sensay client
            sensay_client = get_sensay_client()
            
            # Get all users
            users = User.query.all()
            logger.info(f"Found {len(users)} users in the database")
            
            total_replicas = 0
            deleted_replicas = 0
            
            # For each user, get and delete their replicas
            for user in users:
                if not user.sensay_user_id:
                    logger.warning(f"User {user.username} has no Sensay user ID, skipping")
                    continue
                
                try:
                    # Get replicas for the user
                    replicas_response = sensay_client.list_replicas(user.sensay_user_id)
                    replicas = replicas_response.get('items', [])
                    total_replicas += len(replicas)
                    
                    logger.info(f"Found {len(replicas)} replicas for user {user.username} ({user.sensay_user_id})")
                    
                    # Delete each replica
                    for replica in replicas:
                        replica_id = replica.get('uuid')
                        replica_name = replica.get('name', 'Unknown')
                        
                        try:
                            logger.info(f"Deleting replica: {replica_name} ({replica_id})")
                            sensay_client.delete_replica(replica_id, user.sensay_user_id)
                            deleted_replicas += 1
                            logger.info(f"Successfully deleted replica: {replica_id}")
                        except SensayAPIError as e:
                            logger.error(f"Failed to delete replica {replica_id}: {str(e)}")
                
                except SensayAPIError as e:
                    logger.error(f"Error getting replicas for user {user.sensay_user_id}: {str(e)}")
                except Exception as e:
                    logger.error(f"Unexpected error: {str(e)}")
            
            logger.info(f"Deletion summary: {deleted_replicas}/{total_replicas} replicas deleted")
            
        except Exception as e:
            logger.error(f"Error during replica cleanup: {str(e)}")

def drop_database():
    """Drop all database tables."""
    app = create_app()
    with app.app_context():
        try:
            logger.info("Dropping database tables...")
            db.drop_all()
            logger.info("Database tables dropped successfully")
        except Exception as e:
            logger.error(f"Error dropping database tables: {str(e)}")
            raise

def create_database():
    """Create all database tables."""
    app = create_app()
    with app.app_context():
        try:
            logger.info("Creating database tables...")
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {str(e)}")
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
    
    # # Step 2: Drop the database
    # drop_database()
    
    # # Step 3: Create a new database
    # create_database()
    
    # print("\nCleanup completed successfully!")

if __name__ == "__main__":
    main() 