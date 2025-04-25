
import os
import json
from typing import Dict, Any, Optional
import httpx
from supabase.functions import serve

# Security measures
EMAIL_BREACH_API_KEY = os.environ.get("HAVEIBEENPWNED_API_KEY")
PHONE_API_KEY = os.environ.get("NUMVERIFY_API_KEY")
MAX_REQUESTS_PER_MINUTE = 10  # Rate limiting
ALLOWED_DOMAINS = ["localhost:3000", "ausaint.com"]  # CORS protection

async def check_email_breaches(email: str) -> Dict[str, Any]:
    """Check if an email has been involved in known data breaches"""
    if not EMAIL_BREACH_API_KEY:
        return {"error": "API key not configured"}
    
    url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{email}"
    headers = {
        "hibp-api-key": EMAIL_BREACH_API_KEY,
        "user-agent": "AUSAINT-OSINT-Tool"
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        if response.status_code == 200:
            breaches = response.json()
            return {
                "breached": True,
                "breachCount": len(breaches),
                "breaches": [
                    {
                        "name": breach.get("Name"),
                        "domain": breach.get("Domain"),
                        "breachDate": breach.get("BreachDate"),
                        "dataClasses": breach.get("DataClasses")
                    }
                    for breach in breaches
                ]
            }
        elif response.status_code == 404:
            # No breaches found
            return {
                "breached": False,
                "breachCount": 0,
                "breaches": []
            }
        else:
            return {"error": f"API request failed with status code: {response.status_code}"}

async def verify_phone_number(phone: str) -> Dict[str, Any]:
    """Verify and get information about a phone number"""
    if not PHONE_API_KEY:
        return {"error": "API key not configured"}
    
    url = f"http://apilayer.net/api/validate?access_key={PHONE_API_KEY}&number={phone}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        if response.status_code == 200:
            data = response.json()
            if data.get("success", False):
                return {
                    "valid": data.get("valid", False),
                    "countryCode": data.get("country_code"),
                    "countryName": data.get("country_name"),
                    "location": data.get("location"),
                    "carrier": data.get("carrier"),
                    "lineType": data.get("line_type")
                }
            else:
                return {"error": "Phone validation failed"}
        else:
            return {"error": f"API request failed with status code: {response.status_code}"}

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
        if target_type == "email":
            result = await check_email_breaches(target)
        elif target_type == "phone":
            result = await verify_phone_number(target)
        else:
            return {"statusCode": 400, "body": json.dumps({"error": "Invalid target type"})}
        
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
