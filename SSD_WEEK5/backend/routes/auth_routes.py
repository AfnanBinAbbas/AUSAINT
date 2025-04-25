from flask import Blueprint, request, jsonify
from extensions import bcrypt, db
from models.user import User
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    hashed = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    user = User(username=data["username"], password=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User created"}), 201
