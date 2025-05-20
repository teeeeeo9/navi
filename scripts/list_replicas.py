#!/usr/bin/env python3
"""
Script to list all Sensay replicas for a user.
Usage: python list_replicas.py <sensay_user_id>
"""

import os
import sys
import requests
import argparse
import logging
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('list_replicas')

# Constants
SENSAY_API_BASE_URL = "https://api.sensay.io"
API_VERSION = "2025-03-25"

def list_replicas(sensay_user_id, api_key):
    """List all replicas for a user."""
    url = f"{SENSAY_API_BASE_URL}/v1/replicas"
    
    headers = {
        "X-ORGANIZATION-SECRET": api_key,
        "X-USER-ID": sensay_user_id,
        "X-API-Version": API_VERSION
    }
    
    logger.info(f"Fetching replicas for user: {sensay_user_id}")
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        # Parse response
        data = response.json()
        replicas = data.get('items', [])
        
        if replicas:
            logger.info(f"Found {len(replicas)} replicas for user: {sensay_user_id}")
            return replicas
        else:
            logger.info(f"No replicas found for user: {sensay_user_id}")
            return []
            
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            logger.error(f"User not found: {sensay_user_id}")
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

def main():
    parser = argparse.ArgumentParser(description='List Sensay replicas for a user')
    parser.add_argument('sensay_user_id', help='Sensay user ID')
    parser.add_argument('--api-key', help='Sensay API key (can also use SENSAY_API_KEY env variable)')
    parser.add_argument('--format', choices=['text', 'json'], default='text', help='Output format (default: text)')
    
    args = parser.parse_args()
    
    # Get API key from args or environment
    api_key = args.api_key or os.environ.get('SENSAY_API_KEY')
    if not api_key:
        logger.error("API key is required. Set SENSAY_API_KEY environment variable or use --api-key")
        sys.exit(1)
    
    # List replicas
    replicas = list_replicas(args.sensay_user_id, api_key)
    
    # Display results
    if args.format == 'json':
        print(json.dumps(replicas, indent=2))
    else:
        if replicas:
            print("\nReplicas for user:", args.sensay_user_id)
            print("-" * 60)
            for replica in replicas:
                print(f"UUID: {replica.get('uuid')}")
                print(f"Name: {replica.get('name')}")
                print(f"Slug: {replica.get('slug')}")
                print(f"Created: {replica.get('createdAt')}")
                print("-" * 60)
        else:
            print("No replicas found.")

if __name__ == "__main__":
    main() 