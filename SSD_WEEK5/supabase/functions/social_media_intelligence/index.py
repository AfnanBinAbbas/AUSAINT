
import os
import json
from typing import Dict, Any, List
import httpx
import re
from supabase.functions import serve

# Security measures
API_KEY = os.environ.get("SOCIAL_OSINT_API_KEY")
MAX_REQUESTS_PER_MINUTE = 5  # Rate limiting
ALLOWED_DOMAINS = ["localhost:3000", "ausaint.com"]  # CORS protection

async def search_username(username: str) -> Dict[str, Any]:
    """Search for a username across multiple social platforms"""
    if not API_KEY:
        # For demo purposes, return mock data
        platforms = [
            {"name": "Twitter", "url": f"https://twitter.com/{username}", "exists": True},
            {"name": "Instagram", "url": f"https://instagram.com/{username}", "exists": True},
            {"name": "GitHub", "url": f"https://github.com/{username}", "exists": False},
            {"name": "LinkedIn", "url": f"https://linkedin.com/in/{username}", "exists": True},
            {"name": "Facebook", "url": f"https://facebook.com/{username}", "exists": False}
        ]
        
        return {
            "username": username,
            "platforms_found": 3,
            "platforms": platforms
        }
    
    # In a real implementation, you would use an actual social media OSINT API
    # Example API call:
    # url = f"https://api.example.com/social-search?apikey={API_KEY}&username={username}"
    # async with httpx.AsyncClient() as client:
    #     response = await client.get(url)
    #     if response.status_code == 200:
    #         return response.json()
    
    # For now, return mock data
    platforms = [
        {"name": "Twitter", "url": f"https://twitter.com/{username}", "exists": True},
        {"name": "Instagram", "url": f"https://instagram.com/{username}", "exists": True},
        {"name": "GitHub", "url": f"https://github.com/{username}", "exists": False},
        {"name": "LinkedIn", "url": f"https://linkedin.com/in/{username}", "exists": True},
        {"name": "Facebook", "url": f"https://facebook.com/{username}", "exists": False}
    ]
    
    return {
        "username": username,
        "platforms_found": 3,
        "platforms": platforms
    }

async def analyze_social_profile(platform: str, username: str) -> Dict[str, Any]:
    """Get detailed information about a specific social media profile"""
    if not API_KEY:
        # Mock data for demo purposes
        return {
            "platform": platform,
            "username": username,
            "profile_info": {
                "fullName": "John Doe",
                "bio": "Security researcher and privacy advocate",
                "location": "San Francisco, CA",
                "joinDate": "2018-03-15",
                "followers": 1240,
                "following": 453
            },
            "recent_activity": [
                {"date": "2023-04-20", "type": "post", "content": "Just published a new article on cybersecurity!"},
                {"date": "2023-04-18", "type": "comment", "content": "Great insights on the latest security trends."}
            ]
        }
    
    # In a real implementation, use an actual API
    # Example:
    # url = f"https://api.example.com/profile?apikey={API_KEY}&platform={platform}&username={username}"
    # async with httpx.AsyncClient() as client:
    #     response = await client.get(url)
    #     if response.status_code == 200:
    #         return response.json()
    
    # For now, return mock data
    return {
        "platform": platform,
        "username": username,
        "profile_info": {
            "fullName": "John Doe",
            "bio": "Security researcher and privacy advocate",
            "location": "San Francisco, CA",
            "joinDate": "2018-03-15",
            "followers": 1240,
            "following": 453
        },
        "recent_activity": [
            {"date": "2023-04-20", "type": "post", "content": "Just published a new article on cybersecurity!"},
            {"date": "2023-04-18", "type": "comment", "content": "Great insights on the latest security trends."}
        ]
    }

async def handle_request(req):
    # Check request origin for CORS
    origin = req.headers.get("origin", "")
    if not any(allowed in origin for allowed in ALLOWED_DOMAINS):
        return {"statusCode": 403, "body": json.dumps({"error": "Forbidden"})}
    
    # Get the current user ID from Supabase Auth
    user_id = req.headers.get("x-supabase-auth-user-id")
    if not user_id:
        return {"statusCode": 401, "body": json.dumps({"error": "Unauthorized"})}
    
    # Parse request body
    try:
        body = await req.json()
        action = body.get("action")
        username = body.get("username")
        platform = body.get("platform")
        
        if not action or not username:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing required parameters"})}
        
        # Validate username to prevent injection attacks
        if not re.match(r"^[a-zA-Z0-9._-]+$", username):
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid username format"})}
        
        # Process request based on action
        if action == "search":
            result = await search_username(username)
        elif action == "analyze" and platform:
            result = await analyze_social_profile(platform, username)
        else:
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid action or missing platform"})}
        
        return {
            "statusCode": 200,
            "body": json.dumps({
                "success": True,
                "data": result,
                "user_id": user_id
            })
        }
    except Exception as e:
        return {"statusCode": 500, "body": json.dumps({"error": str(e)})}

serve(handle_request)
