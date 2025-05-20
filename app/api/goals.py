from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc

from app import db
from app.models import Goal, Milestone, User, Reflection
from app.services.sensay import get_sensay_client

goals_bp = Blueprint('goals', __name__)

@goals_bp.route('/', methods=['GET'])
@jwt_required()
def get_goals():
    """Get all goals for the current user."""
    user_id = get_jwt_identity()
    
    # Get query parameters
    status = request.args.get('status')
    parent_id = request.args.get('parent_id')
    
    # Build query
    query = Goal.query.filter_by(user_id=user_id)
    
    # Filter by status if provided
    if status:
        query = query.filter_by(status=status)
    
    # Filter by parent_goal_id if provided
    if parent_id:
        if parent_id == 'null':
            # Get top-level goals
            query = query.filter_by(parent_goal_id=None)
        else:
            # Get subgoals of a specific parent
            query = query.filter_by(parent_goal_id=parent_id)
    
    # Order by creation date (newest first)
    goals = query.order_by(desc(Goal.created_at)).all()
    
    # Format response
    goals_data = []
    for goal in goals:
        # Get milestones
        milestones_data = []
        for milestone in goal.milestones:
            milestones_data.append({
                'id': milestone.id,
                'title': milestone.title,
                'description': milestone.description,
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
            'description': goal.description,
            'importance': goal.importance,
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
    
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Get milestones
    milestones_data = []
    for milestone in goal.milestones:
        milestones_data.append({
            'id': milestone.id,
            'title': milestone.title,
            'description': milestone.description,
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
    for update in goal.progress_updates:
        progress_updates.append({
            'id': update.id,
            'progress_value': update.progress_value,
            'notes': update.notes,
            'created_at': update.created_at.isoformat()
        })
    
    # Get subgoals 
    subgoals = []
    for subgoal in Goal.query.filter_by(parent_goal_id=goal.id).all():
        subgoals.append({
            'id': subgoal.id,
            'title': subgoal.title,
            'description': subgoal.description,
            'completion_status': subgoal.completion_status,
            'status': subgoal.status,
            'target_date': subgoal.target_date.isoformat()
        })
    
    # Get parent goal if exists
    parent_goal = None
    if goal.parent_goal_id:
        parent = Goal.query.get(goal.parent_goal_id)
        if parent:
            parent_goal = {
                'id': parent.id,
                'title': parent.title
            }
    
    goal_data = {
        'id': goal.id,
        'title': goal.title,
        'description': goal.description,
        'importance': goal.importance,
        'start_date': goal.start_date.isoformat(),
        'target_date': goal.target_date.isoformat(),
        'completion_status': goal.completion_status,
        'status': goal.status,
        'parent_goal_id': goal.parent_goal_id,
        'parent_goal': parent_goal,
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
    
    # Validate required fields
    required_fields = ['title', 'target_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Parse dates
    try:
        start_date = datetime.fromisoformat(data.get('start_date', datetime.now().isoformat()))
        target_date = datetime.fromisoformat(data['target_date'])
    except ValueError:
        return jsonify({'error': 'Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    # Create goal
    goal = Goal(
        user_id=user_id,
        title=data['title'],
        description=data.get('description', ''),
        importance=data.get('importance', ''),
        start_date=start_date,
        target_date=target_date,
        status=data.get('status', 'active'),
        parent_goal_id=data.get('parent_goal_id')
    )
    
    db.session.add(goal)
    db.session.commit()
    
    # Create milestones if provided
    milestones_data = []
    if 'milestones' in data and isinstance(data['milestones'], list):
        for milestone_data in data['milestones']:
            if 'title' not in milestone_data or 'target_date' not in milestone_data:
                continue
                
            try:
                milestone_target_date = datetime.fromisoformat(milestone_data['target_date'])
            except ValueError:
                continue
                
            milestone = Milestone(
                goal_id=goal.id,
                title=milestone_data['title'],
                description=milestone_data.get('description', ''),
                target_date=milestone_target_date
            )
            
            db.session.add(milestone)
            milestones_data.append({
                'id': milestone.id,
                'title': milestone.title,
                'description': milestone.description,
                'target_date': milestone.target_date.isoformat(),
                'completion_status': milestone.completion_status,
                'status': milestone.status
            })
    
    # Create reflections if provided
    reflections_data = {}
    if 'reflections' in data and isinstance(data['reflections'], dict):
        for reflection_type, content in data['reflections'].items():
            if not content:
                continue
                
            reflection = Reflection(
                goal_id=goal.id,
                reflection_type=reflection_type,
                content=content
            )
            
            db.session.add(reflection)
            reflections_data[reflection_type] = {
                'id': reflection.id,
                'content': reflection.content,
                'created_at': reflection.created_at.isoformat()
            }
    
    db.session.commit()
    
    return jsonify({
        'message': 'Goal created successfully',
        'goal': {
            'id': goal.id,
            'title': goal.title,
            'description': goal.description,
            'importance': goal.importance,
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
    }), 201

@goals_bp.route('/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    """Update an existing goal."""
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    
    # Update goal fields if provided
    if 'title' in data:
        goal.title = data['title']
    
    if 'description' in data:
        goal.description = data['description']
    
    if 'importance' in data:
        goal.importance = data['importance']
    
    if 'start_date' in data:
        try:
            goal.start_date = datetime.fromisoformat(data['start_date'])
        except ValueError:
            return jsonify({'error': 'Invalid start_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    if 'target_date' in data:
        try:
            goal.target_date = datetime.fromisoformat(data['target_date'])
        except ValueError:
            return jsonify({'error': 'Invalid target_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    if 'completion_status' in data:
        try:
            completion_status = float(data['completion_status'])
            if 0 <= completion_status <= 100:
                goal.completion_status = completion_status
            else:
                return jsonify({'error': 'Completion status must be between 0 and 100'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid completion_status format. Must be a number between 0 and 100'}), 400
    
    if 'status' in data:
        valid_statuses = ['active', 'completed', 'abandoned', 'deferred']
        if data['status'] in valid_statuses:
            goal.status = data['status']
        else:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    if 'parent_goal_id' in data:
        # Verify that the parent goal exists and belongs to the user
        if data['parent_goal_id'] is not None:
            parent_goal = Goal.query.filter_by(id=data['parent_goal_id'], user_id=user_id).first()
            if not parent_goal:
                return jsonify({'error': 'Parent goal not found'}), 404
            
            # Prevent circular dependency
            if parent_goal.id == goal.id:
                return jsonify({'error': 'A goal cannot be its own parent'}), 400
        
        goal.parent_goal_id = data['parent_goal_id']
    
    # Update reflections if provided
    if 'reflections' in data and isinstance(data['reflections'], dict):
        for reflection_type, content in data['reflections'].items():
            # Find existing reflection of this type
            reflection = Reflection.query.filter_by(
                goal_id=goal.id, 
                reflection_type=reflection_type
            ).first()
            
            if reflection:
                # Update existing reflection
                reflection.content = content
                reflection.updated_at = datetime.utcnow()
            else:
                # Create new reflection
                reflection = Reflection(
                    goal_id=goal.id,
                    reflection_type=reflection_type,
                    content=content
                )
                db.session.add(reflection)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Goal updated successfully',
        'goal': {
            'id': goal.id,
            'title': goal.title,
            'description': goal.description,
            'importance': goal.importance,
            'start_date': goal.start_date.isoformat(),
            'target_date': goal.target_date.isoformat(),
            'completion_status': goal.completion_status,
            'status': goal.status,
            'parent_goal_id': goal.parent_goal_id,
            'updated_at': goal.updated_at.isoformat()
        }
    }), 200

@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    """Delete a goal."""
    user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Set parent_goal_id to None for any subgoals
    subgoals = Goal.query.filter_by(parent_goal_id=goal.id).all()
    for subgoal in subgoals:
        subgoal.parent_goal_id = None
    
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({'message': 'Goal deleted successfully'}), 200

# Milestone endpoints

@goals_bp.route('/<int:goal_id>/milestones', methods=['GET'])
@jwt_required()
def get_milestones(goal_id):
    """Get all milestones for a specific goal."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Get milestones
    milestones = Milestone.query.filter_by(goal_id=goal_id).order_by(Milestone.target_date).all()
    
    milestones_data = []
    for milestone in milestones:
        milestones_data.append({
            'id': milestone.id,
            'title': milestone.title,
            'description': milestone.description,
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
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['title', 'target_date']
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400
    
    # Parse target date
    try:
        target_date = datetime.fromisoformat(data['target_date'])
    except ValueError:
        return jsonify({'error': 'Invalid target_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    # Create milestone
    milestone = Milestone(
        goal_id=goal_id,
        title=data['title'],
        description=data.get('description', ''),
        target_date=target_date,
        status=data.get('status', 'pending')
    )
    
    db.session.add(milestone)
    db.session.commit()
    
    return jsonify({
        'message': 'Milestone created successfully',
        'milestone': {
            'id': milestone.id,
            'title': milestone.title,
            'description': milestone.description,
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
    
    # Update milestone fields if provided
    if 'title' in data:
        milestone.title = data['title']
    
    if 'description' in data:
        milestone.description = data['description']
    
    if 'target_date' in data:
        try:
            milestone.target_date = datetime.fromisoformat(data['target_date'])
        except ValueError:
            return jsonify({'error': 'Invalid target_date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)'}), 400
    
    if 'completion_status' in data:
        try:
            completion_status = float(data['completion_status'])
            if 0 <= completion_status <= 100:
                milestone.completion_status = completion_status
            else:
                return jsonify({'error': 'Completion status must be between 0 and 100'}), 400
        except ValueError:
            return jsonify({'error': 'Invalid completion_status format. Must be a number between 0 and 100'}), 400
    
    if 'status' in data:
        valid_statuses = ['pending', 'completed', 'missed']
        if data['status'] in valid_statuses:
            milestone.status = data['status']
        else:
            return jsonify({'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'}), 400
    
    db.session.commit()
    
    return jsonify({
        'message': 'Milestone updated successfully',
        'milestone': {
            'id': milestone.id,
            'title': milestone.title,
            'description': milestone.description,
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