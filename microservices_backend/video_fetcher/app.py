"""
Video Fetcher Service: Consumes video.fetch.request, fetches YouTube videos for each topic, and publishes to video.fetch.response.
"""
from confluent_kafka import Consumer, Producer
import json
import time
from common.config import YOUTUBE_API_KEY, KAFKA_BOOTSTRAP_SERVERS
from common.kafka_utils import get_kafka_consumer, get_kafka_producer

# Mock YouTube search (replace with real API call)
def fetch_youtube_videos(topic, max_results=2):
    # In production, use YouTube Data API
    # For now, return mock video links
    return [
        f"https://youtube.com/mock_video_{topic.replace(' ', '_')}_1",
        f"https://youtube.com/mock_video_{topic.replace(' ', '_')}_2"
    ][:max_results]

def main():
    consumer = get_kafka_consumer('video_fetcher_group', ['video.fetch.request'])
    producer = get_kafka_producer()
    print("[VideoFetcher] Listening for video fetch requests...")
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
        result = []
        for topic in topics:
            videos = fetch_youtube_videos(topic)
            result.append({'topic': topic, 'videos': videos})
        response = {
            'subject': subject,
            'study_plan': result
        }
        producer.produce('video.fetch.response', json.dumps(response).encode('utf-8'))
        producer.flush()
        print(f"[VideoFetcher] Published study plan for subject: {subject}")

if __name__ == '__main__':
    main()
