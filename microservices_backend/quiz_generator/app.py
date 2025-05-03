from flask import Flask, request, jsonify
from common.gemini_utils import call_gemini
import json
import re
import requests
import time
from dotenv import load_dotenv
import os

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in environment variables")

app = Flask(__name__)

@app.route('/generate_quiz_and_assignments', methods=['POST'])
def generate_quiz_and_assignments():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
            
        required_fields = ['subtopic', 'youtube_link', 'study_notes']
        missing = [field for field in required_fields if field not in data]
        if missing:
            return jsonify({'error': f'Missing required fields: {missing}'}), 400

        timestamp = data.get('timestamp', '00:00:00-full')
        subtopic = data['subtopic']
        youtube_link = data['youtube_link']
        study_notes = data['study_notes']

        # Prompt for MCQ quiz
        quiz_prompt = (
            f"Generate 5 multiple-choice questions about {subtopic} based on these notes: {study_notes}\n"
            "Format as JSON with keys: 'question', 'options' (array), 'answer'"
        )

        # Prompt for theory assignments
        assignment_prompt = (
            f"Generate 5 open-ended questions about {subtopic} based on: {study_notes}\n"
            "Return as JSON array of strings"
        )

        quiz_str = call_gemini(quiz_prompt)
        assignment_str = call_gemini(assignment_prompt)

        # Clean and parse responses
        quiz_clean = re.sub(r'^```(?:json)?\s*|\s*```$', '', quiz_str.strip(), flags=re.IGNORECASE)
        assignment_clean = re.sub(r'^```(?:json)?\s*|\s*```$', '', assignment_str.strip(), flags=re.IGNORECASE)

        quizzes_raw = json.loads(quiz_clean)
        assignments_raw = json.loads(assignment_clean)

        # Format responses
        quizzes = [{
            'questionText': q['question'],
            'questionType': 'multiple-choice',
            'options': [{'text': opt, 'isCorrect': opt == q['answer']} for opt in q['options']],
            'points': 1
        } for q in quizzes_raw]

        assignments = [{
            'questionText': q,
            'questionType': 'theory',
            'points': 5
        } for q in assignments_raw]

        return jsonify({
            'subtopic': subtopic,
            'timestamp': timestamp,
            'youtube_link': youtube_link,
            'quizzes': quizzes,
            'assignments': assignments
        })

    except Exception as e:
        app.logger.error(f"Error generating quizzes: {str(e)}")
        return jsonify({
            'error': str(e),
            'subtopic': data.get('subtopic', 'unknown'),
            'timestamp': data.get('timestamp', '00:00:00-full'),
            'youtube_link': data.get('youtube_link', ''),
            'quizzes': [],
            'assignments': []
        }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5004, debug=True)