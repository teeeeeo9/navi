import os
import logging
import json
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc

from app import db
from app.models import User, ChatMessage, Goal, Reflection
from app.services.sensay import get_sensay_client, SensayAPIError

# Get logger
logger = logging.getLogger('strategist.chat')

chat_bp = Blueprint('chat', __name__)

# Constants
REPLICA_SLUG = os.environ.get('SENSAY_REPLICA_SLUG', 'strategist_planning_assistant')
DEFAULT_SYSTEM_MESSAGE = """
You are a strategic planning assistant, helping users define and achieve their goals. 
Your primary focus is to help users craft clear, meaningful goals, create actionable steps to achieve them, 
and track their progress.

Your approach is minimalistic and focused on strategy. You are not a task manager, but a strategic thinker 
helping users navigate their most important priorities. Your expertise is in helping users:

1. Define clear, meaningful goals for 3-month periods (although goals can span different timeframes)
2. Understand the importance of each goal and how it connects to their values
3. Identify potential obstacles and mitigation strategies
4. Create milestones and actionable steps to achieve goals
5. Track progress and adjust plans as needed
6. Reflect on successes and areas for improvement

Be concise, focused, and strategic in your responses. Help users gain clarity and focus on what matters most.
"""

# New system message for goal creation mode
GOAL_CREATION_SYSTEM_MESSAGE = """
You are a strategic planning assistant, helping users define and achieve their goals.
Your current task is to guide the user through creating a new goal. 

During this conversation, collect the following information from the user through natural dialogue:
1. Goal title - a clear, concise description of what they want to achieve
2. Goal description - more details about the goal
3. Goal importance - why this goal matters to them and how it connects to their values
4. Target date - when they aim to complete this goal (try to get a specific date)
5. Milestones - key steps or checkpoints on the way to achieving the goal
6. Potential obstacles - what might get in their way
7. Strategies for success - how they can set themselves up for success

For each piece of information, ask follow-up questions to get quality and specific responses.
Keep the conversation natural while guiding it to collect all necessary information.

After you have gathered sufficient information, you will create a JSON representation of the goal,
but do not show this to the user - it will be used by the system to create the goal.

Your responses should be concise, focused, and strategic, helping users gain clarity about their goals.
"""

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
    goal_id = request.args.get('goal_id', type=int)
    
    logger.debug(f"Chat history query params - limit: {limit}, goal_id: {goal_id}")
    
    # Build query
    query = ChatMessage.query.filter_by(user_id=user_id)
    
    # Filter by goal_id if provided
    if goal_id:
        query = query.filter_by(related_goal_id=goal_id)
        logger.debug(f"Filtering chat history by goal_id: {goal_id}")
    
    # Order by creation date (newest first) and limit
    messages = query.order_by(desc(ChatMessage.created_at)).limit(limit).all()
    
    # Reverse to get chronological order
    messages.reverse()
    
    logger.info(f"Retrieved {len(messages)} chat messages for user {user_id}")
    
    messages_data = []
    for message in messages:
        messages_data.append({
            'id': message.id,
            'sender': message.sender,
            'content': message.content,
            'related_goal_id': message.related_goal_id,
            'created_at': message.created_at.isoformat()
        })
    
    return jsonify({'messages': messages_data}), 200

