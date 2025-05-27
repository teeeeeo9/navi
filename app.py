import logging
from app import create_app, db
from flask.cli import FlaskGroup

# Create a function to get the app instance
def get_app():
    return create_app()

# Create CLI using the factory function
cli = FlaskGroup(get_app)

# Get logger
logger = logging.getLogger('strategist')

@cli.command("create_db")
def create_db():
    """Create the database tables."""
    logger.info("Creating database tables...")
    try:
        db.create_all()
        logger.info("Database tables created successfully")
        print("Database tables created successfully")
    except Exception as e:
        logger.error(f"Error creating database tables: {str(e)}", exc_info=True)
        print(f"Error creating database tables: {str(e)}")
        raise

@cli.command("drop_db")
def drop_db():
    """Drop the database tables."""
    logger.info("Dropping database tables...")
    try:
        db.drop_all()
        logger.info("Database tables dropped successfully")
        print("Database tables dropped successfully")
    except Exception as e:
        logger.error(f"Error dropping database tables: {str(e)}", exc_info=True)
        print(f"Error dropping database tables: {str(e)}")
        raise

if __name__ == "__main__":
    logger.info("Starting Strategist application")
    cli() 