import os
import logging
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, create_refresh_token, 
    jwt_required, get_jwt_identity, get_jwt
)
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User, UserPreference
from app.services.sensay import get_sensay_client, SensayAPIError
from app.utils import get_user_id_from_jwt
from app.api.chat import send_system_update
from app.training_resources import get_training_sources

# Get logger
logger = logging.getLogger('strategist.auth')

# Module-level test
logger.critical("MODULE LEVEL TEST MESSAGE")

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user."""
    logger.critical("INSIDE REGISTER FUNCTION")
    logger.info("Processing user registration request")
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['username', 'email', 'password']
    for field in required_fields:
        if field not in data or not data[field]:
            logger.warning(f"Registration failed: Missing required field: {field}")
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        logger.warning(f"Registration failed: Username already exists: {data['username']}")
        return jsonify({'error': 'Username already exists'}), 409
    
    if User.query.filter_by(email=data['email']).first():
        logger.warning(f"Registration failed: Email already exists: {data['email']}")
        return jsonify({'error': 'Email already exists'}), 409
    
    # Create user in Sensay
    try:
        sensay_client = get_sensay_client()
        sensay_user_id = f"{os.environ.get('SENSAY_USER_ID_PREFIX', 'strategist_')}{data['username']}"
        logger.debug(f"Generated Sensay user ID: {sensay_user_id}")
        
        # Check if Sensay user exists
        try:
            logger.debug(f"Checking if Sensay user exists: {sensay_user_id}")
            sensay_client.get_user(sensay_user_id)
            logger.info(f"Sensay user already exists: {sensay_user_id}")
            # User exists, continue with local registration
        except Exception as e:
            # Create user in Sensay
            logger.info(f"Creating new Sensay user: {sensay_user_id}")
            sensay_client.create_user({
                'id': sensay_user_id,
                'email': data['email'],
                'name': data['username']
            })
            logger.info(f"Successfully created Sensay user: {sensay_user_id}")
    except SensayAPIError as e:
        logger.error(f"Failed to register with Sensay API: {str(e)}")
        return jsonify({'error': f'Failed to register with Sensay: {str(e)}'}), 500
    except Exception as e:
        logger.error(f"Unexpected error during Sensay registration: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to register with Sensay: {str(e)}'}), 500
    
    # Create user in local database
    user = User(
        username=data['username'],
        email=data['email'],
        sensay_user_id=sensay_user_id
    )
    user.set_password(data['password'])
    
    # Create default user preferences
    preferences = UserPreference(user=user)
    
    db.session.add(user)
    db.session.add(preferences)
    
    try:
        db.session.commit()
        logger.info(f"User registered successfully: {user.username} (ID: {user.id})")
        
        # Create a new replica for this user with training data
        try:
            # Import required constants from chat.py
            from app.api.chat import REPLICA_SLUG, STRATEGIST_SYSTEM_MESSAGE, STRATEGIST_GREETING
            
            # Create a static slug for this user
            static_slug = f"{REPLICA_SLUG}_{sensay_user_id}"
            
            # Prepare replica data
            replica_data = {
                'name': 'Strategic Planning Assistant',
                'shortDescription': 'A replica to help with strategic planning',
                'greeting': STRATEGIST_GREETING,
                'slug': static_slug,
                'ownerID': sensay_user_id,
                'llm': {
                    'model': 'claude-3-7-sonnet-latest',
                    'memoryMode': 'prompt-caching',
                    'systemMessage': STRATEGIST_SYSTEM_MESSAGE
                }
            }
            
            # Get training sources
            training_sources = get_training_sources()
            
            # Create replica with training
            logger.info(f"Creating new replica with training for user: {sensay_user_id}")
            new_replica = sensay_client.create_replica_with_training(
                user_id=sensay_user_id,
                replica_data=replica_data,
                training_sources=training_sources
            )
            
            # Extract replica ID
            replica_id = new_replica.get("id")
            if not replica_id:
                replica_id = new_replica.get("uuid")  # Try alternative field name
            
            if replica_id:
                logger.info(f"Created new replica with ID: {replica_id} for user: {user.username}")
                
                # Store replica ID with user if we have the field
                if hasattr(user, 'replica_id'):
                    user.replica_id = replica_id
                    db.session.commit()
                    logger.info(f"Updated user record with new replica ID: {replica_id}")
                
                # Send an initial hello message to the replica
                send_system_update(user.id, "Hello", save_message=True)
                logger.info(f"Sent initial hello message to replica for user: {user.username}")
            else:
                logger.warning("Failed to get replica ID from creation response")
        except Exception as e:
            logger.error(f"Failed to create replica or send initial message: {str(e)}", exc_info=True)
            # Continue with registration even if replica creation fails
    except Exception as e:
        db.session.rollback()
        logger.error(f"Database error during user registration: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to register user: {str(e)}'}), 500
    
    # Generate access token
    access_token = create_access_token(identity=str(user.id))
    logger.debug(f"Generated JWT token for user: {user.id}")
    
    return jsonify({
        'message': 'User registered successfully',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'sensay_user_id': user.sensay_user_id
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Log in an existing user."""
    logger.info("Processing login request")
    data = request.get_json()
    
    # Validate required fields
    if not data.get('username') or not data.get('password'):
        logger.warning("Login failed: Missing username or password")
        return jsonify({'error': 'Username and password are required'}), 400
    
    # Find user by username
    user = User.query.filter_by(username=data['username']).first()
    
    if not user:
        logger.warning(f"Login failed: User not found: {data['username']}")
        return jsonify({'error': 'Invalid username or password'}), 401
    
    if not user.check_password(data['password']):
        logger.warning(f"Login failed: Invalid password for user: {user.username}")
        return jsonify({'error': 'Invalid username or password'}), 401
    
    # Generate access token
    access_token = create_access_token(identity=str(user.id))
    logger.info(f"User logged in successfully: {user.username} (ID: {user.id})")
    logger.debug(f"Generated JWT token for user: {user.id}")
    
    return jsonify({
        'message': 'Login successful',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'sensay_user_id': user.sensay_user_id
        }
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get the current user's profile."""
    logger.warning("ENTERING get_profile function")
    
    try:
        user_id = get_user_id_from_jwt()
        logger.info(f"JWT identity resolved to user ID: {user_id}")
    except Exception as e:
        logger.error(f"JWT error: {str(e)}", exc_info=True)
        return jsonify({'error': 'JWT authentication failed'}), 401
    
    logger.warning("test")
    user = User.query.get(user_id)
    
    if not user:
        logger.warning(f"Profile retrieval failed: User not found: {user_id}")
        return jsonify({'error': 'User not found'}), 404
    
    # Get user preferences
    preferences = user.preferences or UserPreference(user=user)
    if not user.preferences:
        logger.info(f"Creating missing preferences for user: {user.id}")
        db.session.add(preferences)
        db.session.commit()
    
    logger.debug(f"Profile retrieved successfully for user: {user.username}")
    return jsonify({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'sensay_user_id': user.sensay_user_id,
            'created_at': user.created_at.isoformat(),
            'preferences': {
                'reminder_frequency': preferences.reminder_frequency,
                'reminder_day': preferences.reminder_day,
                'reminder_time': preferences.reminder_time,
                'time_zone': preferences.time_zone,
                'notification_channels': preferences.notification_channels,
                'character_preference': preferences.character_preference
            }
        }
    }), 200

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update the current user's profile."""
    user_id = get_user_id_from_jwt()
    logger.info(f"Updating profile for user ID: {user_id}")
    
    user = User.query.get(user_id)
    
    if not user:
        logger.warning(f"Profile update failed: User not found: {user_id}")
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    logger.debug(f"Profile update data: {data}")
    
    # Update user fields
    if 'email' in data:
        # Check if email already exists for another user
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != user.id:
            logger.warning(f"Profile update failed: Email already exists: {data['email']}")
            return jsonify({'error': 'Email already exists'}), 409
        
        logger.info(f"Updating email for user {user.id} from {user.email} to {data['email']}")
        user.email = data['email']
    
    if 'password' in data:
        logger.info(f"Updating password for user: {user.id}")
        user.set_password(data['password'])
    
    # Update preferences
    if 'preferences' in data:
        pref_data = data['preferences']
        preferences = user.preferences or UserPreference(user=user)
        logger.info(f"Updating preferences for user: {user.id}")
        
        if 'reminder_frequency' in pref_data:
            preferences.reminder_frequency = pref_data['reminder_frequency']
        
        if 'reminder_day' in pref_data:
            preferences.reminder_day = pref_data['reminder_day']
        
        if 'reminder_time' in pref_data:
            preferences.reminder_time = pref_data['reminder_time']
        
        if 'time_zone' in pref_data:
            preferences.time_zone = pref_data['time_zone']
        
        if 'notification_channels' in pref_data:
            preferences.notification_channels = pref_data['notification_channels']
        
        if not user.preferences:
            db.session.add(preferences)
    
    # Update Sensay user if needed
    if 'email' in data:
        try:
            logger.info(f"Updating Sensay user email for: {user.sensay_user_id}")
            sensay_client = get_sensay_client()
            sensay_client.update_user(user.sensay_user_id, {
                'email': data['email']
            })
            logger.info(f"Sensay user email updated successfully: {user.sensay_user_id}")
        except Exception as e:
            # Log error but continue (non-critical)
            logger.error(f"Failed to update Sensay user: {str(e)}", exc_info=True)
    
    try:
        db.session.commit()
        logger.info(f"Profile updated successfully for user: {user.id}")
    except Exception as e:
        db.session.rollback()
        logger.error(f"Database error during profile update: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to update profile: {str(e)}'}), 500
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'sensay_user_id': user.sensay_user_id,
            'created_at': user.created_at.isoformat(),
            'preferences': {
                'reminder_frequency': user.preferences.reminder_frequency,
                'reminder_day': user.preferences.reminder_day,
                'reminder_time': user.preferences.reminder_time,
                'time_zone': user.preferences.time_zone,
                'notification_channels': user.preferences.notification_channels
            }
        }
    }), 200

@auth_bp.route('/preferences/character', methods=['PUT'])
@jwt_required()
def update_character_preference():
    """Update the user's character preference."""
    user_id = get_user_id_from_jwt()
    data = request.get_json()
    
    if not data or 'character' not in data:
        return jsonify({'error': 'Character preference is required'}), 400
    
    character = data['character']
    # Validate character option
    valid_characters = ['default', 'yoda']
    if character not in valid_characters:
        return jsonify({'error': f'Invalid character. Must be one of: {", ".join(valid_characters)}'}), 400
    
    # Get or create user preferences
    user_pref = UserPreference.query.filter_by(user_id=user_id).first()
    if not user_pref:
        user_pref = UserPreference(user_id=user_id)
        db.session.add(user_pref)
    
    # Update character preference
    user_pref.character_preference = character
    
    try:
        db.session.commit()
        return jsonify({
            'message': 'Character preference updated successfully',
            'character': character
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to update character preference: {str(e)}'}), 500 