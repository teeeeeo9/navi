import os
import logging
import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc

from app import db
from app.models import User, ChatMessage, Goal, Reflection, ProgressUpdate, Milestone
from app.services.sensay import get_sensay_client, SensayAPIError
from app.prompts import STRATEGIST_SYSTEM_MESSAGE, STRATEGIST_GREETING

# Get logger
logger = logging.getLogger('strategist.chat')

chat_bp = Blueprint('chat', __name__)

# Constants
REPLICA_SLUG = os.environ.get('SENSAY_REPLICA_SLUG', 'strategist_planning_assistant')

# System update message prefix
SYSTEM_UPDATE_PREFIX = "SYSTEM_UPDATE:"

@chat_bp.route('/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    """Get chat history for the current user."""
    user_id = get_jwt_identity()
    logger.info(f"Getting chat history for user ID: {user_id}")
    
    user = User.query.get(user_id)
    
    if not user:
        logger.warning(f"Chat history retrieval failed: User not found: {user_id}")
        return jsonify({'error': 'User not found'}), 404
    
    # Get query parameters
    limit = request.args.get('limit', 50, type=int)
    offset = request.args.get('offset', 0, type=int)
    goal_id = request.args.get('goal_id', type=int)
    include_system = request.args.get('include_system', 'false').lower() == 'true'
    
    logger.debug(f"Chat history query params - limit: {limit}, offset: {offset}, goal_id: {goal_id}, include_system: {include_system}")
    
    # Build query
    query = ChatMessage.query.filter_by(user_id=user_id)
    
    # Filter by goal_id if provided
    if goal_id:
        query = query.filter_by(related_goal_id=goal_id)
        logger.debug(f"Filtering chat history by goal_id: {goal_id}")
    
    # Filter out system messages unless explicitly included
    if not include_system:
        query = query.filter(ChatMessage.sender != 'system')
        logger.debug("Filtering out system messages from chat history")
    
    # Count total matching messages for pagination info
    total_messages = query.count()
    
    # Order by creation date (newest first), apply offset and limit
    messages = query.order_by(desc(ChatMessage.created_at)).offset(offset).limit(limit).all()
    
    # Reverse to get chronological order
    messages.reverse()
    
    logger.info(f"Retrieved {len(messages)} chat messages for user {user_id} (offset: {offset}, limit: {limit})")
    
    messages_data = []
    for message in messages:
        messages_data.append({
            'id': message.id,
            'sender': message.sender,
            'content': message.content,
            'related_goal_id': message.related_goal_id,
            'created_at': message.created_at.isoformat()
        })
    
    # Include pagination info in response
    response = {
        'messages': messages_data,
        'pagination': {
            'total': total_messages,
            'offset': offset,
            'limit': limit,
            'has_more': offset + len(messages) < total_messages
        }
    }
    
    return jsonify(response), 200

@chat_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message to the AI replica and get a response.
    
    The replica will analyze the conversation context and determine if any special actions need to be taken,
    such as creating a goal, analyzing a goal, updating progress, etc.
    """
    user_id = get_jwt_identity()
    logger.info(f"Processing send message request for user ID: {user_id}")
    
    user = User.query.get(user_id)
    
    if not user:
        logger.warning(f"Message sending failed: User not found: {user_id}")
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Validate message content
    if 'content' not in data or not data['content'].strip():
        logger.warning("Message sending failed: Empty message content")
        return jsonify({'error': 'Message content is required'}), 400
    
    # Get the related goal ID if provided
    related_goal_id = data.get('related_goal_id')
    
    logger.debug(f"Message params - content length: {len(data['content'])}, related_goal_id: {related_goal_id}")
    
    # If related_goal_id is provided, verify it exists and belongs to the user
    if related_goal_id:
        goal = Goal.query.filter_by(id=related_goal_id, user_id=user_id).first()
        if not goal:
            logger.warning(f"Message sending failed: Related goal not found: {related_goal_id}")
            return jsonify({'error': 'Related goal not found'}), 404
        logger.debug(f"Message related to goal: {goal.title}")
    
    # Determine if this is a system message (for development/testing purposes)
    is_system_message = data.get('is_system_message', False)
    sender = 'system' if is_system_message else 'user'
    
    # Create the message in the database
    user_message = ChatMessage(
        user_id=user_id,
        sender=sender,
        content=data['content'],
        related_goal_id=related_goal_id
    )
    
    try:
        db.session.add(user_message)
        db.session.commit()
        logger.debug(f"{sender.capitalize()} message saved to database, ID: {user_message.id}")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to save {sender} message: {str(e)}", exc_info=True)
        return jsonify({'error': f'Database error: {str(e)}'}), 500
    
    try:
        # Initialize Sensay client
        logger.debug("Initializing Sensay client")
        sensay_client = get_sensay_client()
        
        # Get or create the replica
        logger.debug(f"Ensuring replica exists for user: {user.sensay_user_id}")
        try:
            replica_id = ensure_replica_exists(sensay_client, user.sensay_user_id)
            logger.debug(f"Using replica ID: {replica_id}")
        except Exception as e:
            logger.error(f"Failed to get/create replica: {str(e)}", exc_info=True)
            return jsonify({'error': f'Failed to initialize AI replica: {str(e)}'}), 500
        
        # Enhance message with goal context if related to a goal
        content_to_send = data['content']
        if related_goal_id:
            goal_context = get_goal_context(goal)
            content_to_send = f"{goal_context}\n\n{content_to_send}"
        
        # Send the message to Sensay
        logger.info(f"Sending message to Sensay API, content length: {len(content_to_send)}")
        try:
            response = sensay_client.create_chat_completion(
                replica_id=replica_id,
                user_id=user.sensay_user_id,
                content=content_to_send,
                source='web',
                skip_chat_history=False
            )
            logger.debug("Successfully received response from Sensay API")
        except SensayAPIError as e:
            logger.error(f"Sensay API error: {str(e)}")
            return jsonify({'error': f'AI response error: {str(e)}'}), 500
        
        # Get the AI response content
        ai_content = response.get('content', 'Sorry, I could not generate a response.')
        logger.debug(f"AI response length: {len(ai_content)}")
        
        # Process any actions in the AI response
        action_result = None
        display_content = ai_content
        
        # Extract and process any action JSON from the response
        action_data = extract_action_json(ai_content)
        if action_data:
            logger.info(f"Extracted action from AI response: {action_data.get('action_type', 'unknown')}")
            
            # Process the action
            action_result, display_content = process_action(action_data, user_id, related_goal_id)
            
            # If we couldn't process the action, use the original content
            if not display_content:
                display_content = ai_content
        
        # Create the AI response message in the database (with the display version)
        ai_message = ChatMessage(
            user_id=user_id,
            sender='replica',
            content=display_content,
            related_goal_id=related_goal_id
        )
        
        try:
            db.session.add(ai_message)
            db.session.commit()
            logger.debug(f"AI message saved to database, ID: {ai_message.id}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to save AI message: {str(e)}", exc_info=True)
            return jsonify({'error': f'Database error: {str(e)}'}), 500
        
        logger.info(f"Message exchange completed successfully for user: {user_id}")
        
        response_data = {
            'message': 'Message sent successfully',
            'user_message': {
                'id': user_message.id,
                'sender': user_message.sender,
                'content': user_message.content,
                'related_goal_id': user_message.related_goal_id,
                'created_at': user_message.created_at.isoformat(),
                'is_system': user_message.sender == 'system'  # Flag for frontend
            },
            'ai_response': {
                'id': ai_message.id,
                'sender': ai_message.sender,
                'content': display_content,
                'related_goal_id': ai_message.related_goal_id,
                'created_at': ai_message.created_at.isoformat(),
                'is_system': False  # AI responses are never system messages
            }
        }
        
        # Include action result if any
        if action_result:
            response_data['action_result'] = action_result
        
        return jsonify(response_data), 200
        
    except Exception as e:
        # Log the error
        logger.error(f"Unexpected error during message processing: {str(e)}", exc_info=True)
        current_app.logger.error(f"Error sending message to Sensay: {str(e)}")
        
        # Return error response
        return jsonify({'error': f'Failed to communicate with the AI replica: {str(e)}'}), 500

def get_goal_context(goal):
    """Generate context information about a goal for the AI."""
    context = (
        f"[GOAL CONTEXT]\n"
        f"Goal ID: {goal.id}\n"
        f"Title: {goal.title}\n"
        f"Description: {goal.description or 'No description'}\n"
        f"Start date: {goal.start_date.strftime('%Y-%m-%d')}\n"
        f"Target date: {goal.target_date.strftime('%Y-%m-%d')}\n"
        f"Current progress: {goal.completion_status}%\n"
        f"Status: {goal.status}\n"
    )
    
    # Include milestones if available
    if goal.milestones:
        context += "\nMilestones:\n"
        for milestone in goal.milestones:
            context += f"- ID: {milestone.id}, Title: {milestone.title}, Due: {milestone.target_date.strftime('%Y-%m-%d')}, Status: {milestone.status}, Progress: {milestone.completion_status}%\n"
    
    # Include reflections if available
    if goal.reflections:
        context += "\nReflections:\n"
        for reflection in goal.reflections:
            context += f"- Type: {reflection.reflection_type}, Created: {reflection.created_at.strftime('%Y-%m-%d')}\n"
    
    # Include recent progress updates
    progress_updates = ProgressUpdate.query.filter_by(goal_id=goal.id).order_by(desc(ProgressUpdate.created_at)).limit(3).all()
    if progress_updates:
        context += "\nRecent Progress Updates:\n"
        for update in progress_updates:
            context += f"- Date: {update.created_at.strftime('%Y-%m-%d')}, Progress: {update.progress_value}%, Notes: {update.notes or 'No notes'}\n"
    
    context += "\n[END GOAL CONTEXT]\n\n"
    return context

def extract_action_json(ai_content):
    """Extract action JSON data from AI response text."""
    logger.debug("Checking for action data in AI response")
    
    # Try to find JSON in the response
    json_start_markers = [
        '```json',
        '```',
        '{',
        'Here\'s the action:',
        'Action:'
    ]
    
    json_end_markers = [
        '```',
        '}'
    ]
    
    # First try to find JSON blocks with markers
    for start_marker in json_start_markers:
        if start_marker in ai_content:
            start_idx = ai_content.find(start_marker) + len(start_marker)
            
            # Find the end of JSON
            end_idx = None
            if start_marker != '{':  # If we have a distinct start marker
                for end_marker in json_end_markers:
                    if end_marker in ai_content[start_idx:]:
                        marker_idx = ai_content[start_idx:].find(end_marker)
                        if end_marker == '}':  # If the end marker is }, we need to include it
                            marker_idx += 1
                        end_idx = start_idx + marker_idx
                        break
            else:  # If start marker is {, we need to find the matching }
                # Simple approach - find the last }
                if '}' in ai_content[start_idx-1:]:
                    end_idx = ai_content.rfind('}') + 1
            
            if end_idx:
                json_str = ai_content[start_idx:end_idx].strip()
                try:
                    # Handle case where the JSON might not start immediately after the marker
                    if not json_str.startswith('{'):
                        json_start = json_str.find('{')
                        if json_start >= 0:
                            json_str = json_str[json_start:]
                    
                    data = json.loads(json_str)
                    # Validate that it contains an action_type
                    if 'action_type' in data:
                        return data
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse extracted JSON: {str(e)}")
                    continue  # Try next marker
    
    # If no JSON found with markers, try to find any valid JSON with action_type
    try:
        # Look for any text between { and }
        start_idx = ai_content.find('{')
        if start_idx >= 0:
            end_idx = ai_content.rfind('}') + 1
            if end_idx > start_idx:
                json_str = ai_content[start_idx:end_idx]
                data = json.loads(json_str)
                if 'action_type' in data:
                    return data
    except json.JSONDecodeError:
        pass
    
    logger.debug("No action JSON found in AI response")
    return None

def process_action(action_data, user_id, related_goal_id=None):
    """Process the action requested by the AI and return the result."""
    action_type = action_data.get('action_type')
    data = action_data.get('data', {})
    
    logger.info(f"Processing action: {action_type}")
    
    # Strip the JSON part from the display message
    display_content = None
    
    if action_type == 'create_goal':
        # Create a new goal
        try:
            logger.info("Creating new goal from AI action")
            
            # Format dates properly
            if 'target_date' in data and data['target_date']:
                try:
                    datetime.fromisoformat(data['target_date'])
                except ValueError:
                    # Try to parse the date if it's not in ISO format
                    from dateutil import parser
                    try:
                        parsed_date = parser.parse(data['target_date'])
                        data['target_date'] = parsed_date.isoformat()
                    except:
                        # Default to 3 months from now if parsing fails
                        data['target_date'] = (datetime.utcnow() + timedelta(days=90)).isoformat()
            
            # Process milestones
            if 'milestones' in data and isinstance(data['milestones'], list):
                for milestone in data['milestones']:
                    if 'target_date' in milestone and milestone['target_date']:
                        try:
                            datetime.fromisoformat(milestone['target_date'])
                        except ValueError:
                            # Try to parse the date
                            from dateutil import parser
                            try:
                                parsed_date = parser.parse(milestone['target_date'])
                                milestone['target_date'] = parsed_date.isoformat()
                            except:
                                # Default to halfway to goal target
                                goal_target = datetime.fromisoformat(data['target_date'])
                                milestone['target_date'] = (datetime.utcnow() + (goal_target - datetime.utcnow()) / 2).isoformat()
            
            # Import here to avoid circular imports
            from app.api.goals import create_goal_internal
            
            # Create the goal
            goal = create_goal_internal(user_id, data)
            
            logger.info(f"Successfully created goal with ID: {goal['id']}")
            
            # Return the created goal and a user-friendly message
            display_content = action_data.get('display_message', 'Great! I\'ve created your goal. You can now view and track it in your goals dashboard.')
            
            return {
                'action': 'create_goal',
                'goal': goal
            }, display_content
            
        except Exception as e:
            logger.error(f"Failed to create goal: {str(e)}", exc_info=True)
            return {
                'action': 'create_goal',
                'error': str(e)
            }, None
    
    elif action_type == 'save_reflection':
        # Save a reflection on a goal
        try:
            goal_id = data.get('goal_id') or related_goal_id
            if not goal_id:
                raise ValueError("Goal ID is required for saving a reflection")
            
            reflection_type = data.get('reflection_type')
            if not reflection_type:
                raise ValueError("Reflection type is required")
            
            content = data.get('content')
            if not content:
                raise ValueError("Reflection content is required")
            
            # Verify goal exists and belongs to user
            goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
            if not goal:
                raise ValueError(f"Goal not found: {goal_id}")
            
            # Check if reflection type already exists
            existing_reflection = Reflection.query.filter_by(
                goal_id=goal_id, 
                reflection_type=reflection_type
            ).first()
            
            if existing_reflection:
                # Update existing reflection
                existing_reflection.content = content
                existing_reflection.updated_at = datetime.utcnow()
                reflection_id = existing_reflection.id
                logger.info(f"Updated existing reflection ID: {reflection_id}")
            else:
                # Create new reflection
                reflection = Reflection(
                    goal_id=goal_id,
                    reflection_type=reflection_type,
                    content=content
                )
                db.session.add(reflection)
                db.session.flush()  # To get the ID
                reflection_id = reflection.id
                logger.info(f"Created new reflection ID: {reflection_id}")
            
            db.session.commit()
            
            # Return the reflection info
            display_content = action_data.get('display_message')
            
            return {
                'action': 'save_reflection',
                'reflection': {
                    'id': reflection_id,
                    'goal_id': goal_id,
                    'reflection_type': reflection_type
                }
            }, display_content
            
        except Exception as e:
            logger.error(f"Failed to save reflection: {str(e)}", exc_info=True)
            return {
                'action': 'save_reflection',
                'error': str(e)
            }, None
    
    elif action_type == 'update_progress':
        # Update progress on a goal
        try:
            goal_id = data.get('goal_id') or related_goal_id
            if not goal_id:
                raise ValueError("Goal ID is required for updating progress")
            
            progress_value = data.get('progress_value')
            if progress_value is None:
                raise ValueError("Progress value is required")
            
            notes = data.get('notes', '')
            
            # Verify goal exists and belongs to user
            goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
            if not goal:
                raise ValueError(f"Goal not found: {goal_id}")
            
            # Create progress update
            update = ProgressUpdate(
                goal_id=goal_id,
                progress_value=progress_value,
                notes=notes
            )
            
            # Update goal completion status
            goal.completion_status = progress_value
            
            # If progress is 100%, mark goal as completed
            if progress_value == 100 and goal.status == 'active':
                goal.status = 'completed'
            
            db.session.add(update)
            db.session.commit()
            
            logger.info(f"Updated progress for goal ID {goal_id} to {progress_value}%")
            
            # Return the progress update info
            display_content = action_data.get('display_message')
            
            return {
                'action': 'update_progress',
                'progress_update': {
                    'id': update.id,
                    'goal_id': goal_id,
                    'progress_value': progress_value,
                    'notes': notes
                }
            }, display_content
            
        except Exception as e:
            logger.error(f"Failed to update progress: {str(e)}", exc_info=True)
            return {
                'action': 'update_progress',
                'error': str(e)
            }, None
    
    elif action_type == 'update_milestone':
        # Update a milestone
        try:
            goal_id = data.get('goal_id') or related_goal_id
            if not goal_id:
                raise ValueError("Goal ID is required for updating a milestone")
            
            milestone_id = data.get('milestone_id')
            if not milestone_id:
                raise ValueError("Milestone ID is required")
            
            # Verify goal exists and belongs to user
            goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
            if not goal:
                raise ValueError(f"Goal not found: {goal_id}")
            
            # Verify milestone exists and belongs to goal
            milestone = Milestone.query.filter_by(id=milestone_id, goal_id=goal_id).first()
            if not milestone:
                raise ValueError(f"Milestone not found: {milestone_id}")
            
            # Update milestone fields
            if 'status' in data:
                valid_statuses = ['pending', 'completed', 'missed']
                if data['status'] in valid_statuses:
                    milestone.status = data['status']
                else:
                    raise ValueError(f"Invalid status: {data['status']}. Must be one of: {', '.join(valid_statuses)}")
            
            if 'completion_status' in data:
                try:
                    completion_status = float(data['completion_status'])
                    if 0 <= completion_status <= 100:
                        milestone.completion_status = completion_status
                    else:
                        raise ValueError("Completion status must be between 0 and 100")
                except (ValueError, TypeError):
                    raise ValueError("Invalid completion_status format. Must be a number between 0 and 100")
            
            db.session.commit()
            
            logger.info(f"Updated milestone ID {milestone_id} for goal ID {goal_id}")
            
            # Return the milestone info
            display_content = action_data.get('display_message')
            
            return {
                'action': 'update_milestone',
                'milestone': {
                    'id': milestone.id,
                    'goal_id': goal_id,
                    'status': milestone.status,
                    'completion_status': milestone.completion_status
                }
            }, display_content
            
        except Exception as e:
            logger.error(f"Failed to update milestone: {str(e)}", exc_info=True)
            return {
                'action': 'update_milestone',
                'error': str(e)
            }, None
    
    else:
        logger.warning(f"Unknown action type: {action_type}")
        return None, None

def ensure_replica_exists(sensay_client, sensay_user_id):
    """Ensure the planning assistant replica exists for the user.
    
    This function will:
    1. Check if the user already has a replica in the database
    2. If they do, return that replica ID
    3. If they don't, create a new replica and store its ID
    """
    logger.info(f"Ensuring replica exists for user: {sensay_user_id}")
    
    try:
        # Check if we have a user with this Sensay user ID
        user = User.query.filter_by(sensay_user_id=sensay_user_id).first()
        if not user:
            logger.warning(f"No local user found for Sensay user ID: {sensay_user_id}")
            raise ValueError(f"No user found for Sensay user ID: {sensay_user_id}")
        
        # Check if the user already has a replica_id stored
        if hasattr(user, 'replica_id') and user.replica_id:
            logger.info(f"User already has a replica ID stored: {user.replica_id}")
            
            # Verify the replica still exists in Sensay
            try:
                sensay_client.get_replica(user.replica_id, sensay_user_id)
                logger.info(f"Confirmed replica exists in Sensay: {user.replica_id}")
                return user.replica_id
            except Exception as e:
                logger.warning(f"Stored replica ID {user.replica_id} not found in Sensay: {str(e)}")
                # If verification fails, we'll create a new replica below
        
        # Get list of existing replicas for the user from Sensay
        logger.debug(f"Checking for existing replicas for user: {sensay_user_id}")
        replicas_response = sensay_client.list_replicas(sensay_user_id)
        replicas = replicas_response.get('items', [])
        
        # If user has any replicas, use the first one
        if replicas:
            replica_id = replicas[0].get('uuid')
            logger.info(f"Found existing replica with ID: {replica_id}")
            
            # Store this replica ID with the user if we have a replica_id field
            if hasattr(user, 'replica_id'):
                user.replica_id = replica_id
                try:
                    db.session.commit()
                    logger.info(f"Updated user record with replica ID: {replica_id}")
                except Exception as e:
                    db.session.rollback()
                    logger.error(f"Failed to update user with replica ID: {str(e)}")
                    
            return replica_id
        
        # No replica found, create one with a unique slug
        from datetime import datetime
        unique_timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        unique_slug = f"{REPLICA_SLUG}_{unique_timestamp}"
        
        logger.info(f"Creating new replica with unique slug: {unique_slug}")
        replica_data = {
            'name': 'Strategic Planning Assistant',
            'shortDescription': 'A replica to help with strategic planning',
            'greeting': STRATEGIST_GREETING,
            'slug': unique_slug,
            'ownerID': sensay_user_id,
            'llm': {
                'model': 'claude-3-7-sonnet-latest',
                'memoryMode': 'prompt-caching',
                'systemMessage': STRATEGIST_SYSTEM_MESSAGE
            }
        }
        
        new_replica = sensay_client.create_replica(sensay_user_id, replica_data)
        replica_id = new_replica.get('uuid')
        logger.info(f"Created new replica with ID: {replica_id}")
        
        # Store this replica ID with the user if we have a replica_id field
        if hasattr(user, 'replica_id'):
            user.replica_id = replica_id
            try:
                db.session.commit()
                logger.info(f"Updated user record with new replica ID: {replica_id}")
            except Exception as e:
                db.session.rollback()
                logger.error(f"Failed to update user with new replica ID: {str(e)}")
        
        return replica_id
        
    except Exception as e:
        logger.error(f"Error ensuring replica exists: {str(e)}", exc_info=True)
        current_app.logger.error(f"Error ensuring replica exists: {str(e)}")
        raise

# Function to send system updates about UI changes to the replica
def send_system_update(user_id, update_message, related_goal_id=None, save_message=True):
    """
    Send a system update message to the replica when the user makes changes through the UI.
    
    Args:
        user_id (int): The ID of the user
        update_message (str): The system update message (without the prefix)
        related_goal_id (int, optional): The ID of the related goal if applicable
        save_message (bool, optional): Whether to save the system message in chat history
                                      (default is True, but some updates may not need to be saved)
    
    Returns:
        dict: The replica's response or None if an error occurred
    """
    logger.info(f"Sending system update for user {user_id}: {update_message}")
    
    user = User.query.get(user_id)
    if not user:
        logger.warning(f"User not found: {user_id}")
        return None
    
    # Format the system update message
    # Handle special case for initial "Hello" message
    if update_message == "Hello":
        is_initial_message = True
        # system_message = update_message  # Don't add prefix for initial Hello message
    else:
        is_initial_message = False
    system_message = f"{SYSTEM_UPDATE_PREFIX} {update_message}"
    
    # Optionally save the system message to the database
    # Note: System messages might be hidden in the UI but stored for context
    if save_message:
        # For initial hello message, make sender 'user' so it appears in the chat
        sender = 'user' if is_initial_message else 'system'
        system_chat_message = ChatMessage(
            user_id=user_id,
            sender=sender,
            content=system_message,
            related_goal_id=related_goal_id
        )
        
        try:
            db.session.add(system_chat_message)
            db.session.commit()
            logger.debug(f"System message saved to database, ID: {system_chat_message.id}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to save system message: {str(e)}", exc_info=True)
            # Continue even if saving fails
    
    try:
        # Initialize Sensay client
        sensay_client = get_sensay_client()
        
        # Get or create the replica
        try:
            replica_id = ensure_replica_exists(sensay_client, user.sensay_user_id)
            logger.debug(f"Using replica ID: {replica_id}")
        except Exception as e:
            logger.error(f"Failed to get/create replica: {str(e)}", exc_info=True)
            return None
        
        # Enhance message with goal context if related to a goal
        content_to_send = system_message
        if related_goal_id:
            goal = Goal.query.get(related_goal_id)
            if goal:
                goal_context = get_goal_context(goal)
                content_to_send = f"{goal_context}\n\n{content_to_send}"
        
        # Send the system update to Sensay
        logger.info(f"Sending system update to Sensay API, content: {content_to_send}")
        try:
            response = sensay_client.create_chat_completion(
                replica_id=replica_id,
                user_id=user.sensay_user_id,
                content=content_to_send,
                source='web',  # Mark as coming from the system, not the user
                skip_chat_history=False
            )
            logger.debug("Successfully received response from Sensay API")
        except SensayAPIError as e:
            logger.error(f"Sensay API error: {str(e)}")
            return None
        
        # Get the AI response content
        ai_content = response.get('content', 'Noted the update.')
        logger.debug(f"AI response to system update: {ai_content}")
        
        # Save the AI response to the database
        ai_message = ChatMessage(
            user_id=user_id,
            sender='replica',
            content=ai_content,
            related_goal_id=related_goal_id
        )
        
        try:
            db.session.add(ai_message)
            db.session.commit()
            logger.debug(f"AI response to system update saved to database, ID: {ai_message.id}")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to save AI response: {str(e)}", exc_info=True)
            # Continue even if saving fails
        
        return {
            'message': 'System update sent successfully',
            'ai_response': {
                'id': ai_message.id,
                'content': ai_content,
                'created_at': ai_message.created_at.isoformat()
            }
        }
        
    except Exception as e:
        logger.error(f"Unexpected error during system update: {str(e)}", exc_info=True)
        return None 