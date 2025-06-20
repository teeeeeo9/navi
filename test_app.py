#!/usr/bin/env python3
"""
Interactive test script for the Strategist application.
This script allows users to chat directly with the AI replica and test goal management features.
"""

import os
import json
import logging
import requests
from datetime import datetime, timedelta
import time
import sys

# Setup basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# Set a lower logging level for the script itself
logger = logging.getLogger()
logger.setLevel(logging.WARNING)  # Only show warnings and errors

# Configuration
BASE_URL = "http://localhost:5000/api"
USERNAME = "testuser2342314"
EMAIL = "testuser2342314@example.com"
PASSWORD = "testpassword"

# Debug mode flag
DEBUG_MODE = True

# Headers for authenticated requests
auth_headers = {
    'Content-Type': 'application/json'
}

def pretty_print(data):
    """Print JSON data in a readable format."""
    print(json.dumps(data, indent=2))

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
        
        # Save auth token
        auth_headers['Authorization'] = f"Bearer {data['access_token']}"
        return True
    elif response.status_code == 409:
        # User already exists, login instead
        return login_user()
    else:
        print(f"Failed to register user: {response.status_code}")
        pretty_print(response.json())
        return False

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
        
        # Save auth token
        auth_headers['Authorization'] = f"Bearer {data['access_token']}"
        return True
    else:
        print(f"Failed to login: {response.status_code}")
        pretty_print(response.json())
        return False

def get_user_profile():
    """Get the user's profile."""
    print("\n===== GETTING USER PROFILE =====")
    
    response = requests.get(
        f"{BASE_URL}/auth/profile",
        headers=auth_headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"User profile retrieved: {data['user']['username']}")
        return data['user']
    else:
        print(f"Failed to get profile: {response.status_code}")
        pretty_print(response.json())
        return None

def get_chat_history(limit=20, include_system=False):
    """Get recent chat history."""
    endpoint = f"{BASE_URL}/chat/history?limit={limit}"
    if include_system:
        endpoint += "&include_system=true"
        
    response = requests.get(
        endpoint,
        headers=auth_headers
    )
    
    if response.status_code == 200:
        return response.json()['messages']
    else:
        print(f"Failed to get chat history: {response.status_code}")
        return []

