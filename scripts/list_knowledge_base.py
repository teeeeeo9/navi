#!/usr/bin/env python3
"""
Script to list all knowledge base entries for a Sensay replica.
Usage: python list_knowledge_base.py [--replica-id REPLICA_ID] [--user-id SENSAY_USER_ID]

If replica-id is provided, lists knowledge base entries for that specific replica.
If user-id is provided, lists knowledge base entries for all replicas belonging to that user.
If neither is provided, uses the environment variables for default values.
"""

import os
import sys
import requests
import argparse
import logging
import json
from typing import Dict, List, Optional
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('list_knowledge_base')

# Constants
SENSAY_API_BASE_URL = "https://api.sensay.io"
API_VERSION = "2025-03-25"

def get_knowledge_base(api_key: str, replica_id: Optional[str] = None, user_id: Optional[str] = None):
    """
    List all knowledge base entries for either a specific replica or all replicas of a user.
    
    Args:
        api_key: Sensay API key
        replica_id: Optional ID of specific replica to check
        user_id: Optional Sensay user ID to check all replicas
        
    Returns:
        List of knowledge base entries
    """
    url = f"{SENSAY_API_BASE_URL}/v1/training"
    
    headers = {
        "X-ORGANIZATION-SECRET": api_key,
        "X-API-Version": API_VERSION
    }
    
    # Add user ID if provided
    if user_id:
        headers["X-USER-ID"] = user_id
    
    # Add parameters if needed
    params = {}
    if replica_id:
        params["replica_uuid"] = replica_id
    
    try:
        logger.info(f"Fetching knowledge base entries for {'replica: ' + replica_id if replica_id else 'user: ' + user_id if user_id else 'organization'}")
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        
        # Parse response
        data = response.json()
        items = data.get('items', [])
        
        if items:
            logger.info(f"Found {len(items)} knowledge base entries")
            return items
        else:
            logger.info("No knowledge base entries found")
            return []
            
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            logger.error(f"Replica or user not found")
        elif response.status_code == 401:
            logger.error("Unauthorized: Invalid API key")
        else:
            logger.error(f"HTTP error: {str(e)}")
        return []
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return []
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return []

def print_knowledge_base_entries(entries: List[Dict]):
    """Print formatted knowledge base entries."""
    if not entries:
        print("No knowledge base entries found.")
        return
    
    print(f"\nFound {len(entries)} knowledge base entries:\n")
    print("-" * 80)
    
    for i, entry in enumerate(entries, 1):
        print(f"Entry #{i}:")
        print(f"  ID: {entry.get('id')}")
        print(f"  Title: {entry.get('title')}")
        print(f"  Type: {entry.get('type')}")
        print(f"  Status: {entry.get('status')}")
        print(f"  Replica UUID: {entry.get('replica_uuid') or 'Not assigned to a specific replica'}")
        
        # Show content preview (truncated for readability)
        raw_text = entry.get('raw_text', '')
        if raw_text:
            preview = raw_text[:100] + ('...' if len(raw_text) > 100 else '')
            print(f"  Content preview: {preview}")
        
        print(f"  Created: {entry.get('created_at')}")
        print(f"  Updated: {entry.get('updated_at')}")
        print("-" * 80)

def main():
    """Main function to parse arguments and run the script."""
    parser = argparse.ArgumentParser(description='List knowledge base entries for a Sensay replica or user')
    parser.add_argument('--replica-id', help='ID of the replica to check')
    parser.add_argument('--user-id', help='Sensay user ID to check all replicas')
    parser.add_argument('--format', choices=['pretty', 'json'], default='pretty',
                      help='Output format (pretty or json)')
    
    args = parser.parse_args()
    
    # Get API key from environment
    api_key = os.environ.get('SENSAY_API_KEY')
    if not api_key:
        logger.error("SENSAY_API_KEY not found in environment variables")
        sys.exit(1)
    
    # Use provided IDs or defaults from environment
    replica_id = args.replica_id
    user_id = args.user_id or os.environ.get('SENSAY_USER_ID')
    
    if not replica_id and not user_id:
        logger.warning("Neither replica-id nor user-id provided. Will list all entries for the organization.")
    
    # Get knowledge base entries
    entries = get_knowledge_base(api_key, replica_id, user_id)
    
    # Output in requested format
    if args.format == 'json':
        print(json.dumps(entries, indent=2))
    else:
        print_knowledge_base_entries(entries)

if __name__ == "__main__":
    main() 