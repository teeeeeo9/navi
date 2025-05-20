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
            f"/v1/replicas/{replica_id}/chat-completions", 
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
        """Create a new knowledge base entry for training."""
        return self._make_request(
            "POST", 
            "/v1/training/knowledge-base", 
            data=entry_data,
            user_id=user_id
        )
    
    def list_knowledge_base_entries(self, user_id: str) -> Dict:
        """List all knowledge base entries."""
        return self._make_request(
            "GET", 
            "/v1/training/knowledge-base", 
            user_id=user_id
        )

    def delete_knowledge_base_entry(self, entry_id: str, user_id: str) -> Dict:
        """Delete a knowledge base entry."""
        return self._make_request(
            "DELETE", 
            f"/v1/training/knowledge-base/{entry_id}", 
            user_id=user_id
        )

# Helper function to create and initialize the Sensay client
def get_sensay_client():
    """Create and return a configured Sensay API client."""
    api_key = os.environ.get("SENSAY_API_KEY")
    return SensayAPI(api_key=api_key) 