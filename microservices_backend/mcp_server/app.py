"""
MCP Server: Handles incoming study plan requests, uses Gemini to generate topics, and triggers video fetching via Kafka.
"""
from flask import Flask, request, jsonify
import json
from flask_cors import CORS
from common.gemini_utils import call_gemini

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"], supports_credentials=True)

# Improved Gemini prompt for a full study plan distributed by date
STUDY_PLAN_PROMPT = (
    "You are a study planner assistant. Given a topic, number of days, start date, and daily hours, "
    "distribute the key subtopics to study for the topic, assigning each day a subtopic. "
    "Respond ONLY as a JSON object mapping dates (YYYY-MM-DD) to the subtopic(s) to study on that day. "
    "Do not include any explanation or extra text. Example: {\"2025-04-27\": \"Intro to ML\", \"2025-04-28\": \"Supervised Learning\"}"
)

@app.route('/generate_plan', methods=['POST'])
def generate_plan():
    import requests
    import time
    import re
    data = request.json
    print("Received request:", data)
    topic_name = data.get('topic_name')
    no_of_days = data.get('no_of_days')
    start_date = data.get('start_date')
    daily_hours = data.get('daily_hours')

    # 1. Generate study plan with Gemini
    prompt = (
        f"Topic: {topic_name}. Number of days: {no_of_days}. Start date: {start_date}. Daily hours: {daily_hours}. "
        + STUDY_PLAN_PROMPT
    )
    start = time.time()
    try:
        print("Calling Gemini API with prompt:\n", prompt)
        plan_str = call_gemini(prompt)
        print("Gemini API raw response:", repr(plan_str))
        cleaned = re.sub(r'^```(?:json)?\s*|\s*```$', '', plan_str.strip(), flags=re.IGNORECASE | re.MULTILINE).strip()
        print("Cleaned Gemini response:", repr(cleaned))
        try:
            plan = json.loads(cleaned)
        except Exception as e:
            print("Failed to parse cleaned Gemini response:", cleaned)
            return jsonify({"error": f"Failed to parse Gemini response: {e}", "gemini_response": cleaned}), 500
    except Exception as e:
        print(f"Error during Gemini processing after {time.time() - start:.2f}s:", e)
        return jsonify({"error": str(e), "gemini_response": plan_str if 'plan_str' in locals() else None}), 500
    finally:
        print(f"Gemini call took {time.time() - start:.2f} seconds")

    # 2. Call video fetcher service
    try:
        print("Calling Video Fetcher service...")
        video_resp = requests.post(
            'http://localhost:5003/fetch_videos',
            json={
                'topic_name': topic_name,
                'plan': plan,
                'daily_hours': daily_hours,
                'target_days': no_of_days
            }, timeout=30
        )
        video_resp.raise_for_status()
        video_data = video_resp.json()
        plan_with_videos = video_data.get('plan', plan)
    except Exception as e:
        print("Video fetcher service error:", e)
        plan_with_videos = plan

    # 3. Generate notes for each subtopic using Gemini directly (not via material generator)
    enriched_plan = {}
    for date, value in plan_with_videos.items():
        # value can be a string (subtopic), or a dict (already enriched)
        if isinstance(value, dict):
            subtopic = value.get('subtopic') or value.get('name') or ''
            youtube_link = value.get('youtube_link')
            timestamp = value.get('timestamp')
        else:
            subtopic = value
            youtube_link = None
            timestamp = None
        notes = None
        quizzes = []
        assignments = []
        # Only generate notes if we have a subtopic
        if subtopic:
            prompt_parts = [
                "Generate concise study notes (about 150 words) for the following subtopic, focusing ONLY on the segment",
            ]
            if youtube_link and timestamp:
                prompt_parts.append(f"[{timestamp}] of this YouTube video: {youtube_link}. ")
            prompt_parts.append(f"Subtopic: {subtopic}. Respond ONLY with the notes as a string, no extra explanation.")
            notes_prompt = " ".join(prompt_parts)
            notes = None
            for attempt in range(3):
                try:
                    print(f"[Gemini] Attempt {attempt+1} for notes on {subtopic} ({date})")
                    print(f"[Gemini] Prompt: {notes_prompt}")
                    notes_response = call_gemini(notes_prompt)
                    print(f"[Gemini] Response: {notes_response[:120]}{'...' if notes_response and len(notes_response) > 120 else ''}")
                    if notes_response and notes_response.strip() and 'no notes available' not in notes_response.lower():
                        notes = notes_response.strip()
                        break
                except Exception as e:
                    print(f"[Gemini] Error on attempt {attempt+1} for {subtopic} ({date}): {e}")
            if not notes:
                print(f"[Gemini] Failed to generate notes for {subtopic} ({date}) after 3 attempts.")
                notes = 'No notes available.'
        # 4. Call quiz generator service for each subtopic (if possible)
        # Log all fields before quiz/assignment generation
        print(f"[DEBUG] Day: {date}")
        print(f"  subtopic: {repr(subtopic)}")
        print(f"  youtube_link: {repr(youtube_link)}")
        print(f"  timestamp: {repr(timestamp)}")
        print(f"  notes: {repr(notes)[:80]}{'...' if notes and len(notes) > 80 else ''}")
        # Fallback/defaults
        if not youtube_link:
            youtube_link = 'No video found'
        if not timestamp:
            timestamp = 'No timestamp'
        if not notes:
            notes = 'No notes available.'
        # Try to generate quizzes/assignments anyway, but log if any field was originally missing
        missing_fields = []
        if not subtopic: missing_fields.append('subtopic')
        if not youtube_link or youtube_link == 'No video found': missing_fields.append('youtube_link')
        if not timestamp or timestamp == 'No timestamp': missing_fields.append('timestamp')
        if not notes or notes == 'No notes available.': missing_fields.append('notes')
        if missing_fields:
            print(f"[WARN] Attempting quiz/assignment generation for {subtopic} ({date}) with missing: {', '.join(missing_fields)}")
        try:
            print(f"Calling Quiz Generator for {subtopic} ({date})...")
            quiz_resp = requests.post(
                'http://localhost:5004/generate_quiz_and_assignments',
                json={
                    'subtopic': subtopic,
                    'timestamp': timestamp,
                    'youtube_link': youtube_link,
                    'study_notes': notes
                }, timeout=60
            )
            quiz_resp.raise_for_status()
            quiz_data = quiz_resp.json()
            quizzes = quiz_data.get('quizzes', [])
            assignments = quiz_data.get('assignments', [])
        except Exception as e:
            print(f"Quiz generator service error for {subtopic} ({date}):", e)
        # Build enriched entry
        enriched_plan[date] = {
            'subtopic': subtopic,
            'youtube_link': youtube_link,
            'timestamp': timestamp,
            'notes': notes,
            'quizzes': quizzes,
            'assignments': assignments
        }

    response = {
        'status': 'Enriched study plan generated',
        'topic_name': topic_name,
        'no_of_days': no_of_days,
        'start_date': start_date,
        'daily_hours': daily_hours,
        'plan': enriched_plan
    }
    print("Returning enriched response:", response)
    return jsonify(response)


if __name__ == '__main__':
    app.run(port=5001, debug=True)


# {
#     Topic name : 'Topic name',
#     No of Days 
#     Start date
#     Daily Hours 
# }
