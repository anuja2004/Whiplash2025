# In your Video Fetcher service (app.py):

from flask import Flask, request, jsonify
import requests
import os
from dotenv import load_dotenv
from datetime import datetime
import isodate
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('video_fetcher.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Get YouTube API key from environment
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
if not YOUTUBE_API_KEY:
    logger.error("YouTube API key not found in environment variables")
    raise ValueError("Missing YOUTUBE_API_KEY in environment")

def validate_duration(duration_iso, target_sec, tolerance=0.2):
    """Check if duration is within tolerance of target"""
    try:
        duration_sec = int(isodate.parse_duration(duration_iso).total_seconds())
        lower = target_sec * (1 - tolerance)
        upper = target_sec * (1 + tolerance)
        return lower <= duration_sec <= upper
    except Exception as e:
        logger.error(f"Duration validation error: {e}")
        return False

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'youtube_api_configured': bool(YOUTUBE_API_KEY)
    })

@app.route('/fetch_videos', methods=['POST'])
def fetch_videos():
    start_time = datetime.now()
    logger.info("Received video fetch request")
    
    try:
        data = request.get_json()
        if not data:
            logger.error("No JSON data received")
            return jsonify({'error': 'Request body must be JSON'}), 400

        required_fields = ['topic_name', 'plan', 'daily_hours', 'target_days']
        missing = [field for field in required_fields if field not in data]
        if missing:
            logger.error(f"Missing required fields: {missing}")
            return jsonify({'error': f'Missing required fields: {missing}'}), 400

        topic_name = data['topic_name']
        plan = data['plan']
        daily_hours = float(data['daily_hours'])
        target_days = float(data['target_days'])
        
        total_study_time_sec = int(daily_hours * target_days * 3600)
        logger.info(f"Processing topic: {topic_name}, total study time: {total_study_time_sec} seconds")

        # Search for topic video
        topic_video = find_topic_video(topic_name, total_study_time_sec)
        
        result_plan = {}
        if topic_video:
            logger.info(f"Found topic video: {topic_video['link']}")
            result_plan = segment_video_for_subtopics(topic_video, plan)
        else:
            logger.info("No suitable topic video found, searching per subtopic")
            result_plan = find_videos_per_subtopic(plan)

        response = {
            'topic_name': topic_name,
            'plan': result_plan,
            'processing_time': str(datetime.now() - start_time)
        }
        
        logger.info("Successfully processed video fetch request")
        return jsonify(response)

    except Exception as e:
        logger.error(f"Error processing request: {str(e)}", exc_info=True)
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

def find_topic_video(topic, target_sec, max_results=5):
    """Find a video matching the total study duration"""
    search_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": f"{topic} course tutorial",
        "type": "video",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY,
        "order":"viewCount"
    }
    
    try:
        resp = requests.get(search_url, params=params, timeout=10)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        
        for item in items:
            video_id = item["id"]["videoId"]
            duration = get_video_duration(video_id)
            if duration and validate_duration(duration, target_sec):
                return {
                    'video_id': video_id,
                    'link': f"https://youtube.com/watch?v={video_id}",
                    'duration': duration,
                    'duration_sec': int(isodate.parse_duration(duration).total_seconds())
                }
    except Exception as e:
        logger.error(f"Error finding topic video: {str(e)}")
    
    return None

def get_video_duration(video_id):
    """Get duration for a single video"""
    video_url = "https://www.googleapis.com/youtube/v3/videos"
    params = {
        "part": "contentDetails",
        "id": video_id,
        "key": YOUTUBE_API_KEY
    }
    
    try:
        resp = requests.get(video_url, params=params, timeout=10)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        return items[0]["contentDetails"]["duration"] if items else None
    except Exception as e:
        logger.error(f"Error getting video duration: {str(e)}")
        return None

def segment_video_for_subtopics(video, plan):
    """Split the video into segments for each subtopic"""
    duration_sec = video['duration_sec']
    subtopics = list(plan.values())
    n = len(subtopics)
    seg_len = duration_sec // n if n > 0 else duration_sec
    
    result = {}
    for idx, (date, subtopic) in enumerate(plan.items()):
        start_sec = idx * seg_len
        end_sec = (idx + 1) * seg_len if idx < n - 1 else duration_sec
        timestamp = f"{sec_to_timestamp(start_sec)}-{sec_to_timestamp(end_sec)}"
        
        result[date] = {
            'subtopic': subtopic,
            'youtube_link': video['link'],
            'timestamp': timestamp,
            'source': 'topic_video'
        }
    
    return result

def find_videos_per_subtopic(plan):
    """Find individual videos for each subtopic"""
    result = {}
    for date, subtopic in plan.items():
        video = find_best_video_for_subtopic(subtopic)
        result[date] = {
            'subtopic': subtopic,
            'youtube_link': video['link'] if video else None,
            'timestamp': '00:00:00-full' if video else None,
            'source': 'individual_video' if video else None
        }
    return result

def find_best_video_for_subtopic(subtopic, max_results=3):
    """Find the best video for a subtopic"""
    search_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": subtopic,
        "type": "video",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY
    }
    
    try:
        resp = requests.get(search_url, params=params, timeout=10)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        if items:
            return {
                'link': f"https://youtube.com/watch?v={items[0]['id']['videoId']}",
                'video_id': items[0]['id']['videoId']
            }
    except Exception as e:
        logger.error(f"Error finding video for subtopic {subtopic}: {str(e)}")
    
    return None

def sec_to_timestamp(seconds):
    """Convert seconds to HH:MM:SS format"""
    h = seconds // 3600
    m = (seconds % 3600) // 60
    s = seconds % 60
    return f"{h:02d}:{m:02d}:{s:02d}"

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5003, debug=True)