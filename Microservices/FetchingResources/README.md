# FetchingResources Microservice

A microservice for:
- Extracting topics from images (OCR)
- Searching YouTube for course videos
- Downloading/transcribing YouTube audio
- Generating notes, quizzes, and summaries using Gemini API
- Exporting results as PDFs

## Setup
1. Clone the repo and enter this directory.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   **Important:** This version works only with `moviepy==1.0.3`. If you face import errors, run:
   ```bash
   pip install moviepy==1.0.3
   ```
3. Set up `.env` with your `GOOGLE_API_KEY` and (optionally) `VOSK_MODEL_PATH`.

## Running
```bash
python main.py
```

## API Endpoints
- `GET /health` — Health check
- `POST /process_image` — Upload an image, extract topics
- `POST /process_topics` — Process topics (YouTube search, download, transcribe, generate content)
- `GET /status/<job_id>` — Get processing status
- `GET /download/<job_id>/<filename>` — Download result file

## Folder Structure
- `uploads/` — Uploaded images
- `results/` — Generated results (audio, transcripts, PDFs)

## Notes
- Requires Tesseract OCR and Vosk model installed locally.
- Uses Gemini API for content generation.

---
For more details, see code comments and docstrings.
