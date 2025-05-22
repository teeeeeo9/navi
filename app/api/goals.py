from datetime import datetime
import logging
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc

from app import db
from app.models import Goal, Milestone, User, Reflection, ProgressUpdate
from app.services.sensay import get_sensay_client

# Get logger
logger = logging.getLogger('strategist.goals')

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    """Get all goals for the current user."""
    user_id = get_jwt_identity()
    logger.info(f"Getting goals for user ID: {user_id}")
    
    # Get query parameters
    status = request.args.get('status')
    parent_id = request.args.get('parent_id')
    
    logger.debug(f"Query parameters - status: {status}, parent_id: {parent_id}")
    
    # Build query
    query = Goal.query.filter_by(user_id=user_id)
    
    # Filter by status if provided
    if status:
        query = query.filter_by(status=status)
        logger.debug(f"Filtering by status: {status}")
    
    # Filter by parent_goal_id if provided
    if parent_id:
        if parent_id == 'null':
            # Get top-level goals
            query = query.filter_by(parent_goal_id=None)
            logger.debug("Filtering top-level goals (parent_goal_id is NULL)")
        else:
            # Get subgoals of a specific parent
            query = query.filter_by(parent_goal_id=parent_id)
            logger.debug(f"Filtering subgoals of parent: {parent_id}")
    
    # Order by creation date (newest first)
    goals = query.order_by(desc(Goal.created_at)).all()
    logger.info(f"Retrieved {len(goals)} goals for user {user_id}")
    
    # Format response
    goals_data = []
    for goal in goals:
        # Get milestones
        milestones_data = []
        for milestone in goal.milestones:
            milestones_data.append({
                'id': milestone.id,
                'title': milestone.title,
                'target_date': milestone.target_date.isoformat(),
                'completion_status': milestone.completion_status,
                'status': milestone.status,
                'created_at': milestone.created_at.isoformat()
            })
        
        # Get reflection summary
        reflections_data = {}
        for reflection in goal.reflections:
            reflections_data[reflection.reflection_type] = {
                'id': reflection.id,
                'content': reflection.content,
                'created_at': reflection.created_at.isoformat()
            }
        
        # Calculate progress updates count
        progress_updates_count = len(goal.progress_updates)
        
        # Calculate subgoals count
        subgoals_count = Goal.query.filter_by(parent_goal_id=goal.id).count()
        
        goals_data.append({
            'id': goal.id,
            'title': goal.title,
            'start_date': goal.start_date.isoformat(),
            'target_date': goal.target_date.isoformat(),
            'completion_status': goal.completion_status,
            'status': goal.status,
            'parent_goal_id': goal.parent_goal_id,
            'milestones': milestones_data,
            'reflections': reflections_data,
            'progress_updates_count': progress_updates_count,
            'subgoals_count': subgoals_count,
            'created_at': goal.created_at.isoformat(),
            'updated_at': goal.updated_at.isoformat()
        })
    
    return jsonify({'goals': goals_data}), 200

