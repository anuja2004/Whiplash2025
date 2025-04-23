from flask import Flask, request, jsonify, send_file
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
from werkzeug.utils import secure_filename

# Load environment variables
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
VOSK_MODEL_PATH = os.getenv("VOSK_MODEL_PATH", "vosk_model")

# Configure Gemini API
genai.configure(api_key=GOOGLE_API_KEY)

app = Flask(__name__)

# Create directories for uploads and results
os.makedirs("uploads", exist_ok=True)
os.makedirs("results", exist_ok=True)

# ---------------- Extract Text from Image ----------------
def extract_text_from_image(image_path):
    try:
        img = Image.open(image_path)
        text = pytesseract.image_to_string(img)
        topics = [line.strip() for line in text.split("\n") if line.strip()]
        return topics
    except Exception as e:
        print(f"❌ Error in OCR: {e}")
        return []

# ---------------- Search YouTube ----------------
def search_youtube(query):
    search_query = f"ytsearch:{query} course"
    print(f"🔍 Searching YouTube for: {search_query}")
    with yt_dlp.YoutubeDL({"quiet": True}) as ydl:
        info = ydl.extract_info(search_query, download=False)
        if "entries" in info and info["entries"]:
            return info["entries"][0]["webpage_url"]
    return None

# ---------------- Download Audio from YouTube ----------------
def download_audio(video_url, job_id, index):
    print("🎵 Downloading audio from YouTube...")
    output_path = f"results/{job_id}/audio_topic_{index}.mp3"
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': output_path,
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '128',
        }],
    }
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        ydl.download([video_url])
    print("✅ Audio downloaded.")
    return output_path

# ---------------- Convert Audio to WAV ----------------
def convert_audio_to_wav(input_file, job_id, index):
    print("🎼 Converting audio to WAV format...")
    output_file = f"results/{job_id}/audio_topic_{index}.wav"
    audio_clip = mp.AudioFileClip(input_file)
    audio_clip.write_audiofile(output_file)
    audio_clip.close()
    print("✅ Conversion completed.")
    return output_file

# ---------------- Transcribe Audio ----------------
def transcribe_audio(audio_file, job_id, index):
    model = Model(VOSK_MODEL_PATH)
    mono_audio_file = f"results/{job_id}/mono_audio_topic_{index}.wav"
    os.system(f"ffmpeg -i {audio_file} -ac 1 -ar 16000 {mono_audio_file} -y")
    wf = wave.open(mono_audio_file, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    rec.SetWords(True)

    transcript = []
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            result = json.loads(rec.Result())
            transcript.append(result.get("text", ""))

    wf.close()
    final_text = " ".join(transcript).strip()
    return final_text if final_text else "No speech detected."

def generate_content(prompt):
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text

def clean_text(text):
    return text.encode("latin-1", "ignore").decode("latin-1")

# ---------------- PDF Generation ----------------
def generate_pdf(transcript, notes, quiz, summary, filename):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, "Study Material", ln=True, align='C')

    pdf.ln(10)
    pdf.cell(0, 10, "Transcript:", ln=True, align='L')
    pdf.multi_cell(0, 10, transcript)

    pdf.ln(10)
    pdf.cell(0, 10, "Study Notes:", ln=True, align='L')
    pdf.multi_cell(0, 10, notes)

    pdf.ln(10)
    pdf.cell(0, 10, "Quiz Questions:", ln=True, align='L')
    pdf.multi_cell(0, 10, quiz)

    pdf.ln(10)
    pdf.cell(0, 10, "Summary:", ln=True, align='L')
    pdf.multi_cell(0, 10, summary)

    pdf.output(filename)
    print(f"✅ PDF saved as '{filename}'")

# API Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "study-material-generator"}), 200

