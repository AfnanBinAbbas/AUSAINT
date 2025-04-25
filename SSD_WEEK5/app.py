# app.py - Main Flask Application

from flask import Flask, request, jsonify, session, send_file
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import os
import logging
from datetime import datetime, timedelta
import json
import requests
from bs4 import BeautifulSoup
import subprocess
import ipinfo
import whois
import re
from werkzeug.utils import secure_filename
import exiftool
from functools import wraps
import threading
import time
import io
import csv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("app.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'change_this_to_a_secure_random_key')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:postgres@localhost/osint_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'change_this_to_a_secure_jwt_key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize extensions
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Initialize API clients
ipinfo_handler = ipinfo.getHandler(os.environ.get('IPINFO_TOKEN', None))

# Rate limiting
class RateLimiter:
    def __init__(self, max_requests, time_window):
        self.max_requests = max_requests
        self.time_window = time_window  # in seconds
        self.requests = {}
        self.cleanup_thread = threading.Thread(target=self._cleanup_expired, daemon=True)
        self.cleanup_thread.start()
    
    def _cleanup_expired(self):
        while True:
            current_time = time.time()
            to_delete = []
            for ip, requests in self.requests.items():
                self.requests[ip] = [req for req in requests if current_time - req < self.time_window]
                if not self.requests[ip]:
                    to_delete.append(ip)
            
            for ip in to_delete:
                del self.requests[ip]
            
            time.sleep(60)  # Cleanup every minute
    
    def is_rate_limited(self, ip):
        current_time = time.time()
        if ip not in self.requests:
            self.requests[ip] = []
        
        self.requests[ip] = [req for req in self.requests[ip] if current_time - req < self.time_window]
        
        if len(self.requests[ip]) >= self.max_requests:
            return True
        
        self.requests[ip].append(current_time)
        return False

# Create rate limiters for different endpoints
api_limiter = RateLimiter(100, 3600)  # 100 requests per hour
login_limiter = RateLimiter(10, 300)  # 10 login attempts per 5 minutes

# Role-based access decorators
def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role != 'admin':
            return jsonify({"msg": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

def analyst_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        if not user or user.role not in ['admin', 'analyst']:
            return jsonify({"msg": "Analyst access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(20), default='user')  # 'user', 'analyst', 'admin'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    logs = db.relationship('ActivityLog', backref='user', lazy=True)
    reports = db.relationship('Report', backref='creator', lazy=True)

    def __repr__(self):
        return f'<User {self.username}>'

class ActivityLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    action = db.Column(db.String(100), nullable=False)
    target = db.Column(db.String(200))
    details = db.Column(db.Text)
    ip_address = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f'<ActivityLog {self.action} by User {self.user_id}>'

class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Report {self.title}>'

class SearchHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    search_type = db.Column(db.String(50), nullable=False)  # 'username', 'email', 'phone', 'ip', 'domain'
    query = db.Column(db.String(200), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<SearchHistory {self.search_type}: {self.query}>'

# Helper functions
def log_activity(user_id, action, target=None, details=None, ip_address=None):
    log = ActivityLog(
        user_id=user_id,
        action=action,
        target=target,
        details=details,
        ip_address=ip_address
    )
    db.session.add(log)
    db.session.commit()
    logger.info(f"Activity logged: User {user_id} performed {action} on {target}")

def add_to_search_history(user_id, search_type, query):
    """Add a search to the user's search history"""
    history = SearchHistory(
        user_id=user_id,
        search_type=search_type,
        query=query
    )
    db.session.add(history)
    db.session.commit()

def input_validation(data, required_fields, string_fields=None, numeric_fields=None):
    """Validate input data for required fields and data types"""
    # Check required fields
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"
    
    # Validate string fields
    if string_fields:
        for field in string_fields:
            if field in data and not isinstance(data[field], str):
                return False, f"Field {field} must be a string"
    
    # Validate numeric fields
    if numeric_fields:
        for field in numeric_fields:
            if field in data:
                try:
                    float(data[field])
                except (ValueError, TypeError):
                    return False, f"Field {field} must be a number"
    
    return True, "Validation successful"

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    if api_limiter.is_rate_limited(request.remote_addr):
        return jsonify({"error": "Rate limit exceeded"}), 429
    
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['username', 'email', 'password'],
        string_fields=['username', 'email', 'password']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    # Username and email validation
    if not re.match(r'^[a-zA-Z0-9_]{3,20}$', data['username']):
        return jsonify({"error": "Invalid username format"}), 400
    
    if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', data['email']):
        return jsonify({"error": "Invalid email format"}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 409
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 409
    
    # Create new user with hashed password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        username=data['username'],
        email=data['email'],
        password=hashed_password,
        role='user'  # Default role
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    logger.info(f"New user registered: {data['username']}")
    
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    if login_limiter.is_rate_limited(request.remote_addr):
        return jsonify({"error": "Too many login attempts, please try again later"}), 429
    
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['username', 'password'],
        string_fields=['username', 'password']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    # Find user by username
    user = User.query.filter_by(username=data['username']).first()
    
    # Check if user exists and password is correct
    if user and bcrypt.check_password_hash(user.password, data['password']):
        # Update last login time
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=user.id)
        
        # Log activity
        log_activity(
            user_id=user.id, 
            action="login", 
            ip_address=request.remote_addr
        )
        
        return jsonify({
            "message": "Login successful",
            "access_token": access_token,
            "user": {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "role": user.role
            }
        }), 200
    
    return jsonify({"error": "Invalid username or password"}), 401

@app.route('/api/user/profile', methods=['GET'])
@jwt_required()
def user_profile():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at,
        "last_login": user.last_login
    }), 200

@app.route('/api/user/search-history', methods=['GET'])
@jwt_required()
def get_search_history():
    current_user_id = get_jwt_identity()
    history = SearchHistory.query.filter_by(user_id=current_user_id).order_by(SearchHistory.timestamp.desc()).limit(20).all()
    
    result = []
    for item in history:
        result.append({
            "id": item.id,
            "search_type": item.search_type,
            "query": item.query,
            "timestamp": item.timestamp
        })
    
    return jsonify(result), 200

@app.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    users = User.query.all()
    result = []
    
    for user in users:
        result.append({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at,
            "last_login": user.last_login
        })
    
    return jsonify(result), 200

@app.route('/api/admin/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    data = request.get_json()
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Only allow updating role
    if 'role' in data and data['role'] in ['user', 'analyst', 'admin']:
        user.role = data['role']
        db.session.commit()
        
        current_user_id = get_jwt_identity()
        log_activity(
            user_id=current_user_id,
            action="update_user_role",
            target=f"user:{user_id}",
            details=f"Changed role to {data['role']}",
            ip_address=request.remote_addr
        )
        
        return jsonify({"message": "User updated successfully"}), 200
    
    return jsonify({"error": "Invalid or missing data"}), 400

@app.route('/api/admin/users/<int:user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Don't allow deleting yourself
    current_user_id = get_jwt_identity()
    if user_id == current_user_id:
        return jsonify({"error": "You cannot delete your own account"}), 400
    
    # Log the activity before deleting the user
    log_activity(
        user_id=current_user_id,
        action="delete_user",
        target=f"user:{user_id}",
        details=f"Deleted user {user.username}",
        ip_address=request.remote_addr
    )
    
    # Delete associated data
    ActivityLog.query.filter_by(user_id=user_id).delete()
    SearchHistory.query.filter_by(user_id=user_id).delete()
    Report.query.filter_by(created_by=user_id).delete()
    
    # Delete the user
    db.session.delete(user)
    db.session.commit()
    
    return jsonify({"message": "User deleted successfully"}), 200

@app.route('/api/admin/logs', methods=['GET'])
@admin_required
def get_all_logs():
    logs = ActivityLog.query.order_by(ActivityLog.timestamp.desc()).limit(100).all()
    result = []
    
    for log in logs:
        result.append({
            "id": log.id,
            "user_id": log.user_id,
            "username": User.query.get(log.user_id).username if User.query.get(log.user_id) else "Unknown",
            "action": log.action,
            "target": log.target,
            "details": log.details,
            "ip_address": log.ip_address,
            "timestamp": log.timestamp
        })
    
    return jsonify(result), 200

@app.route('/api/admin/stats', methods=['GET'])
@admin_required
def get_admin_stats():
    # Get basic stats for admin dashboard
    user_count = User.query.count()
    report_count = Report.query.count()
    search_count = SearchHistory.query.count()
    
    # Get stats by search type
    search_types = db.session.query(
        SearchHistory.search_type, 
        db.func.count(SearchHistory.id)
    ).group_by(SearchHistory.search_type).all()
    
    search_type_stats = {search_type: count for search_type, count in search_types}
    
    # Get new users in last 7 days
    one_week_ago = datetime.utcnow() - timedelta(days=7)
    new_users = User.query.filter(User.created_at >= one_week_ago).count()
    
    # Get active users in last 7 days
    active_users = User.query.filter(User.last_login >= one_week_ago).count()
    
    return jsonify({
        "user_count": user_count,
        "report_count": report_count,
        "search_count": search_count,
        "search_type_stats": search_type_stats,
        "new_users_last_week": new_users,
        "active_users_last_week": active_users
    }), 200

# OSINT Endpoints
@app.route('/api/osint/username', methods=['POST'])
@jwt_required()
def username_lookup():
    if api_limiter.is_rate_limited(request.remote_addr):
        return jsonify({"error": "Rate limit exceeded"}), 429
    
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['username'],
        string_fields=['username']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    username = data['username']
    current_user_id = get_jwt_identity()
    
    # Add to search history
    add_to_search_history(current_user_id, 'username', username)
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="username_lookup",
        target=username,
        ip_address=request.remote_addr
    )
    
    # This would normally call Sherlock via subprocess
    # For this implementation, we'll return a mock response
    # In a real implementation, you would run:
    # result = subprocess.run(['python3', 'sherlock', username, '--timeout', '10', '--print-found', '--json'], capture_output=True)
    
    # Mock response for demo purposes
    mock_results = {
        "Twitter": f"https://twitter.com/{username}",
        "Instagram": f"https://instagram.com/{username}",
        "GitHub": f"https://github.com/{username}",
        "LinkedIn": f"https://linkedin.com/in/{username}",
        "Reddit": f"https://reddit.com/user/{username}",
        "Facebook": f"https://facebook.com/{username}",
        "YouTube": f"https://youtube.com/user/{username}",
        "TikTok": f"https://tiktok.com/@{username}",
        "Pinterest": f"https://pinterest.com/{username}",
        "Medium": f"https://medium.com/@{username}"
    }
    
    return jsonify({
        "username": username,
        "results": mock_results
    }), 200

@app.route('/api/osint/ip', methods=['POST'])
@jwt_required()
def ip_lookup():
    if api_limiter.is_rate_limited(request.remote_addr):
        return jsonify({"error": "Rate limit exceeded"}), 429
    
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['ip'],
        string_fields=['ip']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    ip = data['ip']
    
    # Validate IP format
    if not re.match(r'^(\d{1,3}\.){3}\d{1,3}$', ip):
        return jsonify({"error": "Invalid IP address format"}), 400
    
    current_user_id = get_jwt_identity()
    
    # Add to search history
    add_to_search_history(current_user_id, 'ip', ip)
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="ip_lookup",
        target=ip,
        ip_address=request.remote_addr
    )
    
    try:
        # Use ipinfo.io API
        details = ipinfo_handler.getDetails(ip)
        
        return jsonify({
            "ip": ip,
            "city": details.city,
            "region": details.region,
            "country": details.country,
            "location": details.loc,
            "org": details.org,
            "postal": details.postal,
            "timezone": details.timezone
        }), 200
    except Exception as e:
        logger.error(f"Error in IP lookup: {str(e)}")
        return jsonify({"error": "Failed to retrieve IP information"}), 500

@app.route('/api/osint/domain', methods=['POST'])
@jwt_required()
def domain_lookup():
    if api_limiter.is_rate_limited(request.remote_addr):
        return jsonify({"error": "Rate limit exceeded"}), 429
    
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['domain'],
        string_fields=['domain']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    domain = data['domain']
    
    # Validate domain format
    if not re.match(r'^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$', domain):
        return jsonify({"error": "Invalid domain format"}), 400
    
    current_user_id = get_jwt_identity()
    
    # Add to search history
    add_to_search_history(current_user_id, 'domain', domain)
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="domain_lookup",
        target=domain,
        ip_address=request.remote_addr
    )
    
    try:
        # Use python-whois library
        w = whois.whois(domain)
        
        # Extract relevant information
        result = {
            "domain": domain,
            "registrar": w.registrar,
            "creation_date": w.creation_date,
            "expiration_date": w.expiration_date,
            "updated_date": w.updated_date,
            "name_servers": w.name_servers,
            "status": w.status,
            "emails": w.emails,
            "dnssec": w.dnssec,
            "country": w.country,
            "state": w.state,
            "city": w.city
        }
        
        # For datetime objects, convert to string
        for key, value in result.items():
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, list) and value and isinstance(value[0], datetime):
                result[key] = [d.isoformat() for d in value]
        
        return jsonify(result), 200
    except Exception as e:
        logger.error(f"Error in domain lookup: {str(e)}")
        return jsonify({"error": "Failed to retrieve domain information"}), 500

@app.route('/api/osint/email', methods=['POST'])
@jwt_required()
def email_lookup():
    if api_limiter.is_rate_limited(request.remote_addr):
        return jsonify({"error": "Rate limit exceeded"}), 429
    
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['email'],
        string_fields=['email']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    email = data['email']
    
    # Validate email format
    if not re.match(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$', email):
        return jsonify({"error": "Invalid email format"}), 400
    
    current_user_id = get_jwt_identity()
    
    # Add to search history
    add_to_search_history(current_user_id, 'email', email)
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="email_lookup",
        target=email,
        ip_address=request.remote_addr
    )
    
    # This would normally use Hunter.io API
    # For this implementation, we'll return a mock response
    
    # Mock response for demo purposes
    mock_results = {
        "email": email,
        "valid": True,
        "disposable": False,
        "webmail": True,
        "mx_records": True,
        "smtp_check": True,
        "breaches": ["LinkedIn 2021", "Adobe 2013"]
    }
    
    return jsonify(mock_results), 200

@app.route('/api/osint/phone', methods=['POST'])
@jwt_required()
def phone_lookup():
    if api_limiter.is_rate_limited(request.remote_addr):
        return jsonify({"error": "Rate limit exceeded"}), 429
    
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['phone'],
        string_fields=['phone']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    phone = data['phone']
    
    current_user_id = get_jwt_identity()
    
    # Add to search history
    add_to_search_history(current_user_id, 'phone', phone)
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="phone_lookup",
        target=phone,
        ip_address=request.remote_addr
    )
    
    # This would normally use PhoneInfoga
    # For this implementation, we'll return a mock response
    
    # Mock response for demo purposes
    mock_results = {
        "phone": phone,
        "country": "United States",
        "carrier": "Verizon",
        "line_type": "Mobile",
        "valid": True,
        "possible_formats": ["+1 XXX-XXX-XXXX", "(XXX) XXX-XXXX"]
    }
    
    return jsonify(mock_results), 200

@app.route('/api/osint/image', methods=['POST'])
@jwt_required()
def image_analysis():
    if api_limiter.is_rate_limited(request.remote_addr):
        return jsonify({"error": "Rate limit exceeded"}), 429
    
    # Check if file is present in request
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    
    # Check if filename is empty
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Check if file is an allowed type
    allowed_extensions = {'jpg', 'jpeg', 'png', 'gif', 'tiff'}
    if '.' not in file.filename or file.filename.rsplit('.', 1)[1].lower() not in allowed_extensions:
        return jsonify({"error": "Invalid file type"}), 400
    
    current_user_id = get_jwt_identity()
    
    # Save file with secure filename
    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(file_path)
    
    # Add to search history
    add_to_search_history(current_user_id, 'image', filename)
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="image_analysis",
        target=filename,
        ip_address=request.remote_addr
    )
    
    try:
        # Extract EXIF data using exiftool
        with exiftool.ExifTool() as et:
            metadata = et.get_metadata(file_path)
        
        # Extract GPS coordinates if available
        lat = None
        lon = None
        
        if 'EXIF:GPSLatitude' in metadata and 'EXIF:GPSLongitude' in metadata:
            lat = metadata['EXIF:GPSLatitude']
            lon = metadata['EXIF:GPSLongitude']
        
        # Get other relevant metadata
        result = {
            "filename": filename,
            "make": metadata.get('EXIF:Make'),
            "model": metadata.get('EXIF:Model'),
            "date_taken": metadata.get('EXIF:DateTimeOriginal'),
            "gps_coordinates": {"latitude": lat, "longitude": lon} if lat and lon else None,
            "software": metadata.get('EXIF:Software'),
            "size": {
                "width": metadata.get('EXIF:ImageWidth'),
                "height": metadata.get('EXIF:ImageHeight')
            }
        }
        
        # Clean up - remove uploaded file
        os.remove(file_path)
        
        return jsonify(result), 200
    except Exception as e:
        # Clean up in case of error
        if os.path.exists(file_path):
            os.remove(file_path)
        
        logger.error(f"Error in image analysis: {str(e)}")
        return jsonify({"error": "Failed to analyze image"}), 500

