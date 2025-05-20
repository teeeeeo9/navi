#!/usr/bin/env python3
"""
Script to delete a Sensay replica.
Usage: python delete_replica.py <replica_uuid>
"""

import os
import sys
import requests
import argparse
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('delete_replica')

# Constants
SENSAY_API_BASE_URL = "https://api.sensay.io"
API_VERSION = "2025-03-25"

def delete_replica(replica_uuid, api_key):
    """Delete a replica by UUID."""
    url = f"{SENSAY_API_BASE_URL}/v1/replicas/{replica_uuid}"
    
    headers = {
        "X-ORGANIZATION-SECRET": api_key,
        "X-API-Version": API_VERSION
    }
    
    logger.info(f"Sending DELETE request for replica: {replica_uuid}")
    
    try:
        response = requests.delete(url, headers=headers)
        response.raise_for_status()
        
        # Parse response
        data = response.json()
        if data.get('success'):
            logger.info(f"Successfully deleted replica: {replica_uuid}")
            return True
        else:
            logger.error(f"Failed to delete replica: {response.text}")
            return False
            
    except requests.exceptions.HTTPError as e:
        if response.status_code == 404:
            logger.error(f"Replica not found: {replica_uuid}")
        elif response.status_code == 401:
            logger.error("Unauthorized: Invalid API key")
        else:
            logger.error(f"HTTP error: {str(e)}")
        return False
        
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error: {str(e)}")
        return False
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Delete a Sensay replica')
    parser.add_argument('replica_uuid', help='UUID of the replica to delete')
    parser.add_argument('--api-key', help='Sensay API key (can also use SENSAY_API_KEY env variable)')
    
    args = parser.parse_args()
    
    # Get API key from args or environment
    api_key = args.api_key or os.environ.get('SENSAY_API_KEY')
    if not api_key:
        logger.error("API key is required. Set SENSAY_API_KEY environment variable or use --api-key")
        sys.exit(1)
    
    # Delete the replica
    success = delete_replica(args.replica_uuid, api_key)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main() 