# app.py
from flask import Flask
from config import Config
from extensions import db, migrate, bcrypt, jwt
from routes import register_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Register Blueprints
    register_routes(app)

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