def send_message(content, related_goal_id=None, is_system_message=False):
    """Send a message to the AI replica and get a response."""
    
    payload = {
        "content": content,
        "is_system_message": is_system_message
    }
    if related_goal_id:
        payload["related_goal_id"] = related_goal_id
    
    response = requests.post(
        f"{BASE_URL}/chat/send",
        headers=auth_headers,
        json=payload
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to send message: {response.status_code}")
        pretty_print(response.json())
        return None

def get_goals():
    """Get all goals for the user."""
    response = requests.get(
        f"{BASE_URL}/goals/",
        headers=auth_headers
    )
    
    if response.status_code == 200:
        return response.json()['goals']
    else:
        print(f"Failed to get goals: {response.status_code}")
        return []

def get_goal_details(goal_id):
    """Get detailed information for a specific goal."""
    response = requests.get(
        f"{BASE_URL}/goals/{goal_id}",
        headers=auth_headers
    )
    
    if response.status_code == 200:
        return response.json()['goal']
    else:
        print(f"Failed to get goal details: {response.status_code}")
        return None

def get_progress_summary():
    """Get a summary of the user's goals and progress."""
    response = requests.get(
        f"{BASE_URL}/progress/summary",
        headers=auth_headers
    )
    
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to get progress summary: {response.status_code}")
        return None

def delete_user():
    """Delete the current user from both Sensay and local database."""
    print("\n===== DELETING USER =====")
    
    response = requests.delete(
        f"{BASE_URL}/auth/delete",
        headers=auth_headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"User deleted successfully: {data['deleted_user']['username']}")
        print(f"Sensay User ID: {data['deleted_user']['sensay_user_id']}")
        
        # Clear the auth token since user is deleted
        auth_headers.pop('Authorization', None)
        return True
    else:
        print(f"Failed to delete user: {response.status_code}")
        pretty_print(response.json())
        return False

def display_goals():
    """Display all goals in a user-friendly format."""
    print("\n===== YOUR GOALS =====")
    goals = get_goals()
    
    if not goals:
        print("You don't have any goals yet. Start chatting with the AI to create one!")
        return
    
    for i, goal in enumerate(goals, 1):
        print(f"{i}. {goal['title']} (Progress: {goal['completion_status']}%, Status: {goal['status']})")
        print(f"   Target date: {goal['target_date'][:10]}")
        if goal['milestones']:
            print(f"   Milestones: {len(goal['milestones'])}")
        if goal['subgoals_count'] > 0:
            print(f"   Subgoals: {goal['subgoals_count']}")
        print()
    
    return goals

def display_goal_details(goal_id):
    """Display detailed information about a specific goal."""
    goal = get_goal_details(goal_id)
    
    if not goal:
        print("Goal not found.")
        return
    
    print(f"\n===== GOAL: {goal['title']} =====")
    print(f"Description: {goal['description']}")
    print(f"Importance: {goal['importance']}")
    print(f"Progress: {goal['completion_status']}%")
    print(f"Status: {goal['status']}")
    print(f"Start date: {goal['start_date'][:10]}")
    print(f"Target date: {goal['target_date'][:10]}")
    
    if goal['milestones']:
        print("\nMilestones:")
        for i, milestone in enumerate(goal['milestones'], 1):
            print(f"{i}. {milestone['title']} (Due: {milestone['target_date'][:10]}, Status: {milestone['status']})")
    
    if goal['reflections']:
        print("\nReflections:")
        for reflection_type, reflection in goal['reflections'].items():
            print(f"- {reflection_type.capitalize()}: {reflection['content'][:100]}...")
    
    if goal['progress_updates']:
        print("\nProgress Updates:")
        for update in goal['progress_updates']:
            # Get appropriate notes based on update type
            note_text = "No notes"
            if update.get('type') == 'progress' and update.get('progress_notes'):
                note_text = update['progress_notes']
            elif update.get('type') == 'effort' and update.get('effort_notes'):
                note_text = update['effort_notes']
                
            print(f"- {update['created_at'][:10]}: {update['progress_value']}% - {note_text}")
    
    return goal

def display_progress_summary():
    """Display a summary of the user's progress."""
    print("\n===== PROGRESS SUMMARY =====")
    summary = get_progress_summary()
    
    if not summary:
        print("Unable to get progress summary.")
        return
    
    stats = summary['summary']
    print(f"Total Goals: {stats['total_goals']}")
    print(f"Active Goals: {stats['active_goals']}")
    print(f"Completed Goals: {stats['completed_goals']}")
    print(f"Average Completion: {stats['avg_completion']:.1f}%")
    
    if summary['soon_due']:
        print("\nGoals Due Soon:")
        for goal in summary['soon_due']:
            print(f"- {goal['title']} (Due in {goal['days_remaining']} days, Progress: {goal['completion_status']}%)")
    
    if summary['recently_updated']:
        print("\nRecently Updated Goals:")
        for update in summary['recently_updated']:
            print(f"- {update['goal_title']} (Progress: {update['progress_value']}%)")

def clear_screen():
    """Clear the terminal screen."""
    os.system('cls' if os.name == 'nt' else 'clear')

def display_help():
    """Display help information about available commands."""
    print("\n===== AVAILABLE COMMANDS =====")
    print("/help - Display this help message")
    print("/exit or /quit - Exit the chat")
    print("/goals - List all your goals")
    print("/goal <id> - Show details of a specific goal")
    print("/summary - Show progress summary")
    print("/clear - Clear the screen")
    print("/history - Show recent chat history")
    print("/history all - Show full chat history including system messages")
    print("/debug - Toggle debug mode to show raw JSON responses")
    print("/delete - Delete the current user (WARNING: This cannot be undone!)")
    print("")
    print("Any other text will be sent as a message to the AI replica.")
    print("To discuss a specific goal, use: /chat <goal_id> and then chat normally.")
    print("To exit goal-specific chat, type /back")

def interactive_chat():
    """Interactive chat with the AI replica."""
    global DEBUG_MODE
    
    clear_screen()
    print("===== WELCOME TO STRATEGIST INTERACTIVE CHAT =====")
    print("You are now chatting with your AI strategic planning assistant.")
    print("Type /help for available commands or just start chatting!")
    print("=" * 50)
    
    active_goal_id = None
    
    while True:
        # Show prompt based on context
        if active_goal_id:
            goal = get_goal_details(active_goal_id)
            prompt = f"[Goal: {goal['title']}] > "
        else:
            prompt = "> "
        
        # Get user input
        user_input = input(prompt).strip()
        
        # Check for commands
        if user_input.lower() in ['/exit', '/quit']:
            print("Goodbye!")
            break
            
        elif user_input.lower() == '/help':
            display_help()
            
        elif user_input.lower() == '/goals':
            display_goals()
            
        elif user_input.lower().startswith('/goal '):
            try:
                goal_id = int(user_input[6:].strip())
                display_goal_details(goal_id)
            except ValueError:
                print("Invalid goal ID. Use /goals to see available goals.")
                
        elif user_input.lower() == '/summary':
            display_progress_summary()
            
        elif user_input.lower() == '/clear':
            clear_screen()
            
        elif user_input.lower() == '/debug':
            DEBUG_MODE = not DEBUG_MODE
            print(f"Debug mode {'enabled' if DEBUG_MODE else 'disabled'}")
            
        elif user_input.lower() == '/history':
            # Default to not showing system messages
            history = get_chat_history()
            print("\n===== RECENT CHAT HISTORY =====")
            for msg in history:
                if msg['sender'] == 'user':
                    sender = "You"
                elif msg['sender'] == 'replica':
                    sender = "AI"
                else:
                    continue  # Skip system messages in normal view
                print(f"{sender}: {msg['content']}")
            print("=" * 50)
            
        elif user_input.lower() == '/history all':
            # Show all messages including system messages
            history = get_chat_history(include_system=True)
            print("\n===== FULL CHAT HISTORY (INCLUDING SYSTEM MESSAGES) =====")
            for msg in history:
                if msg['sender'] == 'user':
                    sender = "You"
                elif msg['sender'] == 'replica':
                    sender = "AI"
                elif msg['sender'] == 'system':
                    sender = "[SYSTEM]"
                else:
                    sender = f"[{msg['sender']}]"
                print(f"{sender}: {msg['content']}")
            print("=" * 50)
            
        elif user_input.lower().startswith('/chat '):
            try:
                active_goal_id = int(user_input[6:].strip())
                goal = get_goal_details(active_goal_id)
                if goal:
                    print(f"Now chatting about goal: {goal['title']}")
                else:
                    print("Goal not found.")
                    active_goal_id = None
            except ValueError:
                print("Invalid goal ID. Use /goals to see available goals.")
                
        elif user_input.lower() == '/back':
            if active_goal_id:
                print("Returning to general chat.")
                active_goal_id = None
            else:
                print("You're not in a goal-specific chat.")
                
        elif user_input.lower() == '/delete':
            # Confirm before deletion
            confirm = input("Are you sure you want to delete your user account? This cannot be undone! (yes/no): ").strip().lower()
            if confirm == 'yes':
                if delete_user():
                    print("User deleted successfully. Exiting chat.")
                    break  # Exit the chat loop since user is deleted
                else:
                    print("Failed to delete user.")
            else:
                print("User deletion cancelled.")
                
        else:
            # Send message to AI
            response = send_message(user_input, active_goal_id)
            
            if response:
                # Display AI response
                print(f"AI: {response['ai_response']['content']}")
                
                # Display raw JSON in debug mode
                if DEBUG_MODE:
                    print("\n===== JSON RESPONSE =====")
                    pretty_print(response)
                    print("=" * 50)
                
                # Check if an action was performed
                if 'action_result' in response:
                    action = response['action_result']
                    action_type = action.get('action')
                    
                    if action_type == 'create_goal':
                        print(f"\n[System] Goal created: {action['goal']['title']} (ID: {action['goal']['id']})")
                        
                    elif action_type == 'update_progress':
                        print(f"\n[System] Progress updated to {action['progress_update']['progress_value']}%")
                        
                    elif action_type == 'save_reflection':
                        print(f"\n[System] Reflection saved: {action['reflection']['reflection_type']}")
                        
                    elif action_type == 'update_milestone':
                        print(f"\n[System] Milestone updated: {action['milestone']['status']}")

def main():
    """Run the interactive chat application."""
    try:
        # delete_user()
        # Authentication
        if not register_user():
            print("Failed to authenticate. Exiting.")
            return
        
        # Get user profile to verify everything is working
        user = get_user_profile()
        if not user:
            print("Failed to get user profile. Exiting.")
            return
        
        # Start the interactive chat
        interactive_chat()
        
    except KeyboardInterrupt:
        print("\nGoodbye!")
    except Exception as e:
        print(f"\nAn error occurred: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 