"""
MCP Server: Handles incoming study plan requests, uses Gemini to generate topics, and triggers video fetching via Kafka.
"""
from flask import Flask, request, jsonify
import json
from common.gemini_utils import call_gemini

app = Flask(__name__)

# Improved Gemini prompt for a full study plan distributed by date
STUDY_PLAN_PROMPT = (
    "You are a study planner assistant. Given a topic, number of days, start date, and daily hours, "
    "distribute the key subtopics to study for the topic, assigning each day a subtopic. "
    "Respond ONLY as a JSON object mapping dates (YYYY-MM-DD) to the subtopic(s) to study on that day. "
    "Do not include any explanation or extra text. Example: {\"2025-04-27\": \"Intro to ML\", \"2025-04-28\": \"Supervised Learning\"}"
)

@app.route('/generate_plan', methods=['POST'])
def generate_plan():
    data = request.json
    import time
    print("Received request:", data)
    topic_name = data.get('topic_name')
    no_of_days = data.get('no_of_days')
    start_date = data.get('start_date')
    daily_hours = data.get('daily_hours')

    # Improved prompt: distribute subtopics by date
    prompt = (
        f"Topic: {topic_name}. Number of days: {no_of_days}. Start date: {start_date}. Daily hours: {daily_hours}. "
        + STUDY_PLAN_PROMPT
    )
    import time
    start = time.time()
    try:
        print("Calling Gemini API with prompt:\n", prompt)
        import re
        plan_str = call_gemini(prompt)
        print("Gemini API raw response:", repr(plan_str))
        # Remove triple backtick code block (with or without 'json')
        cleaned = re.sub(r'^```(?:json)?\s*|\s*```$', '', plan_str.strip(), flags=re.IGNORECASE | re.MULTILINE).strip()
        print("Cleaned Gemini response:", repr(cleaned))
        try:
            plan = json.loads(cleaned)
        except Exception as e:
            print("Failed to parse cleaned Gemini response:", cleaned)
            raise
    except Exception as e:
        print(f"Error during Gemini processing after {time.time() - start:.2f}s:", e)
        return jsonify({"error": str(e), "gemini_response": plan_str if 'plan_str' in locals() else None}), 500
    finally:
        print(f"Gemini call took {time.time() - start:.2f} seconds")

    response = {
        'status': 'Gemini study plan generated',
        'topic_name': topic_name,
        'no_of_days': no_of_days,
        'start_date': start_date,
        'daily_hours': daily_hours,
        'plan': plan
    }
    print("Returning response:", response)
    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5001, debug=True)


# {
#     Topic name : 'Topic name',
#     No of Days 
#     Start date
#     Daily Hours 
# }
