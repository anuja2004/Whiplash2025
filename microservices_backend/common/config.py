import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

KAFKA_BOOTSTRAP_SERVERS = os.getenv('KAFKA_BOOTSTRAP_SERVERS', 'localhost:9092')
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
YOUTUBE_API_KEY = os.getenv('YOUTUBE_API_KEY')
