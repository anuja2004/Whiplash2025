import os
from flask import Flask, request, jsonify
import google.generativeai as genai
from dotenv import load_dotenv
from youtube_transcript_api import YouTubeTranscriptApi
import re
import logging

# --- Environment Setup ---
load_dotenv()

# --- Logging Setup ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# --- Gemini Setup ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY is None:
    logger.error("GEMINI_API_KEY not set in environment variables!")
    raise RuntimeError("GEMINI_API_KEY not set in environment variables!")

genai.configure(api_key=GEMINI_API_KEY)

# --- Gemini Model Instance ---
gemini_model = genai.GenerativeModel("gemini-1.5-pro-latest")

# --- Helper Functions ---
def extract_video_id(youtube_link):
    """
    Extract video ID from various YouTube URL formats.
    """
    if not youtube_link or youtube_link == "":
        return None
    patterns = [
        r"youtu\.be/([a-zA-Z0-9_-]{11})",
        r"youtube\.com/watch\?v=([a-zA-Z0-9_-]{11})",
        r"youtube\.com/embed/([a-zA-Z0-9_-]{11})",
        r"youtube\.com/v/([a-zA-Z0-9_-]{11})",
        r"youtube\.com/shorts/([a-zA-Z0-9_-]{11})"
    ]
    for pattern in patterns:
        match = re.search(pattern, youtube_link)
        if match:
            return match.group(1)
    complex_pattern = r"youtube\.com/watch\?.*v=([a-zA-Z0-9_-]{11})"
    match = re.search(complex_pattern, youtube_link)
    if match:
        return match.group(1)
    return None

def parse_timestamp(ts):
    """
    Parses a timestamp string (e.g. '01:10:00') into seconds.
    """
    try:
        parts = ts.split(':')
        if len(parts) == 3:
            h, m, s = map(int, parts)
            return h * 3600 + m * 60 + s
        elif len(parts) == 2:
            m, s = map(int, parts)
            return m * 60 + s
        else:
            s = int(parts[0])
            return s
    except Exception as e:
        logger.error(f"Invalid timestamp format: {ts} ({e})")
        return None

def extract_transcript_chunk(transcript_list, start_sec, end_sec):
    """
    Extracts transcript text strictly between start_sec and end_sec.
    Ensures only this segment is used for study notes generation.
    """
    chunk = []
    for item in transcript_list:
        if 'start' in item:
            t = int(item['start'])
            if t >= start_sec and t < end_sec:
                chunk.append(item['text'])
    return ' '.join(chunk)

def generate_notes_only(transcript, minutes, subtopic=None, topic_name=None):
    """
    Generate ONLY study notes from transcript using Gemini AI.
    Improved prompt for clarity, structure, and focus.
    """
    target_words = minutes * 30  # Assuming 30 words per minute for notes
    prompt = f"""
You are an expert study assistant. Summarize the following transcript into clear, concise, and well-structured study notes for a student.

- Focus on the most important concepts, facts, and explanations.
- Use Markdown headings, bullet points, and numbered lists for clarity.
- If possible, group related ideas under meaningful subheadings.
- Avoid copying verbatim; rewrite in your own words.
- Keep the total notes around {target_words} words.
- Do NOT include quizzes, assignments, or explanations about the process.
- The notes should be directly useful for revision.

Topic: {topic_name if topic_name else ''}
Subtopic: {subtopic if subtopic else ''}

Transcript:
{transcript}
"""
    try:
        response = gemini_model.generate_content(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Gemini notes generation failed: {e}")
        return "Error: Could not generate notes."

# --- Main Endpoint ---
@app.route('/generate-material', methods=['POST'])
def generate_material():
    """
    Generate ONLY study notes from YouTube transcripts and add them to the original plan structure.
    """
    try:
        data = request.get_json()
        if not data or 'plan' not in data:
            logger.warning("Invalid request: missing plan.")
            return jsonify({'error': 'Missing plan in request.'}), 400
        plan = data['plan']
        topic_name = data.get('topic_name', 'Unknown Topic')
        student_id = data.get('student_id', '')
        # Process each subtopic
        result = {}
        for sub_id, sub in plan.items():
            result_id = f"{student_id}_{sub_id}" if student_id else sub_id
            result[result_id] = {
                "name": sub.get("name", sub.get("subtopic", "Unknown")),
                "youtube_link": sub.get("youtube_link", ""),
                "timestamp": sub.get("timestamp", ""),
                "notes": "Processing..."
            }
            link = sub.get('youtube_link')
            if not link:
                result[result_id]["notes"] = "Error: No YouTube link provided"
                continue
            video_id = extract_video_id(link)
            if not video_id:
                result[result_id]["notes"] = "Could not extract video ID from the provided link."
                continue
            try:
                transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
                logger.info(f"Fetched full transcript list for video {video_id} (segments: {len(transcript_list)})")
                ts_range = sub.get('timestamp', '')
                # Always use only the transcript segment within the provided timestamp for study notes generation
                if '-' in ts_range:
                    start_str, end_str = ts_range.split('-')
                    start_sec = parse_timestamp(start_str)
                    end_sec = parse_timestamp(end_str)
                    if start_sec is None or end_sec is None:
                        raise ValueError('Invalid timestamp')
                    transcript = extract_transcript_chunk(transcript_list, start_sec, end_sec)
                    minutes = max(1, (end_sec - start_sec) // 60)
                    logger.info(f"Extracted transcript for {result_id} from {start_sec}s to {end_sec}s (approx {minutes} min)")
                else:
                    # If no timestamp range, use full transcript (fallback)
                    transcript = " ".join([item['text'] for item in transcript_list])
                    minutes = 10  # Default to 10 minutes
                    logger.warning(f"No timestamp range provided for {result_id}; using full transcript.")
                if not transcript.strip():
                    result[result_id]["notes"] = 'No transcript found for this timestamp range.'
                else:
                    # Add explicit comment for clarity
                    logger.info(f"Generating notes for {result_id} using only the extracted transcript segment.")
                    # Clean up notes whitespace and provide both markdown and HTML
                    notes_markdown = generate_notes_only(transcript, minutes, subtopic=result[result_id]["name"], topic_name=topic_name)
                    import markdown
                    notes_html = markdown.markdown(notes_markdown, extensions=['extra', 'sane_lists'])
                    result[result_id]["notes"] = notes_markdown.strip()
                    result[result_id]["notes_html"] = notes_html.strip()
            except Exception as e:
                logger.error(f"Error processing subtopic {sub_id}: {e}")
                result[result_id]["notes"] = f"Error: {str(e)}"
        # Return in the format that matches what your current server expects        
        if student_id:
            return jsonify(result)
        else:
            for sub_id, content in result.items():
                plan[sub_id]["notes"] = content["notes"]
            return jsonify({"plan": plan, "topic_name": topic_name})
    except Exception as e:
        logger.error(f"Error processing request: {e}")
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

# --- Health Check Endpoint ---
@app.route('/health', methods=['GET'])
def health():
    """
    Simple health check endpoint.
    """
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5007))
    app.run(host='0.0.0.0', port=port, debug=False)