@app.route('/api/osint/webscrape', methods=['POST'])
@jwt_required()
def web_scrape():
    if api_limiter.is_rate_limited(request.remote_addr):
        return jsonify({"error": "Rate limit exceeded"}), 429
    
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['url'],
        string_fields=['url']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    url = data['url']
    
    # Validate URL format
    if not re.match(r'^https?://(?:[-\w.]|(?:%[\da-fA-F]{2}))+', url):
        return jsonify({"error": "Invalid URL format"}), 400
    
    current_user_id = get_jwt_identity()
    
    # Add to search history
    add_to_search_history(current_user_id, 'webscrape', url)
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="web_scrape",
        target=url,
        ip_address=request.remote_addr
    )
    
    try:
        # Simple web scraping with requests and BeautifulSoup
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Extract basic information
        title = soup.title.string if soup.title else "No title found"
        
        # Extract links
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.text.strip()
            if href and text and not href.startswith('#') and not href.startswith('javascript:'):
                links.append({
                    "href": href,
                    "text": text[:100] if text else "No text"  # Limit text length
                })
        
        # Extract meta tags
        meta_tags = {}
        for meta in soup.find_all('meta'):
            if meta.get('name'):
                meta_tags[meta.get('name')] = meta.get('content', '')
            elif meta.get('property'):
                meta_tags[meta.get('property')] = meta.get('content', '')
        
        # Extract images
        images = []
        for img in soup.find_all('img', src=True):
            src = img['src']
            alt = img.get('alt', 'No description')
            images.append({
                "src": src,
                "alt": alt
            })
        
        # Limit the number of items to return
        return jsonify({
            "url": url,
            "title": title,
            "meta_tags": meta_tags,
            "links": links[:50],  # Limit to 50 links
            "images": images[:20]  # Limit to 20 images
        }), 200
    
    except requests.exceptions.RequestException as e:
        logger.error(f"Error in web scraping: {str(e)}")
        return jsonify({"error": "Failed to access URL"}), 500
    except Exception as e:
        logger.error(f"Error in web scraping: {str(e)}")
        return jsonify({"error": "Failed to scrape website"}), 500