@goals_bp.route('/<int:goal_id>', methods=['GET'])
@jwt_required()
def get_goal(goal_id):
    """Get a specific goal with detailed information."""
    user_id = get_jwt_identity()
    logger.info(f"Getting goal details for ID: {goal_id}, user ID: {user_id}")
    
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        logger.warning(f"Goal not found: {goal_id} for user: {user_id}")
        return jsonify({'error': 'Goal not found'}), 404
    
    logger.debug(f"Found goal: {goal.title}, status: {goal.status}")
    
    # Get progress updates
    progress_updates = []
    for update in ProgressUpdate.query.filter_by(goal_id=goal_id, milestone_id=None).order_by(desc(ProgressUpdate.created_at)).all():
        progress_updates.append(update.to_dict())
    
    # Get milestones
    milestones_data = []
    for milestone in goal.milestones:
        # Get real milestone progress updates
        milestone_progress = []
        for update in ProgressUpdate.query.filter_by(goal_id=goal_id, milestone_id=milestone.id).order_by(desc(ProgressUpdate.created_at)).all():
            milestone_progress.append(update.to_dict())
        
        # If no real updates exist, add simulated ones
        if not milestone_progress:
            # Initial progress entry at creation time
            milestone_progress.append({
                'id': -1,  # Simulated ID
                'goal_id': goal_id,
                'milestone_id': milestone.id,
                'progress_value': 0,  # Initial progress
                'type': 'progress',  # Add default type for milestone progress
                'progress_notes': "Milestone created",
                'created_at': milestone.created_at.isoformat()
            })
            
            # Add an entry for status changes if milestone is not pending
            if milestone.status != 'pending':
                progress_value = 100 if milestone.status == 'completed' else milestone.completion_status
                milestone_progress.append({
                    'id': -2,  # Simulated ID
                    'goal_id': goal_id,
                    'milestone_id': milestone.id,
                    'progress_value': progress_value,
                    'type': 'progress',  # Add default type for milestone progress
                    'progress_notes': f"Status changed to {milestone.status}",
                    'created_at': milestone.updated_at.isoformat()
                })
        
        milestones_data.append({
            'id': milestone.id,
            'title': milestone.title,
            'target_date': milestone.target_date.isoformat(),
            'completion_status': milestone.completion_status,
            'status': milestone.status,
            'created_at': milestone.created_at.isoformat(),
            'updated_at': milestone.updated_at.isoformat(),
            'progress_updates': milestone_progress
        })
    
    # Get reflections
    reflections_data = {}
    for reflection in goal.reflections:
        reflections_data[reflection.reflection_type] = {
            'id': reflection.id,
            'content': reflection.content,
            'created_at': reflection.created_at.isoformat(),
            'updated_at': reflection.updated_at.isoformat()
        }
    
    # Get subgoals
    subgoals = []
    for subgoal in Goal.query.filter_by(parent_goal_id=goal.id).all():
        subgoals.append({
            'id': subgoal.id,
            'title': subgoal.title,
            'completion_status': subgoal.completion_status,
            'status': subgoal.status
        })
    
    # Assemble the full goal data
    goal_data = {
        'id': goal.id,
        'title': goal.title,
        'start_date': goal.start_date.isoformat(),
        'target_date': goal.target_date.isoformat(),
        'completion_status': goal.completion_status,
        'status': goal.status,
        'parent_goal_id': goal.parent_goal_id,
        'milestones': milestones_data,
        'reflections': reflections_data,
        'progress_updates': progress_updates,
        'subgoals': subgoals,
        'created_at': goal.created_at.isoformat(),
        'updated_at': goal.updated_at.isoformat()
    }
    
    return jsonify({'goal': goal_data}), 200

@goals_bp.route('/', methods=['POST'])
@jwt_required()
def create_goal():
    """Create a new goal."""
    user_id = get_jwt_identity()
    data = request.get_json()
    logger.info(f"Creating new goal for user ID: {user_id}")
    logger.debug(f"Goal data: {data}")
    
    # Call the internal function to create the goal
    try:
        result = create_goal_internal(user_id, data)
        logger.info(f"Goal created successfully with ID: {result['id']}")
        return jsonify({
            'message': 'Goal created successfully',
            'goal': result
        }), 201
    except ValueError as e:
        logger.warning(f"Failed to create goal: {str(e)}")
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error creating goal: {str(e)}", exc_info=True)
        return jsonify({'error': f'Failed to create goal: {str(e)}'}), 500

