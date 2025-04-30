from flask import Blueprint, request, jsonify
import jwt
import os

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    token = request.headers.get("Authorization", "").replace("Bearer ", "")
    if not token:
        return jsonify({"error": "Missing token"}), 400

    try:
        decoded = jwt.decode(token, os.getenv("SUPABASE_JWT_SECRET"), algorithms=["HS256"])
        return jsonify({"message": "Token valid", "user": decoded}), 200
    except jwt.ExpiredSignatureError:
        return jsonify({"error": "Token expired"}), 401
    except jwt.InvalidTokenError as e:
        return jsonify({"error": "Invalid token", "details": str(e)}), 401
