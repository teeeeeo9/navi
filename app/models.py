from datetime import datetime
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    """User model for authentication and profile information."""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    sensay_user_id = db.Column(db.String(120), unique=True, nullable=True)
    replica_id = db.Column(db.String(120), nullable=True)  # To store the user's Sensay replica ID
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    goals = db.relationship('Goal', backref='user', lazy=True, cascade='all, delete-orphan')
    preferences = db.relationship('UserPreference', backref='user', uselist=False, cascade='all, delete-orphan')
    chat_history = db.relationship('ChatMessage', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def __repr__(self):
        return f'<User {self.username}>'

class UserPreference(db.Model):
    """User preferences for app customization and replica settings."""
    __tablename__ = 'user_preferences'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    reminder_frequency = db.Column(db.String(20), default='weekly')  # daily, weekly, monthly
    reminder_day = db.Column(db.Integer, nullable=True)  # Day of week or month
    reminder_time = db.Column(db.String(5), default="09:00")  # HH:MM format
    time_zone = db.Column(db.String(50), default="UTC")
    notification_channels = db.Column(db.String(100), default="email")  # Comma-separated channels
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<UserPreference for user_id {self.user_id}>'

class Goal(db.Model):
    """Strategic goals defined by users."""
    __tablename__ = 'goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    importance = db.Column(db.Text, nullable=True)  # Why this goal is important
    start_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    target_date = db.Column(db.DateTime, nullable=False)
    completion_status = db.Column(db.Float, default=0.0)  # Percentage of completion (0-100)
    status = db.Column(db.String(20), default='active')  # active, completed, abandoned, deferred
    parent_goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    milestones = db.relationship('Milestone', backref='goal', lazy=True, cascade='all, delete-orphan')
    reflections = db.relationship('Reflection', backref='goal', lazy=True, cascade='all, delete-orphan')
    progress_updates = db.relationship('ProgressUpdate', backref='goal', lazy=True, cascade='all, delete-orphan')
    subgoals = db.relationship('Goal', backref=db.backref('parent_goal', remote_side=[id]), lazy=True)
    
    def __repr__(self):
        return f'<Goal {self.title}>'

class Milestone(db.Model):
    """Key milestones within a goal."""
    __tablename__ = 'milestones'
    
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_date = db.Column(db.DateTime, nullable=False)
    completion_status = db.Column(db.Float, default=0.0)  # Percentage of completion (0-100)
    status = db.Column(db.String(20), default='pending')  # pending, completed, missed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Milestone {self.title} for goal_id {self.goal_id}>'

class ProgressUpdate(db.Model):
    """User progress updates for goals."""
    __tablename__ = 'progress_updates'
    
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    progress_value = db.Column(db.Float, nullable=False)  # Percentage (0-100)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ProgressUpdate for goal_id {self.goal_id}: {self.progress_value}%>'

class Reflection(db.Model):
    """User reflections on goals, prompted by the replica."""
    __tablename__ = 'reflections'
    
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    reflection_type = db.Column(db.String(50), nullable=False)  # importance, obstacles, environment, success, improvement
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Reflection {self.reflection_type} for goal_id {self.goal_id}>'

class ChatMessage(db.Model):
    """Message history between user and replica."""
    __tablename__ = 'chat_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    sender = db.Column(db.String(20), nullable=False)  # 'user', 'replica', or 'system'
    content = db.Column(db.Text, nullable=False)
    related_goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ChatMessage from {self.sender} at {self.created_at}>' 