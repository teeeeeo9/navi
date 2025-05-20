from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc

from app import db
from app.models import Goal, ProgressUpdate, User

progress_bp = Blueprint('progress', __name__)

@progress_bp.route('/goals/<int:goal_id>/updates', methods=['GET'])
@jwt_required()
def get_progress_updates(goal_id):
    """Get all progress updates for a specific goal."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Get progress updates
    updates = ProgressUpdate.query.filter_by(goal_id=goal_id).order_by(desc(ProgressUpdate.created_at)).all()
    
    updates_data = []
    for update in updates:
        updates_data.append({
            'id': update.id,
            'progress_value': update.progress_value,
            'notes': update.notes,
            'created_at': update.created_at.isoformat()
        })
    
    return jsonify({'progress_updates': updates_data}), 200

@progress_bp.route('/goals/<int:goal_id>/updates', methods=['POST'])
@jwt_required()
def create_progress_update(goal_id):
    """Create a new progress update for a goal."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    
    # Validate required fields
    if 'progress_value' not in data:
        return jsonify({'error': 'Missing required field: progress_value'}), 400
    
    # Validate progress value
    try:
        progress_value = float(data['progress_value'])
        if not (0 <= progress_value <= 100):
            return jsonify({'error': 'Progress value must be between 0 and 100'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid progress_value format. Must be a number between 0 and 100'}), 400
    
    # Create progress update
    update = ProgressUpdate(
        goal_id=goal_id,
        progress_value=progress_value,
        notes=data.get('notes', '')
    )
    
    # Update goal completion status
    goal.completion_status = progress_value
    
    # If progress is 100%, mark goal as completed
    if progress_value == 100 and goal.status == 'active':
        goal.status = 'completed'
    
    db.session.add(update)
    db.session.commit()
    
    return jsonify({
        'message': 'Progress update created successfully',
        'progress_update': {
            'id': update.id,
            'progress_value': update.progress_value,
            'notes': update.notes,
            'created_at': update.created_at.isoformat()
        },
        'goal': {
            'id': goal.id,
            'completion_status': goal.completion_status,
            'status': goal.status
        }
    }), 201

@progress_bp.route('/goals/<int:goal_id>/updates/<int:update_id>', methods=['DELETE'])
@jwt_required()
def delete_progress_update(goal_id, update_id):
    """Delete a progress update."""
    user_id = get_jwt_identity()
    
    # Check if goal exists and belongs to user
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    # Check if update exists and belongs to goal
    update = ProgressUpdate.query.filter_by(id=update_id, goal_id=goal_id).first()
    if not update:
        return jsonify({'error': 'Progress update not found'}), 404
    
    db.session.delete(update)
    
    # Update goal completion status based on most recent update (if any)
    most_recent_update = ProgressUpdate.query.filter_by(goal_id=goal_id).order_by(desc(ProgressUpdate.created_at)).first()
    if most_recent_update:
        goal.completion_status = most_recent_update.progress_value
        # Update goal status based on completion status
        if goal.completion_status == 100 and goal.status == 'active':
            goal.status = 'completed'
        elif goal.completion_status < 100 and goal.status == 'completed':
            goal.status = 'active'
    else:
        # Reset to zero if no updates remain
        goal.completion_status = 0
        if goal.status == 'completed':
            goal.status = 'active'
    
    db.session.commit()
    
    return jsonify({
        'message': 'Progress update deleted successfully',
        'goal': {
            'id': goal.id,
            'completion_status': goal.completion_status,
            'status': goal.status
        }
    }), 200

@progress_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_progress_summary():
    """Get a summary of goal progress for the current user."""
    user_id = get_jwt_identity()
    
    # Get all active goals
    goals = Goal.query.filter_by(user_id=user_id, status='active').all()
    
    # Calculate overall progress
    total_goals = len(goals)
    completed_goals = Goal.query.filter_by(user_id=user_id, status='completed').count()
    abandoned_goals = Goal.query.filter_by(user_id=user_id, status='abandoned').count()
    
    # Calculate average completion percentage for active goals
    avg_completion = 0
    if total_goals > 0:
        avg_completion = sum(goal.completion_status for goal in goals) / total_goals
    
    # Get goals that are almost due (within 7 days)
    from datetime import timedelta
    now = datetime.utcnow()
    soon_due = []
    for goal in goals:
        if now <= goal.target_date <= (now + timedelta(days=7)):
            soon_due.append({
                'id': goal.id,
                'title': goal.title,
                'target_date': goal.target_date.isoformat(),
                'completion_status': goal.completion_status,
                'days_remaining': (goal.target_date - now).days
            })
    
    # Get goals with recent progress updates
    recently_updated = []
    recent_updates = (ProgressUpdate.query
                      .join(Goal, Goal.id == ProgressUpdate.goal_id)
                      .filter(Goal.user_id == user_id)
                      .order_by(desc(ProgressUpdate.created_at))
                      .limit(5)
                      .all())
    
    for update in recent_updates:
        goal = Goal.query.get(update.goal_id)
        recently_updated.append({
            'goal_id': goal.id,
            'goal_title': goal.title,
            'progress_value': update.progress_value,
            'notes': update.notes,
            'created_at': update.created_at.isoformat()
        })
    
    return jsonify({
        'summary': {
            'total_goals': total_goals + completed_goals + abandoned_goals,
            'active_goals': total_goals,
            'completed_goals': completed_goals,
            'abandoned_goals': abandoned_goals,
            'avg_completion': avg_completion
        },
        'soon_due': soon_due,
        'recently_updated': recently_updated
    }), 200 