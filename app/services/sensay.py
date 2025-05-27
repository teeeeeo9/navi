import os
import requests
import json
import logging
from typing import Dict, List, Any, Optional

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
                      user_id: str = None, headers: Dict = None) -> Dict:
        """Make an HTTP request to the Sensay API.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE)
            endpoint: API endpoint path
            data: Request body data for POST/PUT requests
            params: URL query parameters
            user_id: Optional user ID to include in headers
            headers: Additional headers to include in the request
            
        Returns:
            Response data as dictionary
        """
        url = f"{self.base_url}{endpoint}"
        request_headers = self.headers.copy()
        
        if user_id:
            request_headers["X-USER-ID"] = user_id
            
        # Add any additional headers
        if headers:
            request_headers.update(headers)
        
        try:
            response = requests.request(
                method=method,
                url=url,
                headers=request_headers,
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
    
    def create_knowledge_base_entry(self, user_id: str, replica_id: str, entry_data: Dict) -> Dict:
        """Create a new knowledge base entry for training.
        
        Args:
            user_id: Sensay user ID
            replica_id: ID of the replica to train
            entry_data: Dictionary containing knowledge base entry data:
                - title: Title of the entry (optional)
                - content/rawText: Content of the entry (text)
                - description: Optional description
                - tags: Optional list of tags in metadata
                - metadata: Optional metadata dictionary
                
        Returns:
            Dictionary with created knowledge base entry details
        """
        logger.debug(f"Creating knowledge base entry for replica: {replica_id}")
        
        # Prepare headers with API version if needed
        headers = {
            "X-API-Version": "2025-03-25"
        }
        
        return self._make_request(
            "POST", 
            f"/v1/replicas/{replica_id}/training", 
            data=entry_data,
            user_id=user_id,
            headers=headers
        )
    
    def update_knowledge_base_entry(self, user_id: str, replica_id: str, training_id: str, entry_data: Dict) -> Dict:
        """Update an existing knowledge base entry.
        
        Args:
            user_id: Sensay user ID
            replica_id: ID of the replica
            training_id: ID of the training entry to update
            entry_data: Dictionary containing updated knowledge base entry data
                
        Returns:
            Dictionary with updated knowledge base entry details
        """
        logger.debug(f"Updating knowledge base entry: {training_id} for replica: {replica_id}")
        
        # Prepare headers with API version if needed
        headers = {
            "X-API-Version": "2025-03-25"
        }
        
        return self._make_request(
            "PUT", 
            f"/v1/replicas/{replica_id}/training/{training_id}", 
            data=entry_data,
            user_id=user_id,
            headers=headers
        )
    
    def get_knowledge_base_entry(self, user_id: str, replica_id: str, training_id: str) -> Dict:
        """Get a knowledge base entry by ID.
        
        Args:
            user_id: Sensay user ID
            replica_id: ID of the replica
            training_id: ID of the training entry to retrieve
                
        Returns:
            Dictionary with knowledge base entry details
        """
        logger.debug(f"Getting knowledge base entry: {training_id} for replica: {replica_id}")
        
        # Prepare headers with API version if needed
        headers = {
            "X-API-Version": "2025-03-25"
        }
        
        return self._make_request(
            "GET", 
            f"/v1/replicas/{replica_id}/training/{training_id}", 
            user_id=user_id,
            headers=headers
        )
    
    def list_knowledge_base_entries(self, user_id: str, replica_id: str = None) -> Dict:
        """List all knowledge base entries.
        
        Args:
            user_id: Sensay user ID
            replica_id: Optional replica ID to filter entries by
                
        Returns:
            Dictionary with list of knowledge base entries
        """
        # Prepare headers with API version if needed
        headers = {
            "X-API-Version": "2025-03-25"
        }
        
        # # Determine the correct endpoint based on whether replica_id is provided
        # if replica_id:
        #     logger.debug(f"Listing knowledge base entries for replica: {replica_id}")
        #     endpoint = f"/v1/replicas/{replica_id}/training"
        # else:
        logger.debug(f"Listing all knowledge base entries for user: {user_id}")
        endpoint = "/v1/training"
            
        return self._make_request(
            "GET", 
            endpoint,
            user_id=user_id,
            headers=headers
        )

    def delete_knowledge_base_entry(self, user_id: str, replica_id: str, training_id: str) -> Dict:
        """Delete a knowledge base entry.
        
        Args:
            user_id: Sensay user ID
            replica_id: ID of the replica
            training_id: ID of the training entry to delete
                
        Returns:
            Empty dictionary on success
        """
        logger.debug(f"Deleting knowledge base entry: {training_id} for replica: {replica_id}")
        
        # Prepare headers with API version if needed
        headers = {
            "X-API-Version": "2025-03-25"
        }
        
        return self._make_request(
            "DELETE", 
            f"/v1/replicas/{replica_id}/training/{training_id}", 
            user_id=user_id,
            headers=headers
        )
        
    def generate_signed_url(self, user_id: str, file_name: str, content_type: str) -> Dict:
        """Generate a signed URL for file upload.
        
        Args:
            user_id: Sensay user ID
            file_name: Name of the file to upload
            content_type: Content type of the file (e.g., "application/pdf")
                
        Returns:
            Dictionary with signed URL and upload ID
        """
        logger.debug(f"Generating signed URL for file: {file_name}")
        
        # Prepare headers with API version if needed
        headers = {
            "X-API-Version": "2025-03-25"
        }
        
        return self._make_request(
            "GET", 
            "/v1/training/upload-url", 
            params={
                "fileName": file_name,
                "contentType": content_type
            },
            user_id=user_id,
            headers=headers
        )
        
    def train_replica_with_knowledge_base(self, user_id: str, replica_id: str, entries: List[Dict]) -> List[Dict]:
        """Train a replica with knowledge base entries.
        
        Args:
            user_id: Sensay user ID
            replica_id: Replica ID to train
            entries: List of dictionaries containing knowledge base entry data
                
        Returns:
            List of created knowledge base entry details
        """
        logger.info(f"Training replica {replica_id} with {len(entries)} knowledge base entries")
        created_entries = []
        
        for entry in entries:
            try:
                # Prepare entry data in the format expected by the API
                entry_data = {
                    "rawText": entry.get("content", ""),
                    "processedText": entry.get("content", ""),
                    "metadata": {
                        "title": entry.get("title", "Untitled Entry"),
                        "description": entry.get("description", ""),
                        "tags": entry.get("tags", [])
                    }
                }
                
                # Create knowledge base entry
                result = self.create_knowledge_base_entry(user_id, replica_id, entry_data)
                created_entries.append(result)
                logger.debug(f"Created knowledge base entry for: {entry.get('title')}")
            except Exception as e:
                logger.error(f"Error creating knowledge base entry: {str(e)}")
                # Continue with other entries even if one fails
        
        return created_entries

# Helper function to create and initialize the Sensay client
def get_sensay_client():
    """Create and return a configured Sensay API client."""
    api_key = os.environ.get("SENSAY_API_KEY")
    return SensayAPI(api_key=api_key) 