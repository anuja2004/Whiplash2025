import requests
import time
import os
from tenacity import retry, stop_after_attempt, wait_exponential

# Retry logic with exponential backoff
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def call_gemini(prompt, model="gemini-1.5-pro-latest"):
    """
    Calls the Gemini API to generate content based on the provided prompt.

    Args:
        prompt (str): The input prompt for the Gemini API.
        model (str): The Gemini model to use (default: "gemini-1.5-pro-latest").

    Returns:
        str: The generated content from the Gemini API.

    Raises:
        Exception: If the API call fails or returns an error.
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    params = {'key': os.getenv('GEMINI_API_KEY')}
    headers = {'Content-Type': 'application/json'}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "response_mime_type": "application/json"
        }
    }

    print("[DEBUG] Sending request to Gemini API...")
    print("URL:", url)
    print("Payload:", payload)
    print("Params:", params)

    try:
        response = requests.post(url, params=params, headers=headers, json=payload, timeout=60)
        response.raise_for_status()  # Raise an HTTPError for bad responses (4xx and 5xx)
        print("[DEBUG] Gemini API response:", response.json())
        return response.json()['candidates'][0]['content']['parts'][0]['text']
    except requests.exceptions.HTTPError as e:
        print("[ERROR] HTTPError in call_gemini:", e)
        if e.response is not None:
            print("[ERROR] Response content:", e.response.text)
            if e.response.status_code == 429:  # Too Many Requests
                retry_after = int(e.response.headers.get('Retry-After', 5))
                print(f"[ERROR] Rate limited. Retrying after {retry_after} seconds...")
                time.sleep(retry_after)
        raise
    except Exception as e:
        print("[ERROR] General error in call_gemini:", e)
        raise

if __name__ == "__main__":
    # Test the function with a sample prompt
    prompt = "Respond ONLY as a JSON array of strings, no explanation, no extra text. List 3 colors."
    try:
        response = call_gemini(prompt)
        print("[TEST] Gemini API response:", response)
    except Exception as e:
        print("[TEST] Error during Gemini API call:", e)