from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Create upload/results dirs if not exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("results", exist_ok=True)

    from .routes import bp as api_bp
    app.register_blueprint(api_bp)

    return app
