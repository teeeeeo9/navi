#!/usr/bin/env python
"""
Migration script to add the 'type' field to progress_updates table.
This script should be run after updating the model but before restarting the app.
"""

import os
import sys
import sqlite3
from datetime import datetime

# Add the parent directory to the path so we can import the app
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Check if the database file exists
DB_PATH = 'app.db'
if not os.path.exists(DB_PATH):
    print(f"Database file '{DB_PATH}' not found.")
    sys.exit(1)

def migrate_progress_types():
    """Add the 'type' column to progress_updates table and set existing values to 'progress'"""
    print(f"Starting migration of progress_updates table at {datetime.now().isoformat()}")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if the column already exists
        cursor.execute("PRAGMA table_info(progress_updates)")
        columns = cursor.fetchall()
        column_names = [col[1] for col in columns]
        
        if 'type' not in column_names:
            print("Adding 'type' column to progress_updates table...")
            
            # SQLite doesn't support adding columns with NOT NULL constraints to existing tables
            # so we need to create a new table and copy the data
            cursor.execute("""
                BEGIN TRANSACTION;
                
                -- Create a new table with the type column
                CREATE TABLE progress_updates_new (
                    id INTEGER PRIMARY KEY,
                    goal_id INTEGER NOT NULL,
                    progress_value FLOAT NOT NULL,
                    type VARCHAR(20) NOT NULL DEFAULT 'progress',
                    notes TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (goal_id) REFERENCES goals (id) ON DELETE CASCADE
                );
                
                -- Copy data from old table to new table
                INSERT INTO progress_updates_new (id, goal_id, progress_value, notes, created_at)
                SELECT id, goal_id, progress_value, notes, created_at
                FROM progress_updates;
                
                -- Update all existing rows to have type='progress'
                UPDATE progress_updates_new SET type = 'progress';
                
                -- Drop the old table
                DROP TABLE progress_updates;
                
                -- Rename the new table
                ALTER TABLE progress_updates_new RENAME TO progress_updates;
                
                COMMIT;
            """)
            
            print("Migration completed successfully!")
        else:
            print("The 'type' column already exists in the progress_updates table. No migration needed.")
    
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_progress_types() 