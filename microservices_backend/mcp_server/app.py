"""
MCP Server: Handles incoming study plan requests, uses Gemini to generate topics, and triggers video fetching via Kafka.
"""
from flask import Flask, request, jsonify
from common.kafka_utils import get_kafka_producer
from common.config import GEMINI_API_KEY
import json

app = Flask(__name__)
producer = get_kafka_producer()

from common.gemini_utils import call_gemini

def get_study_topics(subject, target_time, target_days):
    prompt = f"List the key subtopics to learn for {subject} in {target_time} hours over {target_days} days. Respond as a Python list of strings."
    topics_str = call_gemini(prompt)
    return eval(topics_str)  # Caution: Use a safer parser in production!

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
