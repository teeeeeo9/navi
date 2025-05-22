from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy import desc, and_, or_

from app import db
from app.models import Goal, ProgressUpdate, User, Milestone, Reflection

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
    
    # Get optional type filter
    update_type = request.args.get('type')
    
    # Build query based on filters - only include updates without a milestone_id
    query = ProgressUpdate.query.filter_by(goal_id=goal_id, milestone_id=None)
    
    # Filter by type if specified
    if update_type in ['progress', 'effort']:
        query = query.filter_by(type=update_type)
    
    # Get progress updates
    updates = query.order_by(desc(ProgressUpdate.created_at)).all()
    
    # Convert to dictionaries using the to_dict method
    updates_data = [update.to_dict() for update in updates]
    
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
    
    # Create progress update with type-specific notes
    update = ProgressUpdate(
        goal_id=goal_id,
        progress_value=progress_value,
        type=update_type
    )
    
    # Set type-specific notes if provided
    if update_type == 'progress' and 'progress_notes' in data:
        update.progress_notes = data['progress_notes']
    elif update_type == 'effort' and 'effort_notes' in data:
        update.effort_notes = data['effort_notes']
    
    # Determine if status changed
    status_changed = False
    old_status = goal.status
    
    # Only update goal completion status when type is 'progress'
    if update_type == 'progress':
        # Update goal completion status
        goal.completion_status = progress_value
        
        # If progress is 100%, mark goal as completed
        if progress_value == 100 and goal.status == 'active':
            goal.status = 'completed'
            status_changed = True
    
    db.session.add(update)
    db.session.commit()
    
    # Send system update to the replica
    update_message = f"User updated {update_type} for goal '{goal.title}' to {progress_value}%"
    if status_changed:
        update_message += f" and status changed from '{old_status}' to '{goal.status}'"
    
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
        'message': f'{update_type.capitalize()} update created successfully',
        'progress_update': update.to_dict(),
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
    
    # Store the update type before deleting
    update_type = update.type
    
    db.session.delete(update)
    
    # Only update goal completion status if the deleted update was a 'progress' type
    if update_type == 'progress':
        # Update goal completion status based on most recent progress update (if any)
        most_recent_update = ProgressUpdate.query.filter_by(
            goal_id=goal_id, 
            type='progress'
        ).order_by(desc(ProgressUpdate.created_at)).first()
        
        if most_recent_update:
            goal.completion_status = most_recent_update.progress_value
            # Update goal status based on completion status
            if goal.completion_status == 100 and goal.status == 'active':
                goal.status = 'completed'
            elif goal.completion_status < 100 and goal.status == 'completed':
                goal.status = 'active'
        else:
            # Reset to zero if no progress updates remain
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
        
        # Get the appropriate notes field based on update type
        notes = None
        if update.type == 'progress' and update.progress_notes:
            notes = update.progress_notes
        elif update.type == 'effort' and update.effort_notes:
            notes = update.effort_notes
            
        recently_updated.append({
            'goal_id': goal.id,
            'goal_title': goal.title,
            'progress_value': update.progress_value,
            'type': update.type,
            'notes': notes,
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

@progress_bp.route('/achievements', methods=['GET'])
@jwt_required()
def get_user_achievements():
    """
    Get user achievements including completed goals, milestones, and positive reflections.
    This endpoint is used to celebrate progress and boost user confidence.
    """
    user_id = get_jwt_identity()
    
    # Get query parameters
    limit = request.args.get('limit', 20, type=int)
    
    # Get completed goals
    completed_goals = Goal.query.filter_by(
        user_id=user_id, 
        status='completed'
    ).order_by(desc(Goal.updated_at)).all()
    
    # Get completed milestones (even for goals that aren't fully completed)
    completed_milestones = (Milestone.query
                           .join(Goal, Goal.id == Milestone.goal_id)
                           .filter(Goal.user_id == user_id, Milestone.status == 'completed')
                           .order_by(desc(Milestone.updated_at))
                           .all())
    
    # Get "learned lessons" (positive reflections and improvements)
    positive_reflections = (Reflection.query
                           .join(Goal, Goal.id == Reflection.goal_id)
                           .filter(
                               Goal.user_id == user_id,
                               or_(
                                   Reflection.reflection_type == 'review_positive',
                                   Reflection.reflection_type == 'review_improve'
                               )
                           )
                           .order_by(desc(Reflection.updated_at))
                           .all())
    
    # Combine into chronologically ordered achievements
    achievements = []
    
    # Add completed goals
    for goal in completed_goals:
        achievements.append({
            'type': 'goal',
            'id': goal.id,
            'title': goal.title,
            'completion_date': goal.updated_at.isoformat(),
            'target_date': goal.target_date.isoformat()
        })
    
    # Add completed milestones
    for milestone in completed_milestones:
        goal = Goal.query.get(milestone.goal_id)
        achievements.append({
            'type': 'milestone',
            'id': milestone.id,
            'goal_id': milestone.goal_id,
            'goal_title': goal.title,
            'title': milestone.title,
            'completion_date': milestone.updated_at.isoformat(),
            'target_date': milestone.target_date.isoformat()
        })
    
    # Add positive reflections
    for reflection in positive_reflections:
        goal = Goal.query.get(reflection.goal_id)
        reflection_type_display = {
            'review_positive': 'Positive Reflection',
            'review_improve': 'Lesson Learned'
        }.get(reflection.reflection_type, reflection.reflection_type)
        
        achievements.append({
            'type': 'reflection',
            'id': reflection.id,
            'goal_id': reflection.goal_id,
            'goal_title': goal.title,
            'reflection_type': reflection.reflection_type,
            'reflection_type_display': reflection_type_display,
            'content': reflection.content,
            'date': reflection.updated_at.isoformat()
        })
    
    # Sort all achievements by date (newest first)
    achievements.sort(key=lambda x: x.get('completion_date') or x.get('date'), reverse=True)
    
    # Apply limit
    achievements = achievements[:limit]
    
    # Get stats
    stats = {
        'total_completed_goals': len(completed_goals),
        'total_completed_milestones': len(completed_milestones),
        'total_reflections': len(positive_reflections)
    }
    
    return jsonify({
        'achievements': achievements,
        'stats': stats
    }), 200 