"""
Quiz & Assignment Generator Service: HTTP microservice to generate quizzes (MCQ) and theory assignments using Gemini.
"""
from flask import Flask, request, jsonify
from common.gemini_utils import call_gemini
import json
import re

app = Flask(__name__)

@app.route('/generate_quiz_and_assignments', methods=['POST'])
def generate_quiz_and_assignments():
    data = request.json
    subtopic = data.get('subtopic')
    timestamp = data.get('timestamp')
    youtube_link = data.get('youtube_link')
    study_notes = data.get('study_notes')

    if not all([subtopic, timestamp, youtube_link, study_notes]):
        return jsonify({'error': 'Missing required fields'}), 400

    # Prompt for MCQ quiz
    quiz_prompt = (
        f"Given the following study notes, generate 5 multiple-choice quiz (MCQ) questions with 4 options each and the correct answer marked. "
        f"Respond ONLY as a JSON list of objects with keys: 'question', 'options', 'answer'. "
        f"Study notes: {study_notes}"
    )

    # Prompt for theory assignments
    assignment_prompt = (
        f"Given the following study notes, generate 5 theory assignment questions (open-ended, descriptive). "
        f"Respond ONLY as a JSON list of strings. "
        f"Study notes: {study_notes}"
    )

    try:
        quiz_str = call_gemini(quiz_prompt)
        assignment_str = call_gemini(assignment_prompt)
        # Remove markdown formatting if present
        quiz_clean = re.sub(r'^```(?:json)?\s*|\s*```$', '', quiz_str.strip(), flags=re.IGNORECASE | re.MULTILINE).strip()
        assignment_clean = re.sub(r'^```(?:json)?\s*|\s*```$', '', assignment_str.strip(), flags=re.IGNORECASE | re.MULTILINE).strip()
        quizzes_raw = json.loads(quiz_clean)
        assignments_raw = json.loads(assignment_clean)
        # Format quizzes to desired structure
        quizzes = []
        for q in quizzes_raw:
            options = []
            correct = q['answer'] if 'answer' in q else None
            for opt in q['options']:
                options.append({
                    'text': opt,
                    'isCorrect': (opt == correct)
                })
            quizzes.append({
                'questionText': q['question'],
                'questionType': 'multiple-choice',
                'options': options,
                'points': 1
            })
        # Format assignments
        assignments = []
        for a in assignments_raw:
            assignments.append({
                'questionText': a,
                'questionType': 'theory',
                'points': 5
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

    return jsonify({
        'subtopic': subtopic,
        'timestamp': timestamp,
        'youtube_link': youtube_link,
        'quizzes': quizzes,
        'assignments': assignments
    })

if __name__ == '__main__':
    app.run(port=5004, debug=True)

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
