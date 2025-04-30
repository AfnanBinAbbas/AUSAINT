from flask import Flask
from config import Config
from extensions import db
from routes.auth_routes import auth_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)

    app.register_blueprint(auth_bp, url_prefix="/auth")

    @app.route('/')
    def index():
        return {"message": "API is working"}

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
