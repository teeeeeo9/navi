#!/usr/bin/env python
"""
Script to demonstrate using the achievements API endpoints.

This script shows how to:
1. Get all user achievements
2. Use filtering options (if any)
3. Display the results nicely

The script handles authentication automatically using the same credentials as test_app.py.
"""

import requests
import json
import os
from datetime import datetime
import argparse

# Configuration
BASE_URL = os.environ.get('API_URL', 'http://localhost:5000/api')
DEFAULT_TOKEN = os.environ.get('AUTH_TOKEN', '')  # Set a default token in env or via command line
# Default credentials (same as test_app.py)
USERNAME = "testuser"
EMAIL = "testuser@example.com"
PASSWORD = "testpassword"

def pretty_print_json(data):
    """Print JSON data in a readable format."""
    print(json.dumps(data, indent=2))

def format_date(iso_date):
    """Format ISO date string to human-readable format."""
    try:
        dt = datetime.fromisoformat(iso_date.replace('Z', '+00:00'))
        return dt.strftime('%b %d, %Y')
    except:
        return iso_date

def register_user():
    """Register a new user."""
    print("\n===== REGISTERING USER =====")
    
    response = requests.post(
        f"{BASE_URL}/auth/register",
        json={
            "username": USERNAME,
            "email": EMAIL,
            "password": PASSWORD
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"User registered successfully: {data['user']['username']}")
        return data['access_token']
    elif response.status_code == 409:
        # User already exists, login instead
        return login_user()
    else:
        print(f"Failed to register user: {response.status_code}")
        pretty_print_json(response.json())
        return None

def login_user():
    """Log in an existing user."""
    print("\n===== LOGGING IN USER =====")
    
    response = requests.post(
        f"{BASE_URL}/auth/login",
        json={
            "username": USERNAME,
            "password": PASSWORD
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"User logged in successfully: {data['user']['username']}")
        return data['access_token']
    else:
        print(f"Failed to login: {response.status_code}")
        pretty_print_json(response.json())
        return None

def display_achievements(achievements, stats):
    """Display achievements in a readable format."""
    print("\n======== ACHIEVEMENT STATISTICS ========")
    print(f"Total Completed Goals: {stats['total_completed_goals']}")
    print(f"Total Completed Milestones: {stats['total_completed_milestones']}")
    print(f"Total Reflections/Lessons: {stats['total_reflections']}")
    print("========================================\n")
    
    if not achievements:
        print("No achievements found. Start completing goals and milestones!")
        return
    
    print("========== YOUR ACHIEVEMENTS ==========")
    for i, achievement in enumerate(achievements, 1):
        achievement_type = achievement['type']
        
        if achievement_type == 'goal':
            print(f"{i}. 🏆 GOAL COMPLETED: {achievement['title']}")
            if achievement['description']:
                print(f"   Description: {achievement['description']}")
            print(f"   Completed on: {format_date(achievement['completion_date'])}")
            
        elif achievement_type == 'milestone':
            print(f"{i}. ✓ MILESTONE COMPLETED: {achievement['title']}")
            print(f"   For goal: {achievement['goal_title']}")
            if achievement['description']:
                print(f"   Description: {achievement['description']}")
            print(f"   Completed on: {format_date(achievement['completion_date'])}")
            
        elif achievement_type == 'reflection':
            print(f"{i}. 💡 {achievement['reflection_type_display'].upper()}: ")
            print(f"   For goal: {achievement['goal_title']}")
            print(f"   Content: {achievement['content']}")
            print(f"   Date: {format_date(achievement['date'])}")
            
        print("----------------------------------------")
    print("========================================\n")

def get_achievements(token, limit=None):
    """Get user achievements from the API."""
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
    
    url = f'{BASE_URL}/progress/achievements'
    params = {}
    
    if limit:
        params['limit'] = limit
    
    try:
        response = requests.get(url, headers=headers, params=params)
        
        if response.status_code == 200:
            data = response.json()
            return data.get('achievements', []), data.get('stats', {})
        else:
            print(f"Error: {response.status_code}")
            try:
                error_data = response.json()
                print(f"Message: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"Raw response: {response.text}")
            return [], {}
            
    except Exception as e:
        print(f"Exception: {str(e)}")
        return [], {}

def main():
    """Main function to run the script."""
    parser = argparse.ArgumentParser(description='Test the achievements API endpoint')
    parser.add_argument('--token', default=DEFAULT_TOKEN, help='JWT token for authentication (optional, will login if not provided)')
    parser.add_argument('--limit', type=int, help='Limit the number of achievements returned')
    parser.add_argument('--raw', action='store_true', help='Display raw JSON instead of formatted output')
    parser.add_argument('--skip-login', action='store_true', help='Skip automatic login (requires --token)')
    
    args = parser.parse_args()
    
    token = args.token
    
    # If no token is provided and not skipping login, try to register/login
    if not token and not args.skip_login:
        token = register_user()
        if not token:
            print("Failed to authenticate. Exiting.")
            return
    elif not token and args.skip_login:
        print("Error: JWT token is required when using --skip-login.")
        return
    
    achievements, stats = get_achievements(token, args.limit)
    
    if args.raw:
        pretty_print_json({
            'achievements': achievements,
            'stats': stats
        })
    else:
        display_achievements(achievements, stats)

if __name__ == '__main__':
    main() 