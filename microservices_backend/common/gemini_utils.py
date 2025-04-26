import requests
try:
    from .config import GEMINI_API_KEY  # For package/module usage
except ImportError:
    from config import GEMINI_API_KEY    # For direct script usage

import time

def call_gemini(prompt, model="models/gemini-1.5-pro-latest"):
    url = f"https://generativelanguage.googleapis.com/v1beta/{model}:generateContent?key={GEMINI_API_KEY}"
    headers = {"Content-Type": "application/json"}
    data = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    print("[Gemini] Sending prompt:", prompt)
    start = time.time()
    try:
        response = requests.post(url, headers=headers, json=data, timeout=15)
        response.raise_for_status()
        result = response.json()["candidates"][0]["content"]["parts"][0]["text"]
        print(f"[Gemini] Response received in {time.time() - start:.2f}s:", result)
        return result
    except Exception as e:
        print(f"[Gemini] Error after {time.time() - start:.2f}s:", e)
        raise

if __name__ == "__main__":
    prompt = "Respond ONLY as a JSON array of strings, no explanation, no extra text. List 3 colors."
    print(call_gemini(prompt))
