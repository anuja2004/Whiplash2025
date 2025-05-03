"""
MCP Server: Handles incoming study plan requests, uses Gemini to generate topics, and triggers video fetching via Kafka.
"""
from flask import Flask, request, jsonify
import json
from flask_cors import CORS
from common.gemini_utils import call_gemini
from pymongo import MongoClient
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Connect to MongoDB
mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/WhipLash')
client = MongoClient(mongo_uri)
db = client['WhipLash']
learning_paths_collection = db['learning_paths']

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5175"}})

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
    print("GEMINI_API_KEY:", os.getenv('GEMINI_API_KEY'))
    print("Received request:", data)
    topic_name = data.get('topic_name')
    no_of_days = data.get('no_of_days')
    start_date = data.get('start_date')
    daily_hours = data.get('daily_hours')
     # Validate required fields
    if not all(key in data for key in ['topic_name', 'no_of_days', 'start_date', 'daily_hours']):
        return jsonify({"error": "Missing required fields in request payload"}), 400

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

    # In your MCP Server's generate_plan function (around line where you call video fetcher):

    # In your MCP Server's generate_plan function:

    # 2. Call video fetcher service with enhanced debugging
    try:
        video_fetcher_url = 'http://localhost:5003/fetch_videos'
        print(f"\n=== Attempting to connect to Video Fetcher at {video_fetcher_url} ===")
        
        request_payload = {
            'topic_name': topic_name,
            'plan': plan,
            'daily_hours': daily_hours,
            'target_days': no_of_days
        }
        print("Sending payload:", json.dumps(request_payload, indent=2))
        
        # First try a simple GET to health endpoint to verify connection
        try:
            health_check = requests.get('http://localhost:5003/health', timeout=5)
            print(f"Video Fetcher health status: {health_check.status_code}")
            print("Health response:", health_check.json())
        except Exception as health_err:
            print(f"Health check failed: {str(health_err)}")
        
        # Now make the actual POST request
        video_resp = requests.post(
            video_fetcher_url,
            json=request_payload,
            timeout=30,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Video Fetcher response status: {video_resp.status_code}")
        
        try:
            video_data = video_resp.json()
            print("Video Fetcher response data:", json.dumps(video_data, indent=2))
        except json.JSONDecodeError:
            print("Video Fetcher returned non-JSON response:", video_resp.text)
            raise
        
        video_resp.raise_for_status()
        plan_with_videos = video_data.get('plan', plan)
        
    except requests.exceptions.ConnectionError as e:
        print(f"\n!!! Critical Error: Could not connect to Video Fetcher at {video_fetcher_url}")
        print("Please ensure:")
        print("1. Video Fetcher service is running (port 5003)")
        print("2. No firewall blocking the connection")
        print("3. Correct URL is being used")
        print(f"Full error: {str(e)}")
        plan_with_videos = plan
        
    except requests.exceptions.Timeout as e:
        print("\n!!! Timeout Error: Video Fetcher took too long to respond")
        print("Consider:")
        print("1. Increasing timeout value (currently 30s)")
        print("2. Checking Video Fetcher performance")
        print(f"Full error: {str(e)}")
        plan_with_videos = plan
        
    except Exception as e:
        print("\n!!! Unexpected Error communicating with Video Fetcher")
        print(f"Error type: {type(e).__name__}")
        print(f"Error details: {str(e)}")
        if hasattr(e, 'response') and e.response:
            print("Response content:", e.response.text)
        plan_with_videos = plan

    # 3. Generate notes for each subtopic using Gemini directly (not via material generator)
    enriched_plan = {}
    for date, value in plan_with_videos.items():
        # value can be a string (subtopic), or a dict (already enriched)
        if isinstance(value, dict):
            subtopic = value.get('subtopic') or value.get('name') or ''
            youtube_link = value.get('youtube_link', 'No video found')
            timestamp = value.get('timestamp', 'No timestamp')
        else:
            subtopic = value
            youtube_link = 'No video found'
            timestamp = 'No timestamp'
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
        # Replace the quiz generator call section with this improved version:
        try:
            print(f"Calling Quiz Generator for {subtopic} ({date})...")
            quiz_resp = requests.post(
                'http://localhost:5004/generate_quiz_and_assignments',
                json={
                    'subtopic': subtopic,
                    'timestamp': timestamp,
                    'youtube_link': youtube_link,
                    'study_notes': notes
                },
                timeout=30,
                headers={'Content-Type': 'application/json'}
            )
            
            print(f"Quiz Generator response status: {quiz_resp.status_code}")
            quiz_data = quiz_resp.json()
            print("Quiz Generator response:", json.dumps(quiz_data, indent=2))
            
            quizzes = quiz_data.get('quizzes', [])
            assignments = quiz_data.get('assignments', [])
            
        except requests.exceptions.RequestException as e:
            print(f"Failed to call quiz generator: {str(e)}")
            if hasattr(e, 'response') and e.response:
                print("Response content:", e.response.text)
            quizzes = []
            assignments = []
        except json.JSONDecodeError as e:
            print(f"Invalid JSON response from quiz generator: {str(e)}")
            print("Raw response:", quiz_resp.text)
            quizzes = []
            assignments = []
        except Exception as e:
            print(f"Unexpected error with quiz generator: {str(e)}")
            quizzes = []
            assignments = []
        # Build enriched entry
        enriched_plan[date] = {
            'subtopic': subtopic,
            'youtube_link': youtube_link,
            'timestamp': timestamp,
            'notes': notes,
            'quizzes': quizzes if quizzes else [],  # Ensure this is always a list
            'assignments': assignments if assignments else []  # Ensure this is always a list
        }

    response = {
        'status': 'Enriched study plan generated',
        'topic_name': topic_name,
        'no_of_days': no_of_days,
        'start_date': start_date,
        'daily_hours': daily_hours,
        'plan': enriched_plan
    }
    print("Final enriched plan:", json.dumps(enriched_plan, indent=2))

   # Save the enriched study plan to MongoDB
    try:
        result = learning_paths_collection.insert_one(response)
        print("Learning path saved to MongoDB.")
        # Add the inserted document's ID to the response
        response['_id'] = str(result.inserted_id)
    except Exception as e:
        print("Error saving learning path to MongoDB:", e)
        return jsonify({"error": "Failed to save learning path to MongoDB", "details": str(e)}), 500

    print("Returning enriched response:", response)
    return jsonify(response)


if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5001, debug=True)
