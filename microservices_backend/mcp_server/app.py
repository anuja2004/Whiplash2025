"""
MCP Server: Handles incoming study plan requests, uses Gemini to generate topics, and triggers video fetching via Kafka.
"""
from flask import Flask, request, jsonify
from common.kafka_utils import get_kafka_producer
from common.config import GEMINI_API_KEY
import json

app = Flask(__name__)
producer = get_kafka_producer()

# Mock Gemini API call (replace with actual Gemini API integration)
def get_study_topics(subject, target_time, target_days):
    # In production, call Gemini API here
    # For now, return static topics
    return [
        "What is ML?",
        "Supervised vs Unsupervised",
        "Linear Regression",
        "Decision Trees"
    ]

@app.route('/generate_plan', methods=['POST'])
def generate_plan():
    data = request.json
    subject = data.get('subject')
    target_time = data.get('target_time')
    target_days = data.get('target_days')

    topics = get_study_topics(subject, target_time, target_days)

    # Send request to video.fetch.request topic
    message = {
        'subject': subject,
        'topics': topics,
        'target_time': target_time,
        'target_days': target_days
    }
    producer.produce('video.fetch.request', json.dumps(message).encode('utf-8'))
    producer.flush()

    return jsonify({
        'status': 'Video fetch triggered',
        'topics': topics
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)
