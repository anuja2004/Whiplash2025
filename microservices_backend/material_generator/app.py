"""
Material Generator Service: Consumes material.generate.request, generates study material/notes for each topic, and publishes to material.generate.response.
"""
from confluent_kafka import Consumer, Producer
import json
import time
from common.config import GEMINI_API_KEY, KAFKA_BOOTSTRAP_SERVERS
from common.kafka_utils import get_kafka_consumer, get_kafka_producer

from common.gemini_utils import call_gemini

def generate_study_material(topic):
    prompt = f"Write concise study notes for the topic: {topic}."
    return call_gemini(prompt)

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
