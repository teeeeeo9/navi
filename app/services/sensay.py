import os
import requests
import json
import logging
import urllib.parse
from typing import Dict, List, Any, Optional, Union

logger = logging.getLogger(__name__)

class SensayAPIError(Exception):
    """Exception raised for Sensay API errors."""
    def __init__(self, status_code, message):
        self.status_code = status_code
        self.message = message
        super().__init__(f"Sensay API Error ({status_code}): {message}")

class SensayAPI:
    """Python client for the Sensay AI API."""
    
    def __init__(self, api_key: str = None, base_url: str = "https://api.sensay.io"):
        """Initialize the Sensay API client.
        
        Args:
            api_key: Sensay API key. If None, will try to load from environment variable.
            base_url: Base URL for the Sensay API.
        """
        self.api_key = api_key or os.environ.get("SENSAY_API_KEY")
        if not self.api_key:
            raise ValueError("Sensay API key is required. Please provide it or set SENSAY_API_KEY environment variable.")
        
        self.base_url = base_url
        self.headers = {
            "X-ORGANIZATION-SECRET": self.api_key,
            "Content-Type": "application/json"
        }
    
    def _make_request(self, method: str, endpoint: str, data: Dict = None, params: Dict = None, 
                      user_id: str = None) -> Dict:
        """Make an HTTP request to the Sensay API.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint path
            data: Request body data for POST/PUT requests
            params: URL query parameters
            user_id: Optional user ID to include in headers
            
        Returns:
            Response data as dictionary
        """
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        
        if user_id:
            headers["X-USER-ID"] = user_id
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                params=params,
                json=data
            )
            
            # Check for error responses
            if response.status_code >= 400:
                error_message = response.text
                try:
                    error_data = response.json()
                    if "message" in error_data:
                        error_message = error_data["message"]
                except:
                    pass
                raise SensayAPIError(response.status_code, error_message)
            
            # Return successful response data
            if response.text:
                return response.json()
            return {}
            
        except requests.RequestException as e:
            logger.error(f"Request error: {str(e)}")
            raise SensayAPIError(500, str(e))
    
    # User Management
    
    def get_user(self, user_id: str) -> Dict:
        """Get a user by ID."""
        return self._make_request("GET", f"/v1/users/{user_id}")
    
    def create_user(self, user_data: Dict) -> Dict:
        """Create a new user."""
        return self._make_request(
            "POST", 
            "/v1/users", 
            data=user_data
        )
    
    def update_user(self, user_id: str, user_data: Dict) -> Dict:
        """Update an existing user."""
        return self._make_request(
            "PUT", 
            f"/v1/users/{user_id}", 
            data=user_data,
            user_id=user_id
        )
    
    # Replica Management
    
    def list_replicas(self, user_id: str) -> Dict:
        """List all replicas for a user."""
        return self._make_request("GET", "/v1/replicas", user_id=user_id)
    
    def get_replica(self, replica_id: str, user_id: str) -> Dict:
        """Get a replica by ID."""
        return self._make_request("GET", f"/v1/replicas/{replica_id}", user_id=user_id)
    
    def create_replica(self, user_id: str, replica_data: Dict) -> Dict:
        """Create a new replica."""
        return self._make_request(
            "POST", 
            "/v1/replicas", 
            data=replica_data,
            user_id=user_id
        )
    
    def create_replica_with_training(self, user_id: str, replica_data: Dict, training_sources: List[Dict]) -> Dict:
        """Create a new replica and train it with provided sources.
        
        Args:
            user_id: The user ID
            replica_data: Dictionary containing replica configuration
            training_sources: List of training source dictionaries. Each should contain either:
                - For URLs: {"url": "https://example.com", "title": "Optional title"}
                - For text: {"text": "Content to train on", "title": "Optional title"}
                - For YouTube: {"youtube_url": "https://youtube.com/watch?v=ID", "title": "Optional title"}
        
        Returns:
            The created replica data
        """
        # First create the replica
        replica = self.create_replica(user_id, replica_data)
        replica_id = replica.get("id")
        
        if not replica_id:
            raise SensayAPIError(500, "Failed to get replica ID from creation response")
        
        # Add each training source to the knowledge base
        for source in training_sources:
            kb_entry = {}
            
            if "youtube_url" in source:
                # For YouTube URLs, add as URL type
                kb_entry = {
                    "url": source["youtube_url"],
                    "title": source.get("title", f"YouTube: {source['youtube_url']}"),
                    "replica_ids": [replica_id]
                }
            elif "url" in source:
                # For regular URLs
                kb_entry = {
                    "url": source["url"],
                    "title": source.get("title", f"URL: {source['url']}"),
                    "replica_ids": [replica_id]
                }
            elif "text" in source:
                # For text content
                kb_entry = {
                    "text": source["text"],
                    "title": source.get("title", "Text content"),
                    "replica_ids": [replica_id]
                }
            else:
                logger.warning(f"Skipping invalid training source: {source}")
                continue
            
            # Add to knowledge base
            self.create_knowledge_base_entry(user_id, kb_entry)
            
        return replica
    
    def update_replica(self, replica_id: str, user_id: str, replica_data: Dict) -> Dict:
        """Update an existing replica."""
        return self._make_request(
            "PUT", 
            f"/v1/replicas/{replica_id}", 
            data=replica_data,
            user_id=user_id
        )
    
    def delete_replica(self, replica_id: str, user_id: str) -> Dict:
        """Delete a replica."""
        return self._make_request("DELETE", f"/v1/replicas/{replica_id}", user_id=user_id)
    
    # Chat Completions
    
    def create_chat_completion(self, replica_id: str, user_id: str, content: str, 
                               source: str = "web", skip_chat_history: bool = False) -> Dict:
        """Generate a chat completion from a replica."""
        return self._make_request(
            "POST", 
            f"/v1/replicas/{replica_id}/chat/completions", 
            data={
                "content": content,
                "source": source,
                "skip_chat_history": skip_chat_history
            },
            user_id=user_id
        )
    
    # Chat History
    
    def get_chat_history(self, user_id: str, limit: int = 100) -> Dict:
        """Get chat history for a user."""
        return self._make_request(
            "GET", 
            "/v1/chat-history", 
            params={"limit": limit},
            user_id=user_id
        )
    
    def create_chat_history_entry(self, user_id: str, entry_data: Dict) -> Dict:
        """Create a new chat history entry."""
        return self._make_request(
            "POST", 
            "/v1/chat-history", 
            data=entry_data,
            user_id=user_id
        )
    
    # Knowledge Base Management
    
    def create_knowledge_base_entry(self, user_id: str, entry_data: Dict) -> Dict:
        """Create a new knowledge base entry for training.
        
        Args:
            user_id: The user ID
            entry_data: Dictionary containing entry data with these possible fields:
                - title: Title of the entry (required)
                - url: URL to fetch content from (if using URL source)
                - text: Text content to use (if using text source)
                - file_path: Path to local file to upload (requires using generate_signed_url first)
                - replica_ids: List of replica IDs to associate with this entry
        
        Returns:
            Created knowledge base entry data
        """
        return self._make_request(
            "POST", 
            "/v1/training/knowledge-base", 
            data=entry_data,
            user_id=user_id
        )
    
    def list_knowledge_base_entries(self, user_id: str) -> Dict:
        """List all knowledge base entries for a user."""
        return self._make_request(
            "GET", 
            "/v1/training/knowledge-base", 
            user_id=user_id
        )
    
    def get_knowledge_base_entry(self, entry_id: str, user_id: str) -> Dict:
        """Get a knowledge base entry by ID."""
        return self._make_request(
            "GET", 
            f"/v1/training/knowledge-base/{entry_id}", 
            user_id=user_id
        )
    
    def update_knowledge_base_entry(self, entry_id: str, user_id: str, entry_data: Dict) -> Dict:
        """Update a knowledge base entry."""
        return self._make_request(
            "PUT", 
            f"/v1/training/knowledge-base/{entry_id}", 
            data=entry_data,
            user_id=user_id
        )

    def delete_knowledge_base_entry(self, entry_id: str, user_id: str) -> Dict:
        """Delete a knowledge base entry."""
        return self._make_request(
            "DELETE", 
            f"/v1/training/knowledge-base/{entry_id}", 
            user_id=user_id
        )
    
    def generate_signed_url(self, user_id: str, file_name: str, content_type: str = None) -> Dict:
        """Generate a signed URL for file upload to the knowledge base.
        
        Args:
            user_id: The user ID
            file_name: Name of the file to upload
            content_type: MIME type of the file (optional)
        
        Returns:
            Dictionary containing the signed URL and additional information
        """
        params = {"file_name": file_name}
        if content_type:
            params["content_type"] = content_type
            
        return self._make_request(
            "GET", 
            "/v1/training/knowledge-base/signed-url", 
            params=params,
            user_id=user_id
        )
    
    def upload_file_to_signed_url(self, signed_url: str, file_path: str, content_type: str = None) -> bool:
        """Upload a file to a signed URL.
        
        Args:
            signed_url: The signed URL for upload
            file_path: Path to the local file to upload
            content_type: MIME type of the file (optional)
        
        Returns:
            True if successful, False otherwise
        """
        headers = {}
        if content_type:
            headers["Content-Type"] = content_type
            
        try:
            with open(file_path, 'rb') as file:
                response = requests.put(signed_url, data=file, headers=headers)
                return response.status_code in [200, 201, 204]
        except Exception as e:
            logger.error(f"File upload error: {str(e)}")
            return False
    
    def add_youtube_to_knowledge_base(self, user_id: str, youtube_url: str, 
                                    title: str = None, replica_ids: List[str] = None) -> Dict:
        """Add a YouTube video to the knowledge base.
        
        Args:
            user_id: The user ID
            youtube_url: URL of the YouTube video
            title: Title for the knowledge base entry (optional)
            replica_ids: List of replica IDs to associate with this entry (optional)
        
        Returns:
            Created knowledge base entry data
        """
        if not title:
            # Extract video ID for the title if no title provided
            try:
                parsed_url = urllib.parse.urlparse(youtube_url)
                query_params = urllib.parse.parse_qs(parsed_url.query)
                video_id = query_params.get('v', ['Unknown'])[0]
                title = f"YouTube: {video_id}"
            except Exception:
                title = f"YouTube: {youtube_url}"
        
        entry_data = {
            "url": youtube_url,
            "title": title
        }
        
        if replica_ids:
            entry_data["replica_ids"] = replica_ids
            
        return self.create_knowledge_base_entry(user_id, entry_data)
    
    def train_replica_with_youtube(self, replica_id: str, user_id: str, youtube_url: str, 
                                  title: str = None) -> Dict:
        """Train an existing replica with a YouTube video.
        
        Args:
            replica_id: ID of the replica to train
            user_id: The user ID
            youtube_url: URL of the YouTube video
            title: Title for the knowledge base entry (optional)
        
        Returns:
            Created knowledge base entry data
        """
        return self.add_youtube_to_knowledge_base(
            user_id=user_id,
            youtube_url=youtube_url,
            title=title,
            replica_ids=[replica_id]
        )

# Helper function to create and initialize the Sensay client
def get_sensay_client():
    """Create and return a configured Sensay API client."""
    api_key = os.environ.get("SENSAY_API_KEY")
    return SensayAPI(api_key=api_key) 