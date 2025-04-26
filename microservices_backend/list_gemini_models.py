import os
from dotenv import load_dotenv
import requests

load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_API_KEY}"
response = requests.get(url)
print("Status Code:", response.status_code)
print("Response:", response.text)
