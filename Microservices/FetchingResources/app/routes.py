from flask import Blueprint, request, jsonify, send_file, render_template_string
from .services import (
    extract_text_from_image, search_youtube, download_audio, convert_audio_to_wav,
    transcribe_audio, generate_content, generate_pdf, process_topics_full
)
import os
import socket
import time
from datetime import datetime

bp = Blueprint('api', __name__)

# Track service start time
SERVICE_START = time.time()

@bp.route('/health')
@bp.route('/heath')
def health_check():
    uptime = int(time.time() - SERVICE_START)
    hostname = socket.gethostname()
    ip = socket.gethostbyname(hostname)
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    env = os.environ.get('FLASK_ENV', 'development')
    status = {
        'status': 'ok',
        'service': 'FetchingResources Microservice',
        'uptime_seconds': uptime,
        'hostname': hostname,
        'ip': ip,
        'current_time': now,
        'environment': env
    }
    if 'application/json' in request.headers.get('Accept', ''):
        return jsonify(status)
    # HTML template
    html = f"""
    <html><head><title>Service Health</title>
    <style>body{{font-family:sans-serif;background:#f9f9f9;margin:30px;}}.card{{background:#fff;padding:20px;border-radius:8px;box-shadow:0 2px 8px #0001;max-width:400px;margin:auto;}}</style>
    </head><body><div class='card'>
    <h2>✅ FetchingResources Microservice</h2>
    <ul style='list-style:none;padding:0;'>
        <li><b>Status:</b> <span style='color:green;'>OK</span></li>
        <li><b>Uptime:</b> {uptime} seconds</li>
        <li><b>Host:</b> {hostname} ({ip})</li>
        <li><b>Current Time:</b> {now}</li>
        <li><b>Environment:</b> {env}</li>
    </ul>
    </div></body></html>
    """
    return render_template_string(html)

@bp.route('/process_image', methods=['POST'])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image = request.files['image']
    filename = os.path.join('uploads', image.filename)
    image.save(filename)
    topics = extract_text_from_image(filename)
    return jsonify({'topics': topics, 'image_path': filename})

@bp.route('/process_topics', methods=['POST'])
def process_topics():
    data = request.get_json()
    image_path = data.get('image_path')
    job_id = data.get('job_id')
    if not image_path or not job_id:
        return jsonify({'error': 'Missing image_path or job_id'}), 400
    result = process_topics_full(image_path, job_id)
    return jsonify(result)

@bp.route('/status/<job_id>', methods=['GET'])
def get_status(job_id):
    # Dummy status for now
    return jsonify({'job_id': job_id, 'status': 'complete'})

@bp.route('/download/<job_id>/<filename>', methods=['GET'])
def download_file(job_id, filename):
    filepath = os.path.join('results', job_id, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(filepath, as_attachment=True)