@app.route('/process', methods=['POST'])
def process_image():
    if 'syllabus_image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
        
    file = request.files['syllabus_image']
    if file.filename == '':
        return jsonify({"error": "No image selected"}), 400
        
    # Create unique job ID and directory
    job_id = str(uuid.uuid4())
    os.makedirs(f"results/{job_id}", exist_ok=True)
    
    # Save the uploaded image
    image_path = f"uploads/{job_id}_{secure_filename(file.filename)}"
    file.save(image_path)
    
    # Process in background or queue system (simplified here)
    process_topics(image_path, job_id)
    
    return jsonify({
        "job_id": job_id, 
        "message": "Processing started",
        "status_url": f"/status/{job_id}"
    }), 202

def process_topics(image_path, job_id):
    # This would ideally be run in a background task
    topics = extract_text_from_image(image_path)
    
    if not topics:
        with open(f"results/{job_id}/status.json", "w") as f:
            json.dump({"status": "failed", "error": "No topics extracted"}, f)
        return
    
    # Create initial status file
    with open(f"results/{job_id}/status.json", "w") as f:
        json.dump({
            "status": "processing",
            "total_topics": len(topics),
            "processed_topics": 0,
            "topics": topics
        }, f)
    
    results = []
    
    for index, topic in enumerate(topics, 1):
        print(f"\n🔎 [{index}/{len(topics)}] Processing topic: {topic}")
        
        # Update status
        with open(f"results/{job_id}/status.json", "r") as f:
            status = json.load(f)
        
        status["current_topic"] = topic
        
        with open(f"results/{job_id}/status.json", "w") as f:
            json.dump(status, f)
            
        video_url = search_youtube(topic)
        
        if not video_url:
            results.append({"topic": topic, "status": "failed", "error": "No video found"})
            continue
            
        try:
            audio_file = download_audio(video_url, job_id, index)
            wav_file = convert_audio_to_wav(audio_file, job_id, index)
            transcript = transcribe_audio(wav_file, job_id, index)
            
            if not transcript:
                results.append({"topic": topic, "status": "failed", "error": "No transcript"})
                continue
                
            with open(f"results/{job_id}/transcript_topic_{index}.txt", "w") as f:
                f.write(transcript)
                
            notes = clean_text(generate_content(f"Generate detailed study notes:\n\n{transcript}"))
            quiz = clean_text(generate_content(f"Create 5 multiple-choice quiz questions:\n\n{transcript}"))
            summary = clean_text(generate_content(f"Summarize the key points:\n\n{transcript}"))
            
            pdf_filename = f"results/{job_id}/study_material_topic_{index}.pdf"
            generate_pdf(transcript, notes, quiz, summary, pdf_filename)
            
            results.append({
                "topic": topic,
                "status": "success",
                "pdf_url": f"/download/{job_id}/study_material_topic_{index}.pdf"
            })
            
        except Exception as e:
            results.append({
                "topic": topic,
                "status": "failed",
                "error": str(e)
            })
            
        # Update status
        with open(f"results/{job_id}/status.json", "r") as f:
            status = json.load(f)
            
        status["processed_topics"] += 1
        status["results"] = results
        
        with open(f"results/{job_id}/status.json", "w") as f:
            json.dump(status, f)
    
    # Final status update
    with open(f"results/{job_id}/status.json", "r") as f:
        status = json.load(f)
        
    status["status"] = "completed"
    status["completed_at"] = time.time()
    
    with open(f"results/{job_id}/status.json", "w") as f:
        json.dump(status, f)

@app.route('/status/<job_id>', methods=['GET'])
def get_status(job_id):
    status_file = f"results/{job_id}/status.json"
    
    if not os.path.exists(status_file):
        return jsonify({"error": "Job not found"}), 404
        
    with open(status_file, "r") as f:
        status = json.load(f)
        
    return jsonify(status), 200

@app.route('/download/<job_id>/<filename>', methods=['GET'])
def download_file(job_id, filename):
    file_path = f"results/{job_id}/{filename}"
    
    if not os.path.exists(file_path):
        return jsonify({"error": "File not found"}), 404
        
    return send_file(file_path, as_attachment=True)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)