"""
Utility functions for the Strategist application.
"""

import logging
from flask_jwt_extended import get_jwt_identity

logger = logging.getLogger('strategist.utils')

def get_user_id_from_jwt():
    """
    Get the user ID from JWT identity and convert it to integer.
    
    Returns:
        int: User ID as integer
    """
    try:
        jwt_identity = get_jwt_identity()
        # Convert to integer if it's a string
        if isinstance(jwt_identity, str):
            return int(jwt_identity)
        return jwt_identity
    except (ValueError, TypeError) as e:
        logger.error(f"Error converting JWT identity to integer: {str(e)}")
        # Fall back to string
        return get_jwt_identity() 