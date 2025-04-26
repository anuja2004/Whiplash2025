"""
Quiz Generator Service: Consumes quiz.generate.request, generates quizzes/assignments for each topic, and publishes to quiz.generate.response.
"""
from confluent_kafka import Consumer, Producer
import json
import time
from common.config import GEMINI_API_KEY, KAFKA_BOOTSTRAP_SERVERS
from common.kafka_utils import get_kafka_consumer, get_kafka_producer

from common.gemini_utils import call_gemini

def generate_quiz(topic):
    prompt = f"Generate a multiple-choice quiz question for the topic: {topic}. Respond as a Python list of dicts with keys 'question', 'options', 'answer'."
    quiz_str = call_gemini(prompt)
    return eval(quiz_str)  # Caution: Use a safer parser in production!

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
