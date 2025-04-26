"""
Video Fetcher Service: HTTP microservice to fetch YouTube videos for each subtopic in a study plan.
"""
from flask import Flask, request, jsonify
import requests
from common.config import YOUTUBE_API_KEY

app = Flask(__name__)

def fetch_top_video_for_topic(topic):
    # Search for a comprehensive video for the whole topic
    search_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": topic + " full course",
        "type": "video",
        "maxResults": 1,
        "key": YOUTUBE_API_KEY
    }
    try:
        resp = requests.get(search_url, params=params, timeout=8)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        if not items:
            return None, None, None
        video_id = items[0]["id"]["videoId"]
        link = f"https://youtube.com/watch?v={video_id}"
        # Now get video duration
        video_url = "https://www.googleapis.com/youtube/v3/videos"
        params2 = {
            "part": "contentDetails",
            "id": video_id,
            "key": YOUTUBE_API_KEY
        }
        resp2 = requests.get(video_url, params=params2, timeout=8)
        resp2.raise_for_status()
        items2 = resp2.json().get("items", [])
        if not items2:
            return link, None, None
        duration_iso = items2[0]["contentDetails"]["duration"]
        # Parse ISO 8601 duration
        import isodate
        duration_sec = int(isodate.parse_duration(duration_iso).total_seconds())
        return link, duration_sec, video_id
    except Exception as e:
        print(f"YouTube API error for topic '{topic}':", e)
        return None, None, None

def fetch_youtube_video(subtopic):
    # Search for a video for a specific subtopic
    search_url = "https://www.googleapis.com/youtube/v3/search"
    params = {
        "part": "snippet",
        "q": subtopic,
        "type": "video",
        "maxResults": 1,
        "key": YOUTUBE_API_KEY
    }
    try:
        resp = requests.get(search_url, params=params, timeout=8)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        if not items:
            return None
        video_id = items[0]["id"]["videoId"]
        link = f"https://youtube.com/watch?v={video_id}"
        return link
    except Exception as e:
        print(f"YouTube API error for subtopic '{subtopic}':", e)
        return None

@app.route('/fetch_videos', methods=['POST'])
def fetch_videos():
    import math
    data = request.json
    topic_name = data.get('topic_name')
    plan = data.get('plan')  # {date: subtopic}
    daily_hours = data.get('daily_hours')
    target_days = data.get('target_days')

    if not topic_name or not plan or not daily_hours or not target_days:
        return jsonify({'error': 'Missing topic_name, plan, daily_hours, or target_days'}), 400

    # Calculate total study time in seconds
    try:
        total_study_time_sec = int(float(daily_hours) * float(target_days) * 3600)
    except Exception as e:
        return jsonify({'error': f'Invalid daily_hours or target_days: {e}'}), 400

    # Search for a topic video within ±20% of total study time
    def search_topic_video_near_duration(topic, target_sec):
        search_url = "https://www.googleapis.com/youtube/v3/search"
        params = {
            "part": "snippet",
            "q": topic + " full course",
            "type": "video",
            "maxResults": 8,
            "key": YOUTUBE_API_KEY
        }
        import isodate
        try:
            resp = requests.get(search_url, params=params, timeout=8)
            resp.raise_for_status()
            items = resp.json().get("items", [])
            if not items:
                return None, None, None
            # Track all candidate videos
            candidates = []
            for item in items:
                video_id = item["id"]["videoId"]
                video_url = "https://www.googleapis.com/youtube/v3/videos"
                params2 = {
                    "part": "contentDetails",
                    "id": video_id,
                    "key": YOUTUBE_API_KEY
                }
                resp2 = requests.get(video_url, params=params2, timeout=8)
                resp2.raise_for_status()
                items2 = resp2.json().get("items", [])
                if not items2:
                    continue
                duration_iso = items2[0]["contentDetails"]["duration"]
                duration_sec = int(isodate.parse_duration(duration_iso).total_seconds())
                candidates.append({
                    'video_id': video_id,
                    'duration_sec': duration_sec,
                    'link': f"https://youtube.com/watch?v={video_id}"
                })
            print("[DEBUG] Candidate videos:", candidates)
            # Only use a video in ±20% range
            for c in candidates:
                if 0.8 * target_sec <= c['duration_sec'] <= 1.2 * target_sec:
                    print(f"[DEBUG] Using in-range video: {c['link']} ({c['duration_sec']} sec)")
                    return c['link'], c['duration_sec'], c['video_id']
            print("[DEBUG] No in-range topic video found.")
            return None, None, None
        except Exception as e:
            print(f"YouTube API error for topic '{topic}':", e)
            return None, None, None

    full_link, duration_sec, video_id = search_topic_video_near_duration(topic_name, total_study_time_sec)
    result_plan = {}
    subtopics = list(plan.values())
    dates = list(plan.keys())

    print(f"[DEBUG] Topic full video: {full_link}, duration (sec): {duration_sec}, target (sec): {total_study_time_sec}")
    if full_link and duration_sec:
        # Split the found video into segments for subtopics
        n = len(subtopics)
        seg_len = duration_sec // n if n > 0 else duration_sec
        for idx, (date, subtopic) in enumerate(plan.items()):
            start_sec = idx * seg_len
            end_sec = (idx + 1) * seg_len if idx < n - 1 else duration_sec
            # Format as HH:MM:SS
            def fmt(sec):
                h = sec // 3600
                m = (sec % 3600) // 60
                s = sec % 60
                return f"{h:02d}:{m:02d}:{s:02d}"
            timestamp = f"{fmt(start_sec)}-{fmt(end_sec)}"
            result_plan[date] = {
                'subtopic': subtopic,
                'youtube_link': full_link,
                'timestamp': timestamp
            }
    else:
        print("[DEBUG] No in-range topic video found, falling back to per-subtopic videos.")
        for date, subtopic in plan.items():
            link = fetch_youtube_video(subtopic)
            if link is None:
                result_plan[date] = {
                    'subtopic': subtopic,
                    'youtube_link': None,
                    'timestamp': None,
                    'error': 'No video found'
                }
            else:
                result_plan[date] = {
                    'subtopic': subtopic,
                    'youtube_link': link,
                    'timestamp': '00:00:00-full'
                }
    response = {
        'topic_name': topic_name,
        'plan': result_plan
    }
    return jsonify(response)

if __name__ == '__main__':
    app.run(port=5003, debug=True)