@chat_bp.route('/send', methods=['POST'])
@jwt_required()
def send_message():
    """Send a message to the AI replica and get a response."""
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
    
    # Create the user message in the database
    user_message = ChatMessage(
        user_id=user_id,
        sender='user',
        content=data['content'],
        related_goal_id=related_goal_id
    )
    
    try:
        db.session.add(user_message)
        db.session.commit()
        logger.debug(f"User message saved to database, ID: {user_message.id}")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Failed to save user message: {str(e)}", exc_info=True)
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
        
        # Send the message to Sensay
        logger.info(f"Sending message to Sensay API, content length: {len(data['content'])}")
        try:
            response = sensay_client.create_chat_completion(
                replica_id=replica_id,
                user_id=user.sensay_user_id,
                content=data['content'],
                source='web',
                skip_chat_history=False
            )
            logger.debug("Successfully received response from Sensay API")
        except SensayAPIError as e:
            logger.error(f"Sensay API error: {str(e)}")
            return jsonify({'error': f'AI response error: {str(e)}'}), 500
        
        # Create the AI response message in the database
        ai_content = response.get('content', 'Sorry, I could not generate a response.')
        logger.debug(f"AI response length: {len(ai_content)}")
        
        ai_message = ChatMessage(
            user_id=user_id,
            sender='replica',
            content=ai_content,
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
        
        return jsonify({
            'message': 'Message sent successfully',
            'user_message': {
                'id': user_message.id,
                'sender': user_message.sender,
                'content': user_message.content,
                'related_goal_id': user_message.related_goal_id,
                'created_at': user_message.created_at.isoformat()
            },
            'ai_response': {
                'id': ai_message.id,
                'sender': ai_message.sender,
                'content': ai_message.content,
                'related_goal_id': ai_message.related_goal_id,
                'created_at': ai_message.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        # Log the error
        logger.error(f"Unexpected error during message processing: {str(e)}", exc_info=True)
        current_app.logger.error(f"Error sending message to Sensay: {str(e)}")
        
        # Return error response
        return jsonify({'error': f'Failed to communicate with the AI replica: {str(e)}'}), 500

@chat_bp.route('/analyze-goal/<int:goal_id>', methods=['POST'])
@jwt_required()
def analyze_goal(goal_id):
    """Ask the AI replica to analyze a specific goal and provide insights."""
    user_id = get_jwt_identity()
    logger.info(f"Analyzing goal ID: {goal_id} for user ID: {user_id}")
    
    user = User.query.get(user_id)
    
    if not user:
        logger.warning(f"Goal analysis failed: User not found: {user_id}")
        return jsonify({'error': 'User not found'}), 404
    
    # Verify goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        logger.warning(f"Goal analysis failed: Goal not found: {goal_id}")
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    analysis_type = data.get('analysis_type', 'general')
    save_as_reflection = data.get('save_as_reflection', False)
    
    logger.debug(f"Goal analysis params - analysis_type: {analysis_type}, save_as_reflection: {save_as_reflection}")
    logger.debug(f"Goal details - title: {goal.title}, status: {goal.status}, completion: {goal.completion_status}%")
    
    # Build prompt based on analysis type
    if analysis_type == 'importance':
        prompt = f"Help me understand why my goal '{goal.title}' is important to me. What benefits will I gain from achieving it? How will it make me feel? Why should I prioritize this over other goals?"
    elif analysis_type == 'obstacles':
        prompt = f"What obstacles might I face while working towards my goal '{goal.title}'? What could go wrong or slow me down? How can I prepare for or overcome these challenges?"
    elif analysis_type == 'strategy':
        prompt = f"What strategies or approaches would be most effective for achieving my goal '{goal.title}'? What specific actions should I prioritize? Are there any efficient ways to make progress?"
    elif analysis_type == 'environment':
        prompt = f"How can I change my environment to increase my chances of achieving my goal '{goal.title}'? What habits, routines, or systems could I implement? What enablers or barriers exist in my current environment?"
    elif analysis_type == 'timeline':
        prompt = f"Evaluate my timeline for goal '{goal.title}' (target date: {goal.target_date.strftime('%Y-%m-%d')}). Is this realistic? What are optimistic, realistic, and pessimistic estimates for completion? How should I adjust my expectations or approach?"
    else:  # general analysis
        prompt = f"Analyze my goal '{goal.title}' with description '{goal.description or 'No description'}' and target date {goal.target_date.strftime('%Y-%m-%d')}. What are your thoughts on this goal? Is it specific, measurable, achievable, relevant, and time-bound? How could I improve it?"
    
    logger.debug(f"Analysis prompt type: {analysis_type}")
    
    try:
        # Initialize Sensay client
        logger.debug("Initializing Sensay client for goal analysis")
        sensay_client = get_sensay_client()
        
        # Get or create the replica
        try:
            replica_id = ensure_replica_exists(sensay_client, user.sensay_user_id)
            logger.debug(f"Using replica ID: {replica_id}")
        except Exception as e:
            logger.error(f"Failed to get/create replica: {str(e)}", exc_info=True)
            return jsonify({'error': f'Failed to initialize AI replica: {str(e)}'}), 500
        
        # Add context to the prompt with goal details
        context = (
            f"Goal: {goal.title}\n"
            f"Description: {goal.description or 'No description'}\n"
            f"Start date: {goal.start_date.strftime('%Y-%m-%d')}\n"
            f"Target date: {goal.target_date.strftime('%Y-%m-%d')}\n"
            f"Current progress: {goal.completion_status}%\n"
            f"Status: {goal.status}\n\n"
        )
        
        # Include milestones if available
        if goal.milestones:
            context += "Milestones:\n"
            for milestone in goal.milestones:
                context += f"- {milestone.title} (due: {milestone.target_date.strftime('%Y-%m-%d')}, status: {milestone.status})\n"
        
        # Include reflections if available
        if goal.reflections:
            context += "\nPrevious reflections:\n"
            for reflection in goal.reflections:
                context += f"- {reflection.reflection_type}: {reflection.content[:100]}...\n"
        
        full_prompt = f"{context}\n{prompt}"
        logger.debug(f"Full analysis prompt length: {len(full_prompt)}")
        
        # Send the message to Sensay
        logger.info(f"Sending goal analysis request to Sensay API")
        try:
            response = sensay_client.create_chat_completion(
                replica_id=replica_id,
                user_id=user.sensay_user_id,
                content=full_prompt,
                source='web',
                skip_chat_history=True  # Skip adding to chat history since this is a system-generated analysis
            )
            logger.debug("Successfully received analysis response from Sensay API")
        except SensayAPIError as e:
            logger.error(f"Sensay API error during goal analysis: {str(e)}")
            return jsonify({'error': f'AI analysis error: {str(e)}'}), 500
        
        analysis_content = response.get('content', 'Sorry, I could not analyze this goal.')
        logger.debug(f"Analysis content length: {len(analysis_content)}")
        
        # Create messages for the analysis
        system_message = ChatMessage(
            user_id=user_id,
            sender='user',
            content=f"[System] Analyze goal: {goal.title}",
            related_goal_id=goal_id
        )
        
        ai_message = ChatMessage(
            user_id=user_id,
            sender='replica',
            content=analysis_content,
            related_goal_id=goal_id
        )
        
        # Save messages in the database
        try:
            db.session.add(system_message)
            db.session.add(ai_message)
            logger.debug(f"Analysis messages saved to database")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to save analysis messages: {str(e)}", exc_info=True)
            return jsonify({'error': f'Database error: {str(e)}'}), 500
        
        # Save as a reflection if specified
        if save_as_reflection and analysis_type != 'general':
            logger.info(f"Saving analysis as reflection of type: {analysis_type}")
            existing_reflection = Reflection.query.filter_by(
                goal_id=goal_id,
                reflection_type=analysis_type
            ).first()
            
            if existing_reflection:
                logger.debug(f"Updating existing reflection ID: {existing_reflection.id}")
                existing_reflection.content = analysis_content
                existing_reflection.updated_at = datetime.utcnow()
            else:
                logger.debug(f"Creating new reflection of type: {analysis_type}")
                reflection = Reflection(
                    goal_id=goal_id,
                    reflection_type=analysis_type,
                    content=analysis_content
                )
                db.session.add(reflection)
        
        # Commit all database changes
        try:
            db.session.commit()
            logger.info(f"Goal analysis completed and saved successfully")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to commit analysis data: {str(e)}", exc_info=True)
            return jsonify({'error': f'Database error: {str(e)}'}), 500
        
        return jsonify({
            'message': 'Goal analysis completed',
            'analysis': {
                'goal_id': goal.id,
                'analysis_type': analysis_type,
                'content': analysis_content
            }
        }), 200
        
    except Exception as e:
        # Log the error
        logger.error(f"Unexpected error during goal analysis: {str(e)}", exc_info=True)
        current_app.logger.error(f"Error analyzing goal with Sensay: {str(e)}")
        
        # Return error response
        return jsonify({'error': f'Failed to analyze goal: {str(e)}'}), 500

@chat_bp.route('/create-goal', methods=['POST'])
@jwt_required()
def start_goal_creation():
    """Start a conversation specifically focused on creating a new goal."""
    user_id = get_jwt_identity()
    logger.info(f"Starting goal creation conversation for user ID: {user_id}")
    
    user = User.query.get(user_id)
    
    if not user:
        logger.warning(f"Goal creation failed: User not found: {user_id}")
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Initial message can be optional, using a default if not provided
    initial_content = data.get('content', 'I want to create a new goal')
    logger.debug(f"Initial content: {initial_content}")
    
    try:
        # Initialize Sensay client
        logger.debug("Initializing Sensay client for goal creation")
        sensay_client = get_sensay_client()
        
        # Get or create the replica
        try:
            logger.debug(f"Ensuring replica exists for user: {user.sensay_user_id}")
            replica_id = ensure_replica_exists(sensay_client, user.sensay_user_id, system_message=GOAL_CREATION_SYSTEM_MESSAGE)
            logger.debug(f"Using replica ID: {replica_id}")
        except Exception as e:
            logger.error(f"Failed to get/create replica: {str(e)}", exc_info=True)
            return jsonify({'error': f'Failed to initialize AI replica: {str(e)}'}), 500
        
        # Create the user message in the database
        user_message = ChatMessage(
            user_id=user_id,
            sender='user',
            content=initial_content
        )
        
        db.session.add(user_message)
        db.session.commit()
        
        # Send the message to Sensay
        logger.info(f"Sending goal creation request to Sensay API")
        try:
            response = sensay_client.create_chat_completion(
                replica_id=replica_id,
                user_id=user.sensay_user_id,
                content=initial_content,
                source='web',
                skip_chat_history=False
            )
            logger.debug("Successfully received response from Sensay API")
        except SensayAPIError as e:
            logger.error(f"Sensay API error: {str(e)}")
            return jsonify({'error': f'AI response error: {str(e)}'}), 500
        
        # Create the AI response message in the database
        ai_content = response.get('content', 'Let\'s start creating your goal. What would you like to achieve?')
        logger.debug(f"AI response length: {len(ai_content)}")
        
        ai_message = ChatMessage(
            user_id=user_id,
            sender='replica',
            content=ai_content
        )
        
        db.session.add(ai_message)
        db.session.commit()
        
        return jsonify({
            'message': 'Goal creation started',
            'session_active': True,
            'user_message': {
                'id': user_message.id,
                'sender': user_message.sender,
                'content': user_message.content,
                'created_at': user_message.created_at.isoformat()
            },
            'ai_response': {
                'id': ai_message.id,
                'sender': ai_message.sender,
                'content': ai_message.content,
                'created_at': ai_message.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Unexpected error during goal creation start: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to start goal creation: {str(e)}'}), 500

@chat_bp.route('/goal-chat', methods=['POST'])
@jwt_required()
def continue_goal_creation():
    """Continue the goal creation conversation and potentially create the goal."""
    user_id = get_jwt_identity()
    logger.info(f"Continuing goal creation for user ID: {user_id}")
    
    user = User.query.get(user_id)
    
    if not user:
        logger.warning(f"Goal creation continuation failed: User not found: {user_id}")
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Validate message content
    if 'content' not in data or not data['content'].strip():
        logger.warning("Goal chat failed: Empty message content")
        return jsonify({'error': 'Message content is required'}), 400
    
    # Check if user wants to finish goal creation
    is_finalizing = 'finalize' in data and data['finalize']
    user_content = data['content']
    
    try:
        # Initialize Sensay client
        logger.debug("Initializing Sensay client for goal creation continuation")
        sensay_client = get_sensay_client()
        
        # Get or create the replica
        try:
            replica_id = ensure_replica_exists(sensay_client, user.sensay_user_id, system_message=GOAL_CREATION_SYSTEM_MESSAGE)
            logger.debug(f"Using replica ID: {replica_id}")
        except Exception as e:
            logger.error(f"Failed to get/create replica: {str(e)}", exc_info=True)
            return jsonify({'error': f'Failed to initialize AI replica: {str(e)}'}), 500
        
        # Create the user message in the database
        user_message = ChatMessage(
            user_id=user_id,
            sender='user',
            content=user_content
        )
        
        db.session.add(user_message)
        db.session.commit()
        
        content_to_send = user_content
        if is_finalizing:
            content_to_send += "\n\nBased on our conversation, please create a JSON representation of the goal with the following structure: {'title': 'Goal Title', 'description': 'Goal Description', 'importance': 'Why this goal is important', 'target_date': 'YYYY-MM-DD', 'milestones': [{'title': 'Milestone 1', 'description': 'Description', 'target_date': 'YYYY-MM-DD'}, ...], 'reflections': {'obstacles': 'Potential obstacles', 'strategy': 'Strategies for success'}}"
        
        # Send the message to Sensay
        logger.info(f"Sending goal creation continuation to Sensay API")
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
        
        ai_content = response.get('content', 'I\'m sorry, I couldn\'t process that. Let\'s continue with your goal creation.')
        logger.debug(f"AI response length: {len(ai_content)}")
        
        # If finalizing, extract JSON and create the goal
        goal_data = None
        display_response = ai_content
        
        if is_finalizing:
            try:
                # Extract JSON from AI response
                logger.info("Attempting to extract goal JSON from AI response")
                goal_data = extract_goal_json(ai_content)
                
                if goal_data:
                    logger.info(f"Successfully extracted goal data: {goal_data.get('title', 'Unknown')}")
                    # Create a clean response without the JSON
                    display_response = "Great! I've created your goal based on our conversation. You can now view and track it in your goals dashboard."
                else:
                    logger.warning("Failed to extract goal JSON from AI response")
                    display_response = "I understand the details of your goal, but I'm having trouble formatting it for the system. Let's continue the conversation to clarify a few more details."
            except Exception as e:
                logger.error(f"Error extracting goal JSON: {str(e)}", exc_info=True)
                display_response = "I've noted down your goal details, but I encountered a technical issue creating it. Please try again or contact support if the issue persists."
        
        # Create the AI response message in the database (with the display version, not the JSON)
        ai_message = ChatMessage(
            user_id=user_id,
            sender='replica',
            content=display_response
        )
        
        db.session.add(ai_message)
        db.session.commit()
        
        # If we have goal data, create the goal
        created_goal = None
        if goal_data:
            try:
                logger.info("Creating goal from extracted data")
                # Format dates properly
                if 'target_date' in goal_data and goal_data['target_date']:
                    try:
                        datetime.fromisoformat(goal_data['target_date'])
                    except ValueError:
                        # Try to parse the date if it's not in ISO format
                        from dateutil import parser
                        try:
                            parsed_date = parser.parse(goal_data['target_date'])
                            goal_data['target_date'] = parsed_date.isoformat()
                        except:
                            # Default to 3 months from now if parsing fails
                            goal_data['target_date'] = (datetime.utcnow() + timedelta(days=90)).isoformat()
                
                # Process milestones
                if 'milestones' in goal_data and isinstance(goal_data['milestones'], list):
                    for milestone in goal_data['milestones']:
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
                                    goal_target = datetime.fromisoformat(goal_data['target_date'])
                                    milestone['target_date'] = (datetime.utcnow() + (goal_target - datetime.utcnow()) / 2).isoformat()
                
                # Create the goal using the goals API
                from app.api.goals import create_goal_internal
                created_goal = create_goal_internal(user_id, goal_data)
                logger.info(f"Successfully created goal with ID: {created_goal['id']}")
            except Exception as e:
                logger.error(f"Failed to create goal: {str(e)}", exc_info=True)
        
        return jsonify({
            'message': 'Goal creation conversation continued',
            'goal_created': created_goal is not None,
            'user_message': {
                'id': user_message.id,
                'sender': user_message.sender,
                'content': user_message.content,
                'created_at': user_message.created_at.isoformat()
            },
            'ai_response': {
                'id': ai_message.id,
                'sender': ai_message.sender,
                'content': display_response,
                'created_at': ai_message.created_at.isoformat()
            },
            'goal': created_goal
        }), 200
        
    except Exception as e:
        logger.error(f"Unexpected error during goal creation continuation: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to continue goal creation: {str(e)}'}), 500

def extract_goal_json(ai_response):
    """Extract JSON goal data from AI response text."""
    logger.debug("Extracting goal JSON from AI response")
    
    # Try to find JSON in the response using common patterns
    json_start_markers = [
        '```json',
        '```',
        '{',
        'Here\'s the JSON representation of your goal:',
        'JSON representation:'
    ]
    
    json_end_markers = [
        '```',
        '}'
    ]
    
    # First try to find JSON blocks with markers
    for start_marker in json_start_markers:
        if start_marker in ai_response:
            start_idx = ai_response.find(start_marker) + len(start_marker)
            
            # Find the end of JSON
            end_idx = None
            if start_marker != '{':  # If we have a distinct start marker
                for end_marker in json_end_markers:
                    if end_marker in ai_response[start_idx:]:
                        marker_idx = ai_response[start_idx:].find(end_marker)
                        if end_marker == '}':  # If the end marker is }, we need to include it
                            marker_idx += 1
                        end_idx = start_idx + marker_idx
                        break
            else:  # If start marker is {, we need to find the matching }
                # Simple approach - find the last }
                if '}' in ai_response[start_idx-1:]:
                    end_idx = ai_response.rfind('}') + 1
            
            if end_idx:
                json_str = ai_response[start_idx:end_idx].strip()
                try:
                    # Handle case where the JSON might not start immediately after the marker
                    if not json_str.startswith('{'):
                        json_start = json_str.find('{')
                        if json_start >= 0:
                            json_str = json_str[json_start:]
                    
                    return json.loads(json_str)
                except json.JSONDecodeError as e:
                    logger.warning(f"Failed to parse extracted JSON: {str(e)}")
                    continue  # Try next marker
    
    # If no JSON found with markers, try to find any valid JSON in the response
    try:
        # Look for any text between { and }
        start_idx = ai_response.find('{')
        if start_idx >= 0:
            end_idx = ai_response.rfind('}') + 1
            if end_idx > start_idx:
                json_str = ai_response[start_idx:end_idx]
                return json.loads(json_str)
    except json.JSONDecodeError:
        pass
    
    logger.warning("No valid JSON found in AI response")
    return None

def ensure_replica_exists(sensay_client, sensay_user_id, system_message=None):
    """Ensure the planning assistant replica exists for the user."""
    logger.info(f"Ensuring replica exists for user: {sensay_user_id}")
    try:
        # Get list of replicas for the user
        logger.debug(f"Fetching existing replicas for user: {sensay_user_id}")
        replicas_response = sensay_client.list_replicas(sensay_user_id)
        replicas = replicas_response.get('items', [])
        
        # Look for existing replica with our slug
        for replica in replicas:
            if replica.get('slug') == REPLICA_SLUG:
                logger.info(f"Found existing replica with ID: {replica.get('uuid')}")
                logger.debug(f"system_message: {system_message}")
                
                # # Update system message if provided
                # if system_message:
                #     try:
                #         replica_data = {
                #             'llm': {
                #                 'systemMessage': system_message
                #             }
                #         }
                #         sensay_client.update_replica(replica.get('uuid'), sensay_user_id, replica_data)
                #         logger.info(f"Updated system message for replica: {replica.get('uuid')}")
                #     except Exception as e:
                #         logger.warning(f"Failed to update system message: {str(e)}")
                
                return replica.get('uuid')
        
        # No replica found, create one
        logger.info(f"No existing replica found, creating new one with slug: {REPLICA_SLUG}")
        replica_data = {
            'name': 'Strategic Planning Assistant',
            'shortDescription': 'A replica to help with strategic planning',
            'greeting': 'Hello! I\'m your strategic planning assistant. I\'m here to help you set meaningful goals, create actionable plans, and track your progress. How can I assist you today?',
            'slug': REPLICA_SLUG,
            'ownerID': sensay_user_id,
            'llm': {
                'model': 'claude-3-7-sonnet-latest',
                'memoryMode': 'prompt-caching',
                'systemMessage': system_message or DEFAULT_SYSTEM_MESSAGE
            }
        }
        
        new_replica = sensay_client.create_replica(sensay_user_id, replica_data)
        logger.info(f"Created new replica with ID: {new_replica.get('uuid')}")
        return new_replica.get('uuid')
        
    except Exception as e:
        logger.error(f"Error ensuring replica exists: {str(e)}", exc_info=True)
        current_app.logger.error(f"Error ensuring replica exists: {str(e)}")
        raise 