@app.route('/api/reports', methods=['POST'])
@jwt_required()
def create_report():
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['title', 'content'],
        string_fields=['title', 'content']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    current_user_id = get_jwt_identity()
    
    new_report = Report(
        title=data['title'],
        content=data['content'],
        created_by=current_user_id
    )
    
    db.session.add(new_report)
    db.session.commit()
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="create_report",
        target=f"report:{new_report.id}",
        ip_address=request.remote_addr
    )
    
    return jsonify({
        "id": new_report.id,
        "title": new_report.title,
        "created_at": new_report.created_at
    }), 201

@app.route('/api/reports', methods=['GET'])
@jwt_required()
def get_user_reports():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    # Admins can see all reports, others only see their own
    if user.role == 'admin':
        reports = Report.query.all()
    else:
        reports = Report.query.filter_by(created_by=current_user_id).all()
    
    result = []
    for report in reports:
        creator = User.query.get(report.created_by)
        result.append({
            "id": report.id,
            "title": report.title,
            "created_by": report.created_by,
            "creator_username": creator.username if creator else "Unknown",
            "created_at": report.created_at,
            "updated_at": report.updated_at
        })
    
    return jsonify(result), 200

@app.route('/api/reports/<int:report_id>', methods=['GET'])
@jwt_required()
def get_report(report_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    report = Report.query.get(report_id)
    
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    # Check if user is allowed to access the report
    if user.role != 'admin' and report.created_by != current_user_id:
        return jsonify({"error": "Access denied"}), 403
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="view_report",
        target=f"report:{report_id}",
        ip_address=request.remote_addr
    )
    
    creator = User.query.get(report.created_by)
    
    return jsonify({
        "id": report.id,
        "title": report.title,
        "content": report.content,
        "created_by": report.created_by,
        "creator_username": creator.username if creator else "Unknown",
        "created_at": report.created_at,
        "updated_at": report.updated_at
    }), 200

