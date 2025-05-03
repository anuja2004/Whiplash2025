"""
Material Generator Service: HTTP microservice to generate study material/notes for each topic using Gemini.
"""
from flask import Flask, request, jsonify
from common.gemini_utils import call_gemini
import json
import re

app = Flask(__name__)

STUDY_PLAN_PROMPT = (
    "You are a study planner assistant. Given a topic, number of days, start date, and daily hours, "
    "distribute the key subtopics to study for the topic, assigning each day a subtopic. "
    "Respond ONLY as a JSON object mapping dates (YYYY-MM-DD) to the subtopic(s) to study on that day. "
    "Do not include any explanation or extra text. Example: {\"2025-04-27\": \"Intro to ML\", \"2025-04-28\": \"Supervised Learning\"}"
)

@app.route('/generate_material', methods=['POST'])
def generate_material():
    data = request.json
    topic_name = data.get('topic_name')
    no_of_days = data.get('no_of_days')
    start_date = data.get('start_date')
    daily_hours = data.get('daily_hours')

    # Validate input
    if not all([topic_name, no_of_days, start_date, daily_hours]):
        return jsonify({'error': 'Missing required fields'}), 400

    prompt = (
        f"Topic: {topic_name}. Number of days: {no_of_days}. Start date: {start_date}. Daily hours: {daily_hours}. "
        + STUDY_PLAN_PROMPT
    )
    try:
        plan_str = call_gemini(prompt)
        # Remove Markdown code block formatting if present
        cleaned = re.sub(r'^```(?:json)?\s*|\s*```$', '', plan_str.strip(), flags=re.IGNORECASE | re.MULTILINE).strip()
        plan = json.loads(cleaned)
    except Exception as e:
        return jsonify({'error': str(e), 'gemini_response': plan_str if 'plan_str' in locals() else None}), 500

    response = {
        "daily_hours": daily_hours,
        "no_of_days": no_of_days,
        "start_date": start_date,
        "topic_name": topic_name,
        "plan": plan,
        "status": "Gemini study plan generated"
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5002, debug=True)

def main():
    consumer = get_kafka_consumer('material_generator_group', ['material.generate.request'])
    producer = get_kafka_producer()
    print("[MaterialGenerator] Listening for material generation requests...")
    while True:
        msg = consumer.poll(1.0)
        if msg is None:
            continue
        if msg.error():
            print(f"Consumer error: {msg.error()}")
            continue
        data = json.loads(msg.value().decode('utf-8'))
        subject = data['subject']
        topics = data['topics']
        materials = []
        for topic in topics:
            note = generate_study_material(topic)
            materials.append({'topic': topic, 'notes': note})
        response = {
            'subject': subject,
            'materials': materials
        }
        producer.produce('material.generate.response', json.dumps(response).encode('utf-8'))
        producer.flush()
        print(f"[MaterialGenerator] Published notes for subject: {subject}")

if __name__ == '__main__':
    main()
