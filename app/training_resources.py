"""
Training resources for Sensay replicas.
This file contains URLs, YouTube links, and other resources used to train replicas.
"""

# Default training sources for new replicas
DEFAULT_TRAINING_SOURCES = [
    {
        "youtube_url": "https://www.youtube.com/watch?v=pRbvDw_1LJ8",
        "title": "Strategic Planning Training Video"
    }
    # Add more training sources here as needed
]

# Function to get all training sources for a replica
def get_training_sources(replica_type="default"):
    """
    Get training sources for a specific replica type.
    
    Args:
        replica_type: Type of replica (default, yoda, etc.)
        
    Returns:
        List of training source dictionaries
    """
    # Currently we use the same sources for all replica types
    # This function allows for future customization based on replica type
    return DEFAULT_TRAINING_SOURCES.copy() 