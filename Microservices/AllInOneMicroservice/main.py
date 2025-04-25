# All-in-One Microservice: OCR, YouTube Search, Download, Transcribe, Generate, PDF
# Everything in one file for easy deployment and testing

import os
import yt_dlp
import moviepy.editor as mp
from vosk import Model, KaldiRecognizer
import wave
import json
from PIL import Image
import pytesseract
from fpdf import FPDF
import google.generativeai as genai
from dotenv import load_dotenv
import uuid
import time
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS

# --- ENVIRONMENT ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
VOSK_MODEL_PATH = os.getenv("VOSK_MODEL_PATH", "vosk_model")
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)
CORS(app)
os.makedirs("uploads", exist_ok=True)
os.makedirs("results", exist_ok=True)

# --- OCR ---
# def extract_text_from_image(image_path):
#     try:
#         img = Image.open(image_path)
#         text = pytesseract.image_to_string(img)
#         topics = [line.strip() for line in text.split("\n") if line.strip()]
#         return topics
#     except Exception as e:
#         print(f"❌ Error in OCR: {e}")
#         return []

# --- YouTube Search ---
def search_youtube(query):
    search_query = f"ytsearch:{query} course"
    with yt_dlp.YoutubeDL({"quiet": True}) as ydl:
        try:
            info = ydl.extract_info(search_query, download=False)
            if info['entries']:
                return info['entries'][0]['webpage_url']
        except Exception as e:
            print(f"❌ Error in YouTube search: {e}")
    return None

# --- Download & Convert Audio ---
def download_audio(youtube_url, job_id):
    output_dir = os.path.join("results", job_id)
    os.makedirs(output_dir, exist_ok=True)
    audio_path = os.path.join(output_dir, "audio.mp3")
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': audio_path,
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([youtube_url])
    return audio_path

def convert_audio_to_wav(mp3_path):
    wav_path = mp3_path.replace('.mp3', '.wav')
    clip = mp.AudioFileClip(mp3_path)
    clip.write_audiofile(wav_path)
    return wav_path

# --- Transcribe Audio ---
def transcribe_audio(wav_path):
    model = Model(VOSK_MODEL_PATH)
    wf = wave.open(wav_path, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)
    results = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            part = json.loads(rec.Result())
            results.append(part.get('text', ''))
    final = json.loads(rec.FinalResult())
    results.append(final.get('text', ''))
    return " ".join(results)

# --- Generate Notes/Quiz/Summary ---
def generate_content(transcript, mode="notes"):
    prompt = {
        "notes": f"Generate concise study notes from this transcript: {transcript}",
        "quiz": f"Generate 5 MCQ questions (with answers) from this transcript: {transcript}",
        "summary": f"Summarize the following transcript: {transcript}"
    }[mode]
    response = genai.generate_text(prompt)
    return response

# --- PDF Export ---
def generate_pdf(content, job_id):
    output_dir = os.path.join("results", job_id)
    os.makedirs(output_dir, exist_ok=True)
    pdf_path = os.path.join(output_dir, "output.pdf")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    for line in content.split('\n'):
        pdf.cell(200, 10, txt=line, ln=1)
    pdf.output(pdf_path)
    return pdf_path

# --- API Endpoints ---
@app.route("/health")
def health():
    return jsonify({"status": "ok", "service": "AllInOneMicroservice"})

@app.route("/process_image", methods=["POST"])
def process_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400
    image = request.files['image']
    filename = os.path.join('uploads', image.filename)
    image.save(filename)
    topics = extract_text_from_image(filename)
    return jsonify({'topics': topics, 'image_path': filename})

@app.route("/process_topics", methods=["POST"])
def process_topics():
    data = request.get_json()
    image_path = data.get('image_path')
    job_id = data.get('job_id', str(uuid.uuid4()))
    if not image_path:
        return jsonify({'error': 'Missing image_path'}), 400
    topics = extract_text_from_image(image_path)
    results = []
    for topic in topics:
        yt_url = search_youtube(topic)
        if not yt_url:
            continue
        audio_path = download_audio(yt_url, job_id)
        wav_path = convert_audio_to_wav(audio_path)
        transcript = transcribe_audio(wav_path)
        notes = generate_content(transcript, mode="notes")
        quiz = generate_content(transcript, mode="quiz")
        summary = generate_content(transcript, mode="summary")
        pdf_path = generate_pdf(f"Notes:\n{notes}\n\nQuiz:\n{quiz}\n\nSummary:\n{summary}", job_id)
        results.append({
            'topic': topic,
            'youtube_url': yt_url,
            'notes': notes,
            'quiz': quiz,
            'summary': summary,
            'pdf': pdf_path
        })
    return jsonify({'job_id': job_id, 'results': results})

@app.route("/download/<job_id>/<filename>")
def download(job_id, filename):
    filepath = os.path.join('results', job_id, filename)
    if not os.path.exists(filepath):
        return jsonify({'error': 'File not found'}), 404
    return send_file(filepath, as_attachment=True)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=7000, debug=True)
