
import os
import json
import base64
from typing import Dict, Any
from datetime import datetime
import hashlib
from supabase.functions import serve

# Security measures
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")
ALLOWED_DOMAINS = ["localhost:3000", "ausaint.com"]  # CORS protection

def encrypt_report(data: Dict[str, Any], encryption_key: str) -> str:
    """Simple encryption demo - in production use a proper encryption library"""
    # This is just a placeholder demonstration - DO NOT use this in production
    # In a real application, use a proper encryption library like PyNaCl
    
    if not encryption_key:
        raise ValueError("Encryption key not provided")
    
    # Convert data to JSON string
    json_data = json.dumps(data)
    
    # In a real implementation, use proper encryption
    # This is just a simple encoding for demonstration
    key_hash = hashlib.sha256(encryption_key.encode()).digest()
    encoded = base64.b64encode(json_data.encode()).decode()
    
    return encoded

def generate_pdf_report(data: Dict[str, Any]) -> bytes:
    """Generate a PDF report from the provided data"""
    # In a real implementation, use a PDF generation library
    # For this demo, just return a mock PDF as base64 string
    
    mock_pdf = f"""
    AUSAINT OSINT INTELLIGENCE REPORT
    ===============================
    
    Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
    
    SUMMARY:
    {data.get('title', 'Untitled Report')}
    
    DETAILS:
    {json.dumps(data.get('content', {}), indent=2)}
    """
    
    # In a real implementation, convert to actual PDF
    return base64.b64encode(mock_pdf.encode()).decode()

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
        report_data = body.get("reportData")
        
        if not action or not report_data:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing required parameters"})}
        
        # Add user ID and timestamp to report data
        report_data["user_id"] = user_id
        report_data["generated_at"] = datetime.now().isoformat()
        
        # Process request based on action
        if action == "generate":
            # Generate report without encryption
            pdf_content = generate_pdf_report(report_data)
            result = {
                "reportId": f"report_{base64.b64encode(os.urandom(8)).decode('utf-8')}",
                "content": pdf_content,
                "encrypted": False
            }
        elif action == "encrypt":
            # Generate and encrypt the report
            if not ENCRYPTION_KEY:
                return {"statusCode": 500, "body": json.dumps({"error": "Encryption key not configured"})}
                
            try:
                encrypted_content = encrypt_report(report_data, ENCRYPTION_KEY)
                result = {
                    "reportId": f"secure_{base64.b64encode(os.urandom(8)).decode('utf-8')}",
                    "content": encrypted_content,
                    "encrypted": True
                }
            except Exception as e:
                return {"statusCode": 500, "body": json.dumps({"error": f"Encryption failed: {str(e)}"})}
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
