
import os
import json
from typing import Dict, Any, Optional
import httpx
from supabase.functions import serve

# Security measures
API_KEY = os.environ.get("IPGEOLOCATION_API_KEY")  
MAX_REQUESTS_PER_MINUTE = 10  # Rate limiting
ALLOWED_DOMAINS = ["localhost:3000", "ausaint.com"]  # CORS protection

async def get_ip_information(ip: str) -> Dict[str, Any]:
    """Fetch information about an IP address"""
    if not API_KEY:
        return {"error": "API key not configured"}
    
    url = f"https://api.ipgeolocation.io/ipgeo?apiKey={API_KEY}&ip={ip}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            # Filter sensitive information
            return {
                "ip": data.get("ip"),
                "country_name": data.get("country_name"),
                "city": data.get("city"),
                "isp": data.get("isp"),
                "organization": data.get("organization"),
                "latitude": data.get("latitude"),
                "longitude": data.get("longitude"),
                "timezone": data.get("time_zone", {}).get("name"),
            }
        else:
            return {"error": f"API request failed with status code: {response.status_code}"}

async def get_domain_information(domain: str) -> Dict[str, Any]:
    """Fetch WHOIS information about a domain"""
    if not API_KEY:
        return {"error": "API key not configured"}
    
    # Placeholder for actual WHOIS API call
    # In a real implementation, you would use an API service like WhoisXML API
    
    # For demo purposes only
    return {
        "domain": domain,
        "registrar": "Example Registrar, LLC",
        "createdDate": "2020-01-01",
        "expiryDate": "2025-01-01",
        "nameServers": ["ns1.example.com", "ns2.example.com"],
        "status": "Active"
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
        target = body.get("target")
        target_type = body.get("targetType")
        
        if not target or not target_type:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing required parameters"})}
        
        # Process request based on target type
        if target_type == "ip":
            result = await get_ip_information(target)
        elif target_type == "domain":
            result = await get_domain_information(target)
        else:
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid target type"})}
        
        # Log this action to the audit_logs table
        # In a real implementation, you would use the Supabase client to insert this record
        
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
