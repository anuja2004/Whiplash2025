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

load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
VOSK_MODEL_PATH = os.getenv("VOSK_MODEL_PATH", "vosk_model")
genai.configure(api_key=GOOGLE_API_KEY)

# --- OCR ---
def extract_text_from_image(image_path):
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        topics = [line.strip() for line in text.split("\n") if line.strip()]
        return topics
    except Exception as e:
        print(f"❌ Error in OCR: {e}")
        return []

# --- YouTube Search ---
def search_youtube(query):
    search_query = f"ytsearch:{query} course"
    with yt_dlp.YoutubeDL({"quiet": True}) as ydl:
        info = ydl.extract_info(search_query, download=False)
        if "entries" in info and info["entries"]:
            return info["entries"][0]["webpage_url"]
    return None

# --- Download Audio ---
def download_audio(video_url, job_id, index):
    output_path = f"results/{job_id}/audio_topic_{index}.mp3"
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
        }],
        'quiet': True,
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])
    return output_path

# --- Convert Audio to WAV ---
def convert_audio_to_wav(input_file, job_id, index):
    output_file = f"results/{job_id}/audio_topic_{index}.wav"
    clip = mp.AudioFileClip(input_file)
    clip.write_audiofile(output_file)
    return output_file

# --- Transcribe Audio ---
def transcribe_audio(audio_file, job_id, index):
    model = Model(VOSK_MODEL_PATH)
    wf = wave.open(audio_file, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    transcript = ""
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            transcript += res.get("text", "") + " "
    res = json.loads(rec.FinalResult())
    transcript += res.get("text", "")
    return transcript

# --- Gemini Content Generation ---
def generate_content(prompt):
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    return response.text

# --- PDF Generation ---
def generate_pdf(transcript, notes, quiz, summary, filename):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Transcript", ln=True)
    pdf.multi_cell(0, 10, transcript)
    pdf.cell(200, 10, txt="Notes", ln=True)
    pdf.multi_cell(0, 10, notes)
    pdf.cell(200, 10, txt="Quiz", ln=True)
    pdf.multi_cell(0, 10, quiz)
    pdf.cell(200, 10, txt="Summary", ln=True)
    pdf.multi_cell(0, 10, summary)
    pdf.output(filename)
    return filename

# --- Full Topic Processing Pipeline ---
def process_topics_full(image_path, job_id):
    topics = extract_text_from_image(image_path)
    os.makedirs(f"results/{job_id}", exist_ok=True)
    results = []
    for i, topic in enumerate(topics):
        yt_url = search_youtube(topic)
        if not yt_url:
            results.append({'topic': topic, 'error': 'No YouTube video found'})
            continue
        audio_mp3 = download_audio(yt_url, job_id, i)
        audio_wav = convert_audio_to_wav(audio_mp3, job_id, i)
        transcript = transcribe_audio(audio_wav, job_id, i)
        notes = generate_content(f"Make detailed notes for: {transcript}")
        quiz = generate_content(f"Make a quiz for: {transcript}")
        summary = generate_content(f"Summarize: {transcript}")
        pdf_path = f"results/{job_id}/topic_{i}.pdf"
        generate_pdf(transcript, notes, quiz, summary, pdf_path)
        results.append({'topic': topic, 'pdf': pdf_path})
    return {'job_id': job_id, 'results': results}
