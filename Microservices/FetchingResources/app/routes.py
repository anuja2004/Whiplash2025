from flask import Blueprint, request, jsonify, send_file
from .services import (
    extract_text_from_image, search_youtube, download_audio, convert_audio_to_wav,
    transcribe_audio, generate_content, generate_pdf, process_topics_full
)
import os

bp = Blueprint('api', __name__)

@bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'ok'})

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
