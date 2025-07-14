"""
MCP Server: Handles incoming study plan requests, uses Gemini to generate topics, and triggers video fetching via Kafka.
Enhanced with rich terminal output, robust error handling, and improved database operations.
"""
from flask import Flask, request, jsonify
import json
import time
import re
import requests
from flask_cors import CORS
from common.gemini_utils import call_gemini
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv
import os
from datetime import datetime
import uuid
from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn, TimeElapsedColumn
from rich import print as rprint
from rich.table import Table
from rich.traceback import install

# Install rich traceback handler
install(show_locals=True)

# Initialize Rich console
console = Console()

# Create banner
def print_banner():
    console.print(Panel.fit(
        "[bold yellow]WhipLash MCP Server[/bold yellow]\n"
        "[cyan]Handling study plan generation, video fetching, and database operations[/cyan]",
        border_style="green"
    ))

# Load environment variables from .env file
load_dotenv()
console.print("[bold green]✓[/bold green] Environment variables loaded")

# MongoDB connection with proper error handling
def connect_to_mongodb():
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/WhipLash')
    console.print(f"[yellow]Connecting to MongoDB at:[/yellow] {mongo_uri}")
    
    try:
        client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
        # Verify connection is working
        client.admin.command('ping')
        db = client['WhipLash']
        console.print("[bold green]✓[/bold green] MongoDB connection successful")
        return client, db
    except ConnectionFailure as e:
        console.print(f"[bold red]✗ MongoDB connection failed:[/bold red] {str(e)}")
        raise
    except Exception as e:
        console.print(f"[bold red]✗ Unexpected MongoDB error:[/bold red] {str(e)}")
        raise

# Initialize MongoDB connection
try:
    mongo_client, db = connect_to_mongodb()
    learning_paths_collection = db['learning_paths']
except Exception as e:
    console.print(f"[bold red]Fatal error: Could not connect to MongoDB[/bold red]")
    # In a production environment, you might want to implement a retry mechanism
    # or fallback to a local storage option
    learning_paths_collection = None

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5174"}})
console.print("[bold green]✓[/bold green] Flask app initialized with CORS")