def create_goal_internal(user_id, data):
    """Create a new goal (internal function, can be called by other modules)."""
    logger.info(f"Creating goal internally for user ID: {user_id}")
    
    # Validate required fields
    required_fields = ['title', 'target_date']
    for field in required_fields:
        if field not in data:
            logger.warning(f"Missing required field: {field}")
            raise ValueError(f'Missing required field: {field}')
    
    # Parse dates
    try:
        start_date = datetime.fromisoformat(data.get('start_date', datetime.now().isoformat()))
        target_date = datetime.fromisoformat(data['target_date'])
        logger.debug(f"Parsed dates - start: {start_date}, target: {target_date}")
    except ValueError:
        logger.warning("Invalid date format")
        raise ValueError('Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)')
    
    # Create goal
    goal = Goal(
        user_id=user_id,
        title=data['title'],
        start_date=start_date,
        target_date=target_date,
        status=data.get('status', 'active'),
        parent_goal_id=data.get('parent_goal_id')
    )
    
    db.session.add(goal)
    db.session.commit()
    logger.debug(f"Goal created with ID: {goal.id}")
    
    # Create milestones if provided
    milestones_data = []
    if 'milestones' in data and isinstance(data['milestones'], list):
        logger.debug(f"Processing {len(data['milestones'])} milestones")
        for milestone_data in data['milestones']:
            if 'title' not in milestone_data or 'target_date' not in milestone_data:
                logger.warning("Skipping milestone with missing title or target_date")
                continue
                
            try:
                milestone_target_date = datetime.fromisoformat(milestone_data['target_date'])
            except ValueError:
                logger.warning(f"Skipping milestone with invalid target date: {milestone_data['target_date']}")
                continue
                
            milestone = Milestone(
                goal_id=goal.id,
                title=milestone_data['title'],
                target_date=milestone_target_date
            )
            
            db.session.add(milestone)
            milestones_data.append({
                'id': milestone.id,
                'title': milestone.title,
                'target_date': milestone.target_date.isoformat(),
                'completion_status': milestone.completion_status,
                'status': milestone.status
            })
            logger.debug(f"Milestone created: {milestone.title}")
    
    # Create reflections if provided
    reflections_data = {}
    if 'reflections' in data and isinstance(data['reflections'], dict):
        logger.debug(f"Processing {len(data['reflections'])} reflections")
        for reflection_type, content in data['reflections'].items():
            if not content:
                logger.warning(f"Skipping empty reflection of type: {reflection_type}")
                continue
                
            reflection = Reflection(
                goal_id=goal.id,
                reflection_type=reflection_type,
                content=content
            )
            
            db.session.add(reflection)
    
    # Commit to ensure all objects have their timestamps set
    db.session.commit()
    
    # Now build the reflections data for response
    reflections_data = {}
    for reflection in goal.reflections:
        reflections_data[reflection.reflection_type] = {
            'id': reflection.id,
            'content': reflection.content,
            'created_at': reflection.created_at.isoformat()
        }
        logger.debug(f"Reflection created: {reflection.reflection_type}")
    
    logger.info(f"Goal creation completed - ID: {goal.id}, Title: {goal.title}")
    
    return {
        'id': goal.id,
        'title': goal.title,
        'start_date': goal.start_date.isoformat(),
        'target_date': goal.target_date.isoformat(),
        'completion_status': goal.completion_status,
        'status': goal.status,
        'parent_goal_id': goal.parent_goal_id,
        'milestones': milestones_data,
        'reflections': reflections_data,
        'created_at': goal.created_at.isoformat(),
        'updated_at': goal.updated_at.isoformat()
    }

@goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    """Update an existing goal."""
    user_id = get_jwt_identity()
    logger.info(f"Updating goal ID: {goal_id} for user ID: {user_id}")
    
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        logger.warning(f"Goal not found: {goal_id} for user: {user_id}")
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    logger.debug(f"Update data: {data}")
    
    # Keep track of changes for system update message
    changes = []
    
    # Update goal fields if provided
    if 'title' in data and data['title'] != goal.title:
        old_title = goal.title
        goal.title = data['title']
        changes.append(f"title from '{old_title}' to '{goal.title}'")
        logger.debug(f"Updated title: {goal.title}")
    
    if 'start_date' in data:
        try:
            new_start_date = datetime.fromisoformat(data['start_date'])
            if new_start_date != goal.start_date:
                goal.start_date = new_start_date
                changes.append(f"start date to {goal.start_date.strftime('%Y-%m-%d')}")
                logger.debug(f"Updated start_date: {goal.start_date}")
        except ValueError:
            logger.warning(f"Invalid start_date format: {data['start_date']}")
            return jsonify({'error': 'Invalid start_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    if 'target_date' in data:
        try:
            new_target_date = datetime.fromisoformat(data['target_date'])
            if new_target_date != goal.target_date:
                goal.target_date = new_target_date
                changes.append(f"target date to {goal.target_date.strftime('%Y-%m-%d')}")
                logger.debug(f"Updated target_date: {goal.target_date}")
        except ValueError:
            logger.warning(f"Invalid target_date format: {data['target_date']}")
            return jsonify({'error': 'Invalid target_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    if 'completion_status' in data:
        try:
            completion_status = float(data['completion_status'])
            if 0 <= completion_status <= 100 and completion_status != goal.completion_status:
                goal.completion_status = completion_status
                changes.append(f"completion status to {goal.completion_status}%")
                logger.debug(f"Updated completion_status: {goal.completion_status}%")
            else:
                logger.warning(f"Invalid completion_status range: {completion_status}")
                return jsonify({'error': 'Completion status must be between 0 and 100'}), 400
        except ValueError:
            logger.warning(f"Invalid completion_status format: {data['completion_status']}")
            return jsonify({'error': 'Invalid completion_status format. Must be a number between 0 and 100'}), 400
    
    if 'status' in data and data['status'] != goal.status:
        valid_statuses = ['active', 'completed']
        if data['status'] in valid_statuses:
            old_status = goal.status
            goal.status = data['status']
            changes.append(f"status from '{old_status}' to '{goal.status}'")
            logger.debug(f"Updated status: {goal.status}")
        else:
            logger.warning(f"Invalid status: {data['status']}")
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    if 'parent_goal_id' in data and data['parent_goal_id'] != goal.parent_goal_id:
        # Verify that the parent goal exists and belongs to the user
        if data['parent_goal_id'] is not None:
            parent_goal = Goal.query.filter_by(id=data['parent_goal_id'], user_id=user_id).first()
            if not parent_goal:
                logger.warning(f"Parent goal not found: {data['parent_goal_id']}")
                return jsonify({'error': 'Parent goal not found'}), 404
            
            # Prevent circular dependency
            if parent_goal.id == goal.id:
                logger.warning(f"Circular dependency detected: Goal {goal.id} cannot be its own parent")
                return jsonify({'error': 'A goal cannot be its own parent'}), 400
            
            changes.append(f"parent goal to '{parent_goal.title}'")
            logger.debug(f"Updated parent_goal_id: {data['parent_goal_id']}")
        else:
            changes.append("removed parent goal")
            logger.debug("Removed parent_goal_id (set to None)")
        
        goal.parent_goal_id = data['parent_goal_id']
    
    # Update reflections if provided
    if 'reflections' in data and isinstance(data['reflections'], dict):
        logger.debug(f"Updating {len(data['reflections'])} reflections")
        for reflection_type, content in data['reflections'].items():
            # Find existing reflection of this type
            reflection = Reflection.query.filter_by(
                goal_id=goal.id, 
                reflection_type=reflection_type
            ).first()
            
            if reflection:
                # Update existing reflection if content changed
                if reflection.content != content:
                    reflection.content = content
                    reflection.updated_at = datetime.utcnow()
                    changes.append(f"reflection on '{reflection_type}'")
                    logger.debug(f"Updated reflection: {reflection_type}")
            else:
                # Create new reflection
                reflection = Reflection(
                    goal_id=goal.id,
                    reflection_type=reflection_type,
                    content=content
                )
                db.session.add(reflection)
                changes.append(f"added new reflection on '{reflection_type}'")
                logger.debug(f"Created new reflection: {reflection_type}")
    
    db.session.commit()
    logger.info(f"Goal updated successfully: {goal.id}")
    
    # Prepare response with updated goal data
    # Get milestones
    milestones_data = []
    for milestone in goal.milestones:
        milestones_data.append({
            'id': milestone.id,
            'title': milestone.title,
            'target_date': milestone.target_date.isoformat(),
            'completion_status': milestone.completion_status,
            'status': milestone.status,
            'created_at': milestone.created_at.isoformat(),
            'updated_at': milestone.updated_at.isoformat()
        })
    
    # Get reflections
    reflections_data = {}
    for reflection in goal.reflections:
        reflections_data[reflection.reflection_type] = {
            'id': reflection.id,
            'content': reflection.content,
            'created_at': reflection.created_at.isoformat(),
            'updated_at': reflection.updated_at.isoformat()
        }
    
    # Get progress updates
    progress_updates = []
    for update in ProgressUpdate.query.filter_by(goal_id=goal_id, milestone_id=None).order_by(desc(ProgressUpdate.created_at)).all():
        progress_updates.append(update.to_dict())
    
    # Send system update to the replica if changes were made
    if changes:
        # Format the changes for the update message
        if len(changes) == 1:
            update_message = f"User updated {changes[0]} for goal '{goal.title}'"
        else:
            formatted_changes = ", ".join(changes[:-1]) + f" and {changes[-1]}"
            update_message = f"User updated {formatted_changes} for goal '{goal.title}'"
        
        # Import here to avoid circular imports
        from app.api.chat import send_system_update
        
        # Send the system update
        system_update_result = send_system_update(user_id, update_message, goal.id)
        logger.debug(f"System update sent for goal update: {goal.id}")
    
    return jsonify({
        'message': 'Goal updated successfully',
        'goal': {
            'id': goal.id,
            'title': goal.title,
            'start_date': goal.start_date.isoformat(),
            'target_date': goal.target_date.isoformat(),
            'completion_status': goal.completion_status,
            'status': goal.status,
            'parent_goal_id': goal.parent_goal_id,
            'milestones': milestones_data,
            'reflections': reflections_data,
            'progress_updates': progress_updates,
            'created_at': goal.created_at.isoformat(),
            'updated_at': goal.updated_at.isoformat()
        }
    }), 200

@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    """Delete a goal."""
    user_id = get_jwt_identity()
    logger.info(f"Deleting goal ID: {goal_id} for user ID: {user_id}")
    
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        logger.warning(f"Goal not found: {goal_id} for user: {user_id}")
        return jsonify({'error': 'Goal not found'}), 404
    
    # Set parent_goal_id to None for any subgoals
    subgoals = Goal.query.filter_by(parent_goal_id=goal.id).all()
    for subgoal in subgoals:
        logger.debug(f"Removing parent link for subgoal: {subgoal.id}")
        subgoal.parent_goal_id = None
    
    db.session.delete(goal)
    db.session.commit()
    logger.info(f"Goal deleted successfully: {goal_id}")
    
    return jsonify({'message': 'Goal deleted successfully'}), 200

# Milestone endpoints

@goals_bp.route('/<int:goal_id>/milestones', methods=['GET'])
@jwt_required()
def get_milestones(goal_id):
    """Get all milestones for a specific goal."""
    user_id = get_jwt_identity()
    logger.info(f"Getting milestones for goal ID: {goal_id}, user ID: {user_id}")
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        logger.warning(f"Goal not found: {goal_id} for user: {user_id}")
        return jsonify({'error': 'Goal not found'}), 404
    
    # Get milestones
    milestones = Milestone.query.filter_by(goal_id=goal_id).order_by(Milestone.target_date).all()
    logger.debug(f"Retrieved {len(milestones)} milestones")
    
    milestones_data = []
    for milestone in milestones:
        milestones_data.append({
            'id': milestone.id,
            'title': milestone.title,
            'target_date': milestone.target_date.isoformat(),
            'completion_status': milestone.completion_status,
            'status': milestone.status,
            'created_at': milestone.created_at.isoformat(),
            'updated_at': milestone.updated_at.isoformat()
        })
    
    return jsonify({'milestones': milestones_data}), 200

@goals_bp.route('/<int:goal_id>/milestones', methods=['POST'])
@jwt_required()
def create_milestone(goal_id):
    """Create a new milestone for a goal."""
    user_id = get_jwt_identity()
    logger.info(f"Creating milestone for goal ID: {goal_id}, user ID: {user_id}")
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        logger.warning(f"Goal not found: {goal_id} for user: {user_id}")
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    logger.debug(f"Milestone data: {data}")
    
    # Validate required fields
    required_fields = ['title', 'target_date']
    for field in required_fields:
        if field not in data:
            logger.warning(f"Missing required field: {field}")
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Parse target date
    try:
        target_date = datetime.fromisoformat(data['target_date'])
        logger.debug(f"Parsed target_date: {target_date}")
    except ValueError:
        logger.warning(f"Invalid target_date format: {data['target_date']}")
        return jsonify({'error': 'Invalid target_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    # Create milestone
    milestone = Milestone(
        goal_id=goal_id,
        title=data['title'],
        target_date=target_date,
        status=data.get('status', 'pending')
    )
    
    db.session.add(milestone)
    db.session.commit()
    logger.info(f"Milestone created successfully: {milestone.id} - {milestone.title}")
    
    return jsonify({
        'message': 'Milestone created successfully',
        'milestone': {
            'id': milestone.id,
            'title': milestone.title,
            'target_date': milestone.target_date.isoformat(),
            'completion_status': milestone.completion_status,
            'status': milestone.status,
            'created_at': milestone.created_at.isoformat(),
            'updated_at': milestone.updated_at.isoformat()
        }
    }), 201

@goals_bp.route('/<int:goal_id>/milestones/<int:milestone_id>', methods=['PUT'])
@jwt_required()
def update_milestone(goal_id, milestone_id):
    """Update an existing milestone."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Check if milestone exists and belongs to goal
    milestone = Milestone.query.filter_by(id=milestone_id, goal_id=goal_id).first()
    if not milestone:
        return jsonify({'error': 'Milestone not found'}), 404
    
    data = request.get_json()
    
    # Keep track of changes for system update message
    changes = []
    
    # Update milestone fields if provided
    if 'title' in data and data['title'] != milestone.title:
        old_title = milestone.title
        milestone.title = data['title']
        changes.append(f"title from '{old_title}' to '{milestone.title}'")
    
    if 'target_date' in data:
        try:
            new_target_date = datetime.fromisoformat(data['target_date'])
            if new_target_date != milestone.target_date:
                milestone.target_date = new_target_date
                changes.append(f"target date to {milestone.target_date.strftime('%Y-%m-%d')}")
        except ValueError:
            return jsonify({'error': 'Invalid target_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    if 'completion_status' in data:
        try:
            completion_status = float(data['completion_status'])
            if 0 <= completion_status <= 100 and completion_status != milestone.completion_status:
                milestone.completion_status = completion_status
                changes.append(f"completion status to {milestone.completion_status}%")
            else:
                return jsonify({'error': 'Completion status must be between 0 and 100'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid completion_status format. Must be a number between 0 and 100'}), 400
    
    if 'status' in data and data['status'] != milestone.status:
        valid_statuses = ['active', 'completed']
        if data['status'] in valid_statuses:
            old_status = milestone.status
            milestone.status = data['status']
            changes.append(f"status from '{old_status}' to '{milestone.status}'")
        else:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    db.session.commit()
    
    # Send system update to the replica if changes were made
    if changes:
        # Format the changes for the update message
        if len(changes) == 1:
            update_message = f"User updated {changes[0]} for milestone '{milestone.title}' in goal '{goal.title}'"
        else:
            formatted_changes = ", ".join(changes[:-1]) + f" and {changes[-1]}"
            update_message = f"User updated {formatted_changes} for milestone '{milestone.title}' in goal '{goal.title}'"
        
        # Import here to avoid circular imports
        from app.api.chat import send_system_update
        
        # Send the system update
        system_update_result = send_system_update(user_id, update_message, goal.id)
        logger.debug(f"System update sent for milestone update: {milestone.id}")
    
    return jsonify({
        'message': 'Milestone updated successfully',
        'milestone': {
            'id': milestone.id,
            'title': milestone.title,
            'target_date': milestone.target_date.isoformat(),
            'completion_status': milestone.completion_status,
            'status': milestone.status,
            'updated_at': milestone.updated_at.isoformat()
        }
    }), 200

@goals_bp.route('/<int:goal_id>/milestones/<int:milestone_id>', methods=['DELETE'])
@jwt_required()
def delete_milestone(goal_id, milestone_id):
    """Delete a milestone."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Check if milestone exists and belongs to goal
    milestone = Milestone.query.filter_by(id=milestone_id, goal_id=goal_id).first()
    if not milestone:
        return jsonify({'error': 'Milestone not found'}), 404
    
    db.session.delete(milestone)
    db.session.commit()
    
    return jsonify({'message': 'Milestone deleted successfully'}), 200

# Reflection endpoints

@goals_bp.route('/<int:goal_id>/reflections', methods=['GET'])
@jwt_required()
def get_reflections(goal_id):
    """Get all reflections for a specific goal."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Get reflections
    reflections = Reflection.query.filter_by(goal_id=goal_id).all()
    
    reflections_data = {}
    for reflection in reflections:
        reflections_data[reflection.reflection_type] = {
            'id': reflection.id,
            'content': reflection.content,
            'created_at': reflection.created_at.isoformat(),
            'updated_at': reflection.updated_at.isoformat()
        }
    
    return jsonify({'reflections': reflections_data}), 200

@goals_bp.route('/<int:goal_id>/reflections', methods=['POST'])
@jwt_required()
def create_reflection(goal_id):
    """Create a new reflection for a goal."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['reflection_type', 'content']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Check if reflection type already exists
    existing_reflection = Reflection.query.filter_by(
        goal_id=goal_id, 
        reflection_type=data['reflection_type']
    ).first()
    
    if existing_reflection:
        # Update existing reflection
        existing_reflection.content = data['content']
        existing_reflection.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Reflection updated successfully',
            'reflection': {
                'id': existing_reflection.id,
                'reflection_type': existing_reflection.reflection_type,
                'content': existing_reflection.content,
                'created_at': existing_reflection.created_at.isoformat(),
                'updated_at': existing_reflection.updated_at.isoformat()
            }
        }), 200
    
    # Create new reflection
    reflection = Reflection(
        goal_id=goal_id,
        reflection_type=data['reflection_type'],
        content=data['content']
    )
    
    db.session.add(reflection)
    db.session.commit()
    
    return jsonify({
        'message': 'Reflection created successfully',
        'reflection': {
            'id': reflection.id,
            'reflection_type': reflection.reflection_type,
            'content': reflection.content,
            'created_at': reflection.created_at.isoformat(),
            'updated_at': reflection.updated_at.isoformat()
        }
    }), 201

# Milestone progress endpoints
@goals_bp.route('/<int:goal_id>/milestones/<int:milestone_id>/progress', methods=['POST'])
@jwt_required()
def create_milestone_progress(goal_id, milestone_id):
    """Create a new progress update for a milestone."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Check if milestone exists and belongs to goal
    milestone = Milestone.query.filter_by(id=milestone_id, goal_id=goal_id).first()
    if not milestone:
        return jsonify({'error': 'Milestone not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    if 'progress_value' not in data:
        return jsonify({'error': 'Missing required field: progress_value'}), 400
    
    # Get update type (default to 'progress' for backward compatibility)
    update_type = data.get('type', 'progress')
    if update_type not in ['progress', 'effort']:
        return jsonify({'error': 'Invalid type. Must be "progress" or "effort"'}), 400
    
    # Validate progress value
    try:
        progress_value = float(data['progress_value'])
        if not (0 <= progress_value <= 100):
            return jsonify({'error': 'Progress value must be between 0 and 100'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid progress_value format. Must be a number between 0 and 100'}), 400
    
    # Create progress update for milestone - always set milestone_id to ensure clear separation from goal progress
    update = ProgressUpdate(
        goal_id=goal_id,  # Still link to parent goal
        milestone_id=milestone_id,  # Link to the milestone
        progress_value=progress_value,
        type=update_type
    )
    
    # Set type-specific notes if provided
    if update_type == 'progress' and 'progress_notes' in data:
        update.progress_notes = data['progress_notes']
    elif update_type == 'effort' and 'effort_notes' in data:
        update.effort_notes = data['effort_notes']
    
    # If this is a progress update (not effort), update the milestone's completion status
    if update_type == 'progress':
        milestone.completion_status = progress_value
        
        # If progress is 100%, mark milestone as completed
        if progress_value == 100 and milestone.status == 'active':
            milestone.status = 'completed'
    
    db.session.add(update)
    db.session.commit()
    
    # Send system update to the replica
    update_message = f"User updated {update_type} for milestone '{milestone.title}' in goal '{goal.title}' to {progress_value}%"
    
    # Add notes to message if present
    if update_type == 'progress' and update.progress_notes:
        update_message += f" with note: '{update.progress_notes}'"
    elif update_type == 'effort' and update.effort_notes:
        update_message += f" with note: '{update.effort_notes}'"
    
    # Import here to avoid circular imports
    from app.api.chat import send_system_update
    
    # Send the system update
    system_update_result = send_system_update(user_id, update_message, goal_id)
    
    return jsonify({
        'message': f'Milestone {update_type} update created successfully',
        'progress_update': update.to_dict(),
        'milestone': {
            'id': milestone.id,
            'completion_status': milestone.completion_status,
            'status': milestone.status
        }
    }), 201

@goals_bp.route('/<int:goal_id>/milestones/<int:milestone_id>/progress', methods=['GET'])
@jwt_required()
def get_milestone_progress(goal_id, milestone_id):
    """Get all progress updates for a milestone."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Check if milestone exists and belongs to goal
    milestone = Milestone.query.filter_by(id=milestone_id, goal_id=goal_id).first()
    if not milestone:
        return jsonify({'error': 'Milestone not found'}), 404
    
    # Get optional type filter
    update_type = request.args.get('type')
    
    # Build query based on filters - ensure we're only getting updates for this specific milestone
    query = ProgressUpdate.query.filter_by(goal_id=goal_id, milestone_id=milestone_id)
    
    # Filter by type if specified
    if update_type in ['progress', 'effort']:
        query = query.filter_by(type=update_type)
    
    # Get progress updates
    updates = query.order_by(desc(ProgressUpdate.created_at)).all()
    
    # Convert to dictionaries using the to_dict method
    updates_data = [update.to_dict() for update in updates]
    
    return jsonify({'progress_updates': updates_data}), 200 