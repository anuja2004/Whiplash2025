from flask import Flask, request, g
from flask_cors import CORS
import os
import time
import logging

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Create upload/results dirs if not exist
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("results", exist_ok=True)

    # Morgan-like request logging
    @app.before_request
    def start_timer():
        g.start = time.time()

    @app.after_request
    def log_request(response):
        duration = time.time() - g.start
        log_params = {
            'method': request.method,
            'path': request.path,
            'status': response.status_code,
            'duration_ms': int(duration * 1000),
            'ip': request.remote_addr,
        }
        logging.info(f"{log_params['method']} {log_params['path']} {log_params['status']} {log_params['duration_ms']}ms from {log_params['ip']}")
        return response

    from .routes import bp as api_bp
    app.register_blueprint(api_bp)

    return app