@app.route('/api/reports/<int:report_id>', methods=['PUT'])
@jwt_required()
def update_report(report_id):
    data = request.get_json()
    
    # Input validation
    valid, message = input_validation(
        data, 
        required_fields=['title', 'content'],
        string_fields=['title', 'content']
    )
    
    if not valid:
        return jsonify({"error": message}), 400
    
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    report = Report.query.get(report_id)
    
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    # Check if user is allowed to update the report
    if user.role != 'admin' and report.created_by != current_user_id:
        return jsonify({"error": "Access denied"}), 403
    
    report.title = data['title']
    report.content = data['content']
    report.updated_at = datetime.utcnow()
    
    db.session.commit()
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="update_report",
        target=f"report:{report_id}",
        ip_address=request.remote_addr
    )
    
    return jsonify({
        "id": report.id,
        "title": report.title,
        "updated_at": report.updated_at
    }), 200

@app.route('/api/reports/<int:report_id>', methods=['DELETE'])
@jwt_required()
def delete_report(report_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    report = Report.query.get(report_id)
    
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    # Check if user is allowed to delete the report
    if user.role != 'admin' and report.created_by != current_user_id:
        return jsonify({"error": "Access denied"}), 403
    
    # Log the activity before deleting the report
    log_activity(
        user_id=current_user_id,
        action="delete_report",
        target=f"report:{report_id}",
        details=f"Deleted report: {report.title}",
        ip_address=request.remote_addr
    )
    
    db.session.delete(report)
    db.session.commit()
    
    return jsonify({"message": "Report deleted successfully"}), 200

@app.route('/api/reports/export/<int:report_id>', methods=['GET'])
@jwt_required()
def export_report(report_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    report = Report.query.get(report_id)
    
    if not report:
        return jsonify({"error": "Report not found"}), 404
    
    # Check if user is allowed to access the report
    if user.role != 'admin' and report.created_by != current_user_id:
        return jsonify({"error": "Access denied"}), 403
    
    # Log the activity
    log_activity(
        user_id=current_user_id,
        action="export_report",
        target=f"report:{report_id}",
        ip_address=request.remote_addr
    )
    
    creator = User.query.get(report.created_by)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow(['Field', 'Value'])
    
    # Write data
    writer.writerow(['Report ID', report.id])
    writer.writerow(['Title', report.title])
    writer.writerow(['Creator', creator.username if creator else "Unknown"])
    writer.writerow(['Created Date', report.created_at])
    writer.writerow(['Last Updated', report.updated_at])
    writer.writerow(['Content', report.content])
    
    # Prepare output
    output.seek(0)
    
    return send_file(
        io.BytesIO(output.getvalue().encode('utf-8')),
        mimetype='text/csv',
        as_attachment=True,
        attachment_filename=f'report_{report.id}_{datetime.now().strftime("%Y%m%d")}.csv'
    )

# Main execution and database creation
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        
        # Create admin user if no users exist
        if User.query.count() == 0:
            admin_password = os.environ.get('ADMIN_PASSWORD', 'admin123')
            hashed_password = bcrypt.generate_password_hash(admin_password).decode('utf-8')
            
            admin_user = User(
                username='admin',
                email='admin@example.com',
                password=hashed_password,
                role='admin'
            )
            
            db.session.add(admin_user)
            db.session.commit()
            
            logger.info("Admin user created")
    
    app.run(host='0.0.0.0', port=5000, debug=True)