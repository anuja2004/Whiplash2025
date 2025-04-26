"""
Quiz Generator Service: Consumes quiz.generate.request, generates quizzes/assignments for each topic, and publishes to quiz.generate.response.
"""
from confluent_kafka import Consumer, Producer
import json
import time
from common.config import GEMINI_API_KEY, KAFKA_BOOTSTRAP_SERVERS
from common.kafka_utils import get_kafka_consumer, get_kafka_producer

# Mock Gemini API call for quiz (replace with real API call)
def generate_quiz(topic):
    return [{
        'question': f"Sample question for {topic} (mocked)",
        'options': ["A", "B", "C", "D"],
        'answer': "A"
    }]

def main():
    consumer = get_kafka_consumer('quiz_generator_group', ['quiz.generate.request'])
    producer = get_kafka_producer()
    print("[QuizGenerator] Listening for quiz generation requests...")
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
        quizzes = []
        for topic in topics:
            quiz = generate_quiz(topic)
            quizzes.append({'topic': topic, 'quiz': quiz})
        response = {
            'subject': subject,
            'quizzes': quizzes
        }
        producer.produce('quiz.generate.response', json.dumps(response).encode('utf-8'))
        producer.flush()
        print(f"[QuizGenerator] Published quizzes for subject: {subject}")

if __name__ == '__main__':
    main()
