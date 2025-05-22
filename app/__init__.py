import os
import logging
from logging.handlers import RotatingFileHandler
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize SQLAlchemy
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

# Setup logger
logger = logging.getLogger('strategist')

def create_app(test_config=None):
    """Create and configure the Flask application."""
    app = Flask(__name__, instance_relative_config=True)
    
    # Default configuration
    app.config.from_mapping(
        SECRET_KEY=os.environ.get('SECRET_KEY', 'dev_key'),
        SQLALCHEMY_DATABASE_URI=os.environ.get('DATABASE_URL', 'sqlite:///strategist.db'),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JWT_SECRET_KEY=os.environ.get('JWT_SECRET_KEY', 'jwt_dev_key'),
        JWT_ACCESS_TOKEN_EXPIRES=int(os.environ.get('JWT_ACCESS_TOKEN_EXPIRES', 86400)),
        JWT_IDENTITY_CLAIM='sub',
        JWT_JSON_SUBJECT=True,  # Allow non-string subject values
        LOG_LEVEL=os.environ.get('LOG_LEVEL', 'INFO')
    )
    
    # Test configuration
    if test_config is not None:
        app.config.from_mapping(test_config)
    
    # Setup logging
    configure_logging(app)
    
    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Configure CORS to allow requests from the frontend domain
    CORS(app, resources={r"/api/*": {"origins": [
        "http://localhost:5173",  # Local development
        "https://navi-i412.onrender.com",  # Production frontend domain
        os.environ.get("FRONTEND_URL", "*")  # Configurable frontend URL
    ]}})
    
    # Setup JWT error handlers
    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        logger.error(f"Invalid JWT token: {error_string}")
        return jsonify({"msg": f"Invalid token: {error_string}"}), 401
        
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        logger.error(f"Expired JWT token: {jwt_payload}")
        return jsonify({"msg": "Token has expired"}), 401
    
    # Ensure instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Import and register blueprints
    from app.api.auth import auth_bp
    from app.api.goals import goals_bp
    from app.api.progress import progress_bp
    from app.api.chat import chat_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(goals_bp, url_prefix='/api/goals')
    app.register_blueprint(progress_bp, url_prefix='/api/progress')
    app.register_blueprint(chat_bp, url_prefix='/api/chat')
    
    logger.info('Application initialized successfully')
    
    return app

def configure_logging(app):
    """Configure logging for the application."""
    log_level = getattr(logging, app.config['LOG_LEVEL'].upper(), logging.INFO)
    
    # Create logs directory if it doesn't exist
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    # First, reset root logger to avoid duplicate logs
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)
    
    # Configure root logger with a NullHandler to avoid propagation issues
    logging.root.addHandler(logging.NullHandler())
    
    # Configure app logger
    logger.setLevel(log_level)
    
    # Remove any existing handlers to avoid duplicates
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)
    
    # Add file handler
    file_handler = RotatingFileHandler('logs/strategist.log', maxBytes=10485760, backupCount=10)
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - [%(filename)s:%(lineno)d] - %(message)s'
    )
    file_handler.setFormatter(file_formatter)
    file_handler.setLevel(log_level)
    logger.addHandler(file_handler)
    
    # Add console handler
    console_handler = logging.StreamHandler()
    console_formatter = logging.Formatter('%(levelname)s - %(message)s')
    console_handler.setFormatter(console_formatter)
    console_handler.setLevel(log_level)
    logger.addHandler(console_handler)
    
    # Clear Flask's default logger handlers
    app.logger.handlers.clear()
    
    # Add handlers to Flask logger
    for handler in logger.handlers[:]:
        app.logger.addHandler(handler)
    
    app.logger.setLevel(log_level)
    
    # Log some basic info about the app
    logger.info(f"Starting Strategist app with log level: {app.config['LOG_LEVEL']}")
    logger.info(f"Database URI: {app.config['SQLALCHEMY_DATABASE_URI']}")
    logger.debug("Debug logging enabled") 