# Improved Gemini prompt for a full study plan distributed by date
STUDY_PLAN_PROMPT = (
    "You are a study planner assistant. Given a topic, number of days, start date, and daily hours, "
    "distribute the key subtopics to study for the topic, assigning each day a subtopic. "
    "Respond ONLY as a JSON object mapping dates (YYYY-MM-DD) to the subtopic(s) to study on that day. "
    "Do not include any explanation or extra text. Example: {\"2025-04-27\": \"Intro to ML\", \"2025-04-28\": \"Supervised Learning\"}"
)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for the MCP Server"""
    status = {
        "service": "MCP Server",
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "mongodb_connected": learning_paths_collection is not None
    }
    return jsonify(status)

@app.route('/generate_plan', methods=['POST'])
def generate_plan():
    """
    Main endpoint to generate learning plans with advanced error handling
    and rich visual feedback
    """
    # Generate a unique request ID
    request_id = str(uuid.uuid4())[:8]
    console.print(f"\n[bold blue]╔══════════════════════════════════════════════════════════════╗[/bold blue]")
    console.print(f"[bold blue]║[/bold blue] [bold yellow]⚡ New Request[/bold yellow] [ID: {request_id}] - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} [bold blue]║[/bold blue]")
    console.print(f"[bold blue]╚══════════════════════════════════════════════════════════════╝[/bold blue]")
    
    # Extract and validate request data
    try:
        data = request.json
        required_fields = ['topic_name', 'no_of_days', 'start_date', 'daily_hours']
        
        # Log incoming request
        console.print(Panel.fit(
            f"[bold cyan]Request Data:[/bold cyan]\n" +
            "\n".join([f"[yellow]{k}:[/yellow] {v}" for k, v in data.items()]),
            title=f"Request {request_id}",
            border_style="blue"
        ))
        
        # Validate required fields
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            error_msg = f"Missing required fields: {', '.join(missing_fields)}"
            console.print(f"[bold red]✗ Validation Error:[/bold red] {error_msg}")
            return jsonify({"error": error_msg, "request_id": request_id}), 400
        
        # Extract fields
        topic_name = data.get('topic_name')
        no_of_days = data.get('no_of_days')
        start_date = data.get('start_date')
        daily_hours = data.get('daily_hours')
        
    except Exception as e:
        console.print(f"[bold red]✗ Request Parsing Error:[/bold red] {str(e)}")
        return jsonify({"error": f"Failed to parse request: {str(e)}", "request_id": request_id}), 400

    # 1. Generate study plan with Gemini
    with console.status(f"[bold green]Generating study plan with Gemini for {topic_name}...", spinner="dots") as status:
        prompt = (
            f"Topic: {topic_name}. Number of days: {no_of_days}. Start date: {start_date}. Daily hours: {daily_hours}. "
            + STUDY_PLAN_PROMPT
        )
        
        console.print(f"[dim]API Key configured: {'YES' if os.getenv('GEMINI_API_KEY') else 'NO'}[/dim]")
        console.print(f"[dim cyan]Gemini Prompt:[/dim cyan] {prompt}")
        
        start = time.time()
        try:
            plan_str = call_gemini(prompt)
            elapsed = time.time() - start
            
            # Clean and parse the response
            cleaned = re.sub(r'^```(?:json)?\s*|\s*```$', '', plan_str.strip(), flags=re.IGNORECASE | re.MULTILINE).strip()
            console.print(f"[green]✓ Gemini API response received[/green] [dim]({elapsed:.2f}s)[/dim]")
            
            try:
                plan = json.loads(cleaned)
                # Display the plan in a table
                plan_table = Table(title=f"Study Plan for {topic_name}")
                plan_table.add_column("Date", style="cyan")
                plan_table.add_column("Subtopic", style="green")
                
                for date, subtopic in plan.items():
                    plan_table.add_row(date, subtopic)
                
                console.print(plan_table)
                
            except json.JSONDecodeError as e:
                console.print(f"[bold red]✗ JSON Parse Error:[/bold red] {str(e)}")
                console.print(f"[bold red]Raw response:[/bold red] {cleaned}")
                return jsonify({"error": f"Failed to parse Gemini response: {str(e)}", 
                               "gemini_response": cleaned, 
                               "request_id": request_id}), 500
                
        except Exception as e:
            elapsed = time.time() - start
            console.print(f"[bold red]✗ Gemini API Error[/bold red] [dim]({elapsed:.2f}s)[/dim]: {str(e)}")
            return jsonify({"error": f"Gemini API error: {str(e)}", 
                           "request_id": request_id}), 500

    # 2. Call video fetcher service with proper error handling and visual feedback
    plan_with_videos = plan.copy()  # Default fallback if video fetcher fails
    
    with console.status("[bold yellow]Connecting to Video Fetcher service...", spinner="dots") as status:
        video_fetcher_url = 'http://localhost:5003/fetch_videos'
        request_payload = {
            'topic_name': topic_name,
            'plan': plan,
            'daily_hours': daily_hours,
            'target_days': no_of_days
        }
        
        console.print(f"[dim]Video Fetcher URL:[/dim] {video_fetcher_url}")
        
        # First try a health check
        try:
            health_check = requests.get('http://localhost:5003/health', timeout=5)
            if health_check.status_code == 200:
                console.print("[green]✓ Video Fetcher service is healthy[/green]")
            else:
                console.print(f"[yellow]⚠ Video Fetcher health check returned status {health_check.status_code}[/yellow]")
        except Exception as health_err:
            console.print(f"[yellow]⚠ Video Fetcher health check failed: {str(health_err)}[/yellow]")
        
        # Now make the actual request
        try:
            start = time.time()
            video_resp = requests.post(
                video_fetcher_url,
                json=request_payload,
                timeout=30,
                headers={'Content-Type': 'application/json'}
            )
            elapsed = time.time() - start
            
            video_resp.raise_for_status()
            video_data = video_resp.json()
            
            console.print(f"[green]✓ Video Fetcher response received[/green] [dim]({elapsed:.2f}s)[/dim]")
            
            # Display video results in a table
            video_table = Table(title="Videos Retrieved")
            video_table.add_column("Date", style="cyan")
            video_table.add_column("Subtopic", style="green")
            video_table.add_column("Video Link", style="blue")
            
            plan_with_videos = video_data.get('plan', plan)
            
            for date, value in plan_with_videos.items():
                if isinstance(value, dict):
                    subtopic = value.get('subtopic') or value.get('name') or ''
                    youtube_link = value.get('youtube_link', 'No video found')
                else:
                    subtopic = value
                    youtube_link = 'No video found'
                
                video_table.add_row(date, subtopic, youtube_link)
            
            console.print(video_table)
            
        except requests.exceptions.ConnectionError as e:
            console.print(Panel(
                f"[bold red]Could not connect to Video Fetcher[/bold red]\n"
                f"[yellow]Error:[/yellow] {str(e)}\n\n"
                "[white]Recommendations:[/white]\n"
                "1. Ensure Video Fetcher service is running on port 5003\n"
                "2. Check for network/firewall issues\n"
                "3. Verify the service URL is correct",
                title="Connection Error",
                border_style="red"
            ))
            
        except requests.exceptions.Timeout as e:
            console.print(Panel(
                f"[bold red]Video Fetcher Timeout[/bold red]\n"
                f"[yellow]Error:[/yellow] {str(e)}\n\n"
                "[white]The request timed out after 30 seconds[/white]",
                title="Timeout Error",
                border_style="red"
            ))
            
        except Exception as e:
            console.print(f"[bold red]✗ Video Fetcher Error:[/bold red] {str(e)}")
            if hasattr(e, 'response') and e.response:
                console.print(f"[dim]Response content:[/dim] {e.response.text[:200]}")

    # 3. Process each day's content
    enriched_plan = {}
    
    with Progress(
        SpinnerColumn(),
        TextColumn("[bold blue]{task.description}"),
        TimeElapsedColumn(),
    ) as progress:
        
        task = progress.add_task(f"[green]Enriching study plan with notes and quizzes...", total=len(plan_with_videos))
        
        for date, value in plan_with_videos.items():
            # Update progress description
            progress.update(task, description=f"[green]Processing day: {date}")
            
            # Extract values
            if isinstance(value, dict):
                subtopic = value.get('subtopic') or value.get('name') or ''
                youtube_link = value.get('youtube_link', 'No video found')
                timestamp = value.get('timestamp', 'No timestamp')
            else:
                subtopic = value
                youtube_link = 'No video found'
                timestamp = 'No timestamp'
            
            # Generate notes for the subtopic
            notes = None
            if subtopic:
                prompt_parts = [
                    "Generate concise study notes (about 150 words) for the following subtopic, focusing ONLY on the segment",
                ]
                if youtube_link and timestamp and youtube_link != 'No video found':
                    prompt_parts.append(f"[{timestamp}] of this YouTube video: {youtube_link}. ")
                prompt_parts.append(f"Subtopic: {subtopic}. Respond ONLY with the notes as a string, no extra explanation.")
                notes_prompt = " ".join(prompt_parts)
                
                for attempt in range(3):
                    try:
                        notes_response = call_gemini(notes_prompt)
                        if notes_response and notes_response.strip() and 'no notes available' not in notes_response.lower():
                            notes = notes_response.strip()
                            break
                    except Exception as e:
                        console.print(f"[yellow]⚠ Notes generation attempt {attempt+1} failed for {subtopic} ({date}): {str(e)}[/yellow]")
                        time.sleep(1)  # Small delay before retry
                
                if not notes:
                    console.print(f"[yellow]⚠ Failed to generate notes for {subtopic} ({date})[/yellow]")
                    notes = 'No notes available.'
            
            # 4. Generate quizzes and assignments
            quizzes = []
            assignments = []
            
            try:
                quiz_resp = requests.post(
                    'http://localhost:5004/generate_quiz_and_assignments',
                    json={
                        'subtopic': subtopic,
                        'timestamp': timestamp,
                        'youtube_link': youtube_link,
                        'study_notes': notes
                    },
                    timeout=30,
                    headers={'Content-Type': 'application/json'}
                )
                
                quiz_data = quiz_resp.json()
                quizzes = quiz_data.get('quizzes', [])
                assignments = quiz_data.get('assignments', [])
                
            except Exception as e:
                console.print(f"[yellow]⚠ Quiz generation failed for {subtopic} ({date}): {str(e)}[/yellow]")
            
            # Build enriched entry
            enriched_plan[date] = {
                'subtopic': subtopic,
                'youtube_link': youtube_link,
                'timestamp': timestamp,
                'notes': notes,
                'quizzes': quizzes if quizzes else [],
                'assignments': assignments if assignments else []
            }
            
            # Update progress
            progress.update(task, advance=1)

    # Format the final response
    response = {
        'status': 'success',
        'topic_name': topic_name,
        'no_of_days': no_of_days,
        'start_date': start_date,
        'daily_hours': daily_hours,
        'plan': enriched_plan,
        'request_id': request_id,
        'generated_at': datetime.now().isoformat()
    }

    # Save to MongoDB with proper error handling
    if learning_paths_collection is not None:
        console.print(f"[yellow]Saving learning path to MongoDB...[/yellow]")
        response['created_at'] = datetime.now().isoformat()
        response['updated_at'] = datetime.now().isoformat()
        response['request_id'] = request_id
        response['topic_name'] = topic_name
        response['no_of_days'] = no_of_days
        response['start_date'] = start_date
        response['daily_hours'] = daily_hours
        response['plan'] = enriched_plan
        response['status'] = 'success'
        response['request_id'] = request_id
        try:
            with console.status("[bold green]Saving to MongoDB...", spinner="dots") as status:
                result = learning_paths_collection.insert_one(response)
                response['_id'] = str(result.inserted_id)
                console.print(f"[bold green]✓ Learning path saved to MongoDB[/bold green] [dim](ID: {result.inserted_id})[/dim]")
        except OperationFailure as e:
            console.print(f"[bold red]✗ MongoDB Operation Failed:[/bold red] {str(e)}")
            return jsonify({"error": f"Failed to save to MongoDB: {str(e)}", "request_id": request_id}), 500
        except Exception as e:
            console.print(f"[bold red]✗ MongoDB Error:[/bold red] {str(e)}")
            return jsonify({"error": f"Database error: {str(e)}", "request_id": request_id}), 500
    else:
        console.print("[yellow]⚠ MongoDB not available, skipping database save[/yellow]")

    # Print response summary
    console.print(Panel.fit(
        f"[bold green]✓ Study plan generation complete[/bold green]\n" +
        f"[cyan]Topic:[/cyan] {topic_name}\n" +
        f"[cyan]Days:[/cyan] {no_of_days}\n" +
        f"[cyan]Daily Hours:[/cyan] {daily_hours}\n" +
        f"[cyan]MongoDB ID:[/cyan] {response.get('_id', 'Not saved')}",
        title=f"Response Summary (ID: {request_id})",
        border_style="green"
    ))

    return jsonify(response)

if __name__ == '__main__':
    print_banner()
    console.print(f"[bold green]Starting MCP Server on port 5001...[/bold green]")
    app.run(host='0.0.0.0', port=5001, debug=True)