#!/usr/bin/env python3
"""
Test script for the Strategist application.
This script demonstrates the core functionality by interacting with the API.
"""

import os
import json
import logging
import requests
from datetime import datetime, timedelta
import time

# Setup basic logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

# Configuration
BASE_URL = "http://localhost:5000/api"
USERNAME = "testuser"
EMAIL = "testuser@example.com"
PASSWORD = "testpassword"

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
    
    # Log the auth headers to debug
    print(f"Authorization header: {auth_headers.get('Authorization', 'MISSING!')}")
    
    response = requests.get(
        f"{BASE_URL}/auth/profile",
        headers=auth_headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"User profile retrieved: {data['user']['username']}")
        pretty_print(data)
        return True
    else:
        print(f"Failed to get profile: {response.status_code}")
        pretty_print(response.json())
        return False

def create_goal():
    """Create a new goal."""
    print("\n===== CREATING A GOAL =====")
    
    # Target date is 3 months from now
    target_date = (datetime.now() + timedelta(days=90)).isoformat()
    # print(datetime.now())
    # print(target_date)
    
    response = requests.post(
        f"{BASE_URL}/goals/",
        headers=auth_headers,
        json={
            "title": "Learn Python Flask",
            "description": "Develop a strong understanding of Flask web framework for building web applications with Python.",
            "target_date": target_date,
            "importance": "Learning Flask will enhance my web development skills and make me more versatile as a developer.",
            "milestones": [
                {
                    "title": "Complete Flask basics tutorial",
                    "description": "Go through the official Flask documentation and examples.",
                    "target_date": (datetime.now() + timedelta(days=30)).isoformat()
                },
                {
                    "title": "Build a simple CRUD application",
                    "description": "Create a basic todo application with Flask.",
                    "target_date": (datetime.now() + timedelta(days=60)).isoformat()
                },
                {
                    "title": "Deploy Flask app to production",
                    "description": "Learn how to deploy a Flask application to a production server.",
                    "target_date": (datetime.now() + timedelta(days=90)).isoformat()
                }
            ],
            "reflections": {
                "importance": "Flask is widely used in industry and will help me build web applications quickly.",
                "obstacles": "Time constraints and competing priorities might slow my progress."
            }
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"Goal created successfully: {data['goal']['title']}")
        goal_id = data['goal']['id']
        print(f"Goal ID: {goal_id}")
        return goal_id
    else:
        print(f"Failed to create goal: {response.status_code}")
        pretty_print(response.json())
        return None

def create_goal_via_chat():
    """Create a goal through conversation with the AI replica."""
    print("\n===== CREATING A GOAL VIA CHAT =====")
    
    # Start the goal creation conversation
    print("Starting goal creation conversation...")
    response = requests.post(
        f"{BASE_URL}/chat/create-goal",
        headers=auth_headers,
        json={
            "content": "I want to create a goal to learn machine learning"
        }
    )
    
    if response.status_code != 200:
        print(f"Failed to start goal creation: {response.status_code}")
        pretty_print(response.json())
        return None
    
    data = response.json()
    print(f"AI: {data['ai_response']['content']}")
    
    # # Continue the conversation with multiple exchanges
    # conversation_steps = [
    #     "I want to become proficient in machine learning techniques and be able to build practical ML models for real-world problems.",
    #     # "I think it's important because machine learning skills are in high demand, and I want to enhance my career prospects. Also, I'm fascinated by how ML can extract insights from data.",
    #     # "I think 6 months from now would be a reasonable target date.",
    #     # "For milestones, I'd like to 1) Learn the mathematical foundations, 2) Master Python libraries like scikit-learn and TensorFlow, 3) Build my first prediction model, and 4) Complete an end-to-end ML project.",
    #     # "Challenges might include the math prerequisites, finding time to practice consistently, and keeping up with the rapidly changing field."
    # ]
    
    # # Simulate a conversation
    # for i, message in enumerate(conversation_steps):
    #     print(f"\nUser: {message}")
        
    #     # Send message to continue the conversation
    #     response = requests.post(
    #         f"{BASE_URL}/chat/goal-chat",
    #         headers=auth_headers,
    #         json={
    #             "content": message,
    #             "finalize": i == len(conversation_steps) - 1  # Finalize on the last message
    #         }
    #     )
        
    #     if response.status_code != 200:
    #         print(f"Failed to continue goal creation: {response.status_code}")
    #         pretty_print(response.json())
    #         return None
        
    #     data = response.json()
    #     print(f"AI: {data['ai_response']['content']}")
        
    #     # If a goal was created, return its ID
    #     if data.get('goal_created', False) and 'goal' in data:
    #         goal_id = data['goal']['id']
    #         print(f"Goal created successfully via chat: ID {goal_id}")
    #         return goal_id
    
    # print("Completed conversation but no goal was created")
    return None

def create_subgoal(parent_goal_id):
    """Create a subgoal for a parent goal."""
    print("\n===== CREATING A SUBGOAL =====")
    
    # Target date is 2 months from now
    target_date = (datetime.now() + timedelta(days=60)).isoformat()
    
    response = requests.post(
        f"{BASE_URL}/goals/",
        headers=auth_headers,
        json={
            "title": "Master Flask Database Integration",
            "description": "Learn how to effectively use SQLAlchemy with Flask for database operations.",
            "target_date": target_date,
            "parent_goal_id": parent_goal_id,
            "milestones": [
                {
                    "title": "Understand SQLAlchemy basics",
                    "description": "Learn the core concepts of SQLAlchemy ORM.",
                    "target_date": (datetime.now() + timedelta(days=20)).isoformat()
                },
                {
                    "title": "Implement database models",
                    "description": "Create effective database models for a Flask application.",
                    "target_date": (datetime.now() + timedelta(days=40)).isoformat()
                },
                {
                    "title": "Master migrations and schema updates",
                    "description": "Learn how to handle database migrations and schema changes.",
                    "target_date": (datetime.now() + timedelta(days=60)).isoformat()
                }
            ]
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"Subgoal created successfully: {data['goal']['title']}")
        return data['goal']['id']
    else:
        print(f"Failed to create subgoal: {response.status_code}")
        pretty_print(response.json())
        return None

def get_goals():
    """Get all goals for the user."""
    print("\n===== GETTING ALL GOALS =====")
    
    response = requests.get(
        f"{BASE_URL}/goals/",
        headers=auth_headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"Retrieved {len(data['goals'])} goals")
        for goal in data['goals']:
            print(f"- {goal['title']} (Progress: {goal['completion_status']}%, Subgoals: {goal['subgoals_count']})")
        return data['goals']
    else:
        print(f"Failed to get goals: {response.status_code}")
        pretty_print(response.json())
        return []

def get_goal_details(goal_id):
    """Get detailed information for a specific goal."""
    print(f"\n===== GETTING GOAL DETAILS (ID: {goal_id}) =====")
    
    response = requests.get(
        f"{BASE_URL}/goals/{goal_id}",
        headers=auth_headers
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"Goal: {data['goal']['title']}")
        print(f"Description: {data['goal']['description']}")
        print(f"Progress: {data['goal']['completion_status']}%")
        print(f"Status: {data['goal']['status']}")
        
        print("\nMilestones:")
        for milestone in data['goal']['milestones']:
            print(f"- {milestone['title']} (Due: {milestone['target_date']}, Status: {milestone['status']})")
        
        print("\nReflections:")
        for reflection_type, reflection in data['goal']['reflections'].items():
            print(f"- {reflection_type}: {reflection['content'][:100]}...")
        
        if data['goal']['subgoals']:
            print("\nSubgoals:")
            for subgoal in data['goal']['subgoals']:
                print(f"- {subgoal['title']} (Progress: {subgoal['completion_status']}%)")
        
        return data['goal']
    else:
        print(f"Failed to get goal details: {response.status_code}")
        pretty_print(response.json())
        return None

def update_goal_progress(goal_id, progress_value, notes=""):
    """Update the progress of a goal."""
    print(f"\n===== UPDATING GOAL PROGRESS (ID: {goal_id}) =====")
    
    response = requests.post(
        f"{BASE_URL}/progress/goals/{goal_id}/updates",
        headers=auth_headers,
        json={
            "progress_value": progress_value,
            "notes": notes
        }
    )
    
    if response.status_code == 201:
        data = response.json()
        print(f"Progress updated to {data['progress_update']['progress_value']}%")
        print(f"Notes: {data['progress_update']['notes']}")
        return True
    else:
        print(f"Failed to update progress: {response.status_code}")
        pretty_print(response.json())
        return False

def add_reflection(goal_id, reflection_type, content):
    """Add a reflection to a goal."""
    print(f"\n===== ADDING REFLECTION (ID: {goal_id}, Type: {reflection_type}) =====")
    
    response = requests.post(
        f"{BASE_URL}/goals/{goal_id}/reflections",
        headers=auth_headers,
        json={
            "reflection_type": reflection_type,
            "content": content
        }
    )
    
    if response.status_code in [200, 201]:
        data = response.json()
        print(f"Reflection added: {reflection_type}")
        return True
    else:
        print(f"Failed to add reflection: {response.status_code}")
        pretty_print(response.json())
        return False

def chat_with_replica():
    """Demonstrate chat with the Sensay replica."""
    print("\n===== CHATTING WITH AI REPLICA =====")
    
    # Send an initial message
    message = "I want to set a goal to learn a new programming language. Can you help me plan this?"
    
    response = requests.post(
        f"{BASE_URL}/chat/send",
        headers=auth_headers,
        json={
            "content": message
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"User: {data['user_message']['content']}")
        print(f"AI: {data['ai_response']['content']}")
        
        # Send a follow-up message
        follow_up = "I'm thinking about learning Rust. How long should I give myself to become proficient, and what milestones would be appropriate?"
        
        response = requests.post(
            f"{BASE_URL}/chat/send",
            headers=auth_headers,
            json={
                "content": follow_up
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\nUser: {data['user_message']['content']}")
            print(f"AI: {data['ai_response']['content']}")
            return True
        else:
            print(f"Failed to send follow-up message: {response.status_code}")
            pretty_print(response.json())
            return False
    else:
        print(f"Failed to send message: {response.status_code}")
        pretty_print(response.json())
        return False

def analyze_goal(goal_id):
    """Ask the AI to analyze a goal."""
    print(f"\n===== ANALYZING GOAL (ID: {goal_id}) =====")
    
    response = requests.post(
        f"{BASE_URL}/chat/analyze-goal/{goal_id}",
        headers=auth_headers,
        json={
            "analysis_type": "strategy",
            "save_as_reflection": True
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        print(f"Analysis: {data['analysis']['content'][:200]}...")
        return True
    else:
        print(f"Failed to analyze goal: {response.status_code}")
        pretty_print(response.json())
        return False

def get_progress_summary():
    """Get a summary of the user's goals and progress."""
    print("\n===== GETTING PROGRESS SUMMARY =====")
    
    response = requests.get(
        f"{BASE_URL}/progress/summary",
        headers=auth_headers
    )
    
    if response.status_code == 200:
        data = response.json()
        summary = data['summary']
        
        print(f"Total Goals: {summary['total_goals']}")
        print(f"Active Goals: {summary['active_goals']}")
        print(f"Completed Goals: {summary['completed_goals']}")
        print(f"Average Completion: {summary['avg_completion']:.1f}%")
        
        if data['soon_due']:
            print("\nGoals Due Soon:")
            for goal in data['soon_due']:
                print(f"- {goal['title']} (Due in {goal['days_remaining']} days, Progress: {goal['completion_status']}%)")
        
        if data['recently_updated']:
            print("\nRecently Updated Goals:")
            for update in data['recently_updated']:
                print(f"- {update['goal_title']} (Progress: {update['progress_value']}%)")
        
        return True
    else:
        print(f"Failed to get progress summary: {response.status_code}")
        pretty_print(response.json())
        return False

def main():
    """Run the full test script."""
    # Authentication
    if not register_user():
        return
    
    # Get user profile
    get_user_profile()
    
    # Test both ways to create goals
    # print("\n===== TESTING BOTH GOAL CREATION METHODS =====")
    # print("1. Creating a goal programmatically")
    # direct_goal_id = create_goal()
    
    print("\n2. Creating a goal through chat with AI")
    chat_goal_id = create_goal_via_chat()
    
    # # Compare goals
    # if direct_goal_id and chat_goal_id:
    #     print("\nBoth goal creation methods worked successfully!")
        
    #     # Get details for both goals
    #     direct_goal = get_goal_details(direct_goal_id)
    #     chat_goal = get_goal_details(chat_goal_id)
        
    #     # Create a subgoal for the chat-created goal
    #     if chat_goal:
    #         subgoal_id = create_subgoal(chat_goal_id)
    #         if subgoal_id:
    #             print(f"Created a subgoal for the chat-created goal")
        
    #     # Get all goals to see them together
    #     get_goals()
        
    #     # Update progress for the chat-created goal
    #     if chat_goal_id:
    #         update_goal_progress(chat_goal_id, 25, "Started working on the first milestone!")
        
    #     # Add a reflection to the chat-created goal
    #     if chat_goal_id:
    #         add_reflection(chat_goal_id, "strategy", "I should focus on building a practical project to solidify my learning.")
        
    #     # Get progress summary
    #     get_progress_summary()
        
    #     # Analyze the chat-created goal
    #     if chat_goal_id:
    #         analyze_goal(chat_goal_id)
    
    print("\n===== TEST COMPLETED SUCCESSFULLY =====")

if __name__ == "__main__":
    main() 