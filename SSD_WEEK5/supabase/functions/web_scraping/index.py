
import os
import json
from typing import Dict, Any, List, Optional
import httpx
import re
from urllib.parse import urlparse
from supabase.functions import serve

# Security measures
MAX_REQUESTS_PER_MINUTE = 3  # Rate limiting - web scraping is resource intensive
ALLOWED_DOMAINS = ["localhost:3000", "ausaint.com"]  # CORS protection
BLACKLISTED_DOMAINS = ["localhost", "127.0.0.1", "0.0.0.0", "internal.net"]  # Prevent SSRF attacks
MAX_URL_LENGTH = 2000  # Prevent buffer overflow attacks

async def validate_url(url: str) -> Optional[str]:
    """Validate URL to prevent SSRF and other attacks"""
    if not url.startswith(('http://', 'https://')):
        return "URL must start with http:// or https://"
    
    if len(url) > MAX_URL_LENGTH:
        return "URL is too long"
    
    try:
        parsed = urlparse(url)
        hostname = parsed.netloc
        
        # Check for internal/reserved addresses
        if any(domain in hostname for domain in BLACKLISTED_DOMAINS):
            return "Access to internal resources is forbidden"
        
        # IP address check would go here in a real implementation
        
        return None  # URL is valid
    except Exception:
        return "Invalid URL format"

async def scrape_website(url: str) -> Dict[str, Any]:
    """Scrape basic information from a website"""
    error = await validate_url(url)
    if error:
        return {"error": error}
    
    headers = {
        "User-Agent": "AUSAINT OSINT Tool/1.0 - Educational Purposes Only"
    }
    
    try:
        async with httpx.AsyncClient(headers=headers, follow_redirects=True) as client:
            response = await client.get(url, timeout=10.0)
            
            if response.status_code != 200:
                return {"error": f"Failed to fetch URL, status code: {response.status_code}"}
            
            # Extract basic information
            content_type = response.headers.get("content-type", "")
            server = response.headers.get("server", "Unknown")
            
            # For HTML content, we could extract title, meta tags, etc.
            # This is a simplified version
            html = response.text
            
            # Very simple title extraction - a real implementation would use HTML parsing
            title_match = re.search(r"<title>(.*?)</title>", html, re.IGNORECASE | re.DOTALL)
            title = title_match.group(1) if title_match else "No title found"
            
            return {
                "url": url,
                "title": title,
                "content_type": content_type,
                "server": server,
                "status_code": response.status_code,
                "response_time_ms": response.elapsed.total_seconds() * 1000,
                "content_length": len(html),
                "headers": dict(response.headers)
            }
    except httpx.TimeoutException:
        return {"error": "Request timed out"}
    except httpx.RequestError as e:
        return {"error": f"Request error: {str(e)}"}
    except Exception as e:
        return {"error": f"An unexpected error occurred: {str(e)}"}

async def find_subdomains(domain: str) -> Dict[str, Any]:
    """Find subdomains for a given domain (simplified demo version)"""
    # In a real implementation, this would use DNS enumeration techniques or services
    # For demo, return static mock data
    
    # Validate domain format
    if not re.match(r"^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$", domain):
        return {"error": "Invalid domain format"}
    
    # Mock data for demo purposes
    subdomains = [
        {"subdomain": f"www.{domain}", "ip": "192.0.2.1", "status": "active"},
        {"subdomain": f"api.{domain}", "ip": "192.0.2.2", "status": "active"},
        {"subdomain": f"blog.{domain}", "ip": "192.0.2.3", "status": "active"},
        {"subdomain": f"mail.{domain}", "ip": "192.0.2.4", "status": "active"},
        {"subdomain": f"dev.{domain}", "ip": "192.0.2.5", "status": "inactive"}
    ]
    
    return {
        "domain": domain,
        "total_found": len(subdomains),
        "subdomains": subdomains
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
        target = body.get("target")
        
        if not action or not target:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing required parameters"})}
        
        # Process request based on action
        if action == "scrape":
            result = await scrape_website(target)
        elif action == "subdomains":
            result = await find_subdomains(target)
        else:
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid action"})}
        
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
