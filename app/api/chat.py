import os
import logging
from datetime import datetime
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

def ensure_replica_exists(sensay_client, sensay_user_id):
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
                return replica.get('uuid')
        
        # No replica found, create one
        logger.info(f"No existing replica found, creating new one with slug: {REPLICA_SLUG}")
        replica_data = {
            'name': 'Strategic Planning Assistant',
            'shortDescription': 'An AI assistant to help with goal setting and strategic planning',
            'greeting': 'Hello! I\'m your strategic planning assistant. I\'m here to help you set meaningful goals, create actionable plans, and track your progress. How can I assist you today?',
            'slug': REPLICA_SLUG,
            'ownerID': sensay_user_id,
            'llm': {
                'model': 'claude-3-7-sonnet-latest',
                'memoryMode': 'prompt-caching',
                'systemMessage': DEFAULT_SYSTEM_MESSAGE
            }
        }
        
        new_replica = sensay_client.create_replica(sensay_user_id, replica_data)
        logger.info(f"Created new replica with ID: {new_replica.get('uuid')}")
        return new_replica.get('uuid')
        
    except Exception as e:
        logger.error(f"Error ensuring replica exists: {str(e)}", exc_info=True)
        current_app.logger.error(f"Error ensuring replica exists: {str(e)}")
        raise 