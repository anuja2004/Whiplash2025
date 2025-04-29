import subprocess
import socket
import os

# Define microservices with their script paths and ports
SERVICES = [
    {"name": "MCP Server", "path": "mcp_server/app.py", "port": 5001, "log": "mcp_server.log"},
    {"name": "Video Fetcher", "path": "video_fetcher/app.py", "port": 5003, "log": "video_fetcher.log"},
    {"name": "Material Generator", "path": "material_generator/app.py", "port": 5002, "log": "material_generator.log"},
    {"name": "Quiz Generator", "path": "quiz_generator/app.py", "port": 5004, "log": "quiz_generator.log"},
    # Add more if needed
]

BASEDIR = os.path.dirname(os.path.abspath(__file__))


def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(("localhost", port)) == 0


def start_service(service):
    log_path = os.path.join(BASEDIR, service["log"])
    script_path = os.path.join(BASEDIR, service["path"])
    with open(log_path, "a") as logfile:
        # Start the service in the background
        subprocess.Popen([
            "python3", script_path
        ], stdout=logfile, stderr=subprocess.STDOUT, env={**os.environ, "PYTHONPATH": BASEDIR})
    print(f"Started {service['name']} (port {service['port']})")


def main():
    for service in SERVICES:
        if is_port_in_use(service["port"]):
            print(f"{service['name']} already running on port {service['port']}.")
        else:
            start_service(service)

import time
import requests

def wait_for_service(port, retries=20, delay=1):
    for _ in range(retries):
        if is_port_in_use(port):
            return True
        time.sleep(delay)
    return False

def main():
    for service in SERVICES:
        if is_port_in_use(service["port"]):
            print(f"{service['name']} already running on port {service['port']}.")
        else:
            start_service(service)
    # Wait for all services to be up
    print("Waiting for all services to be up...")
    for service in SERVICES:
        if not wait_for_service(service["port"]):
            print(f"Failed to start {service['name']} on port {service['port']}")
            return
    print("All services are running.")

if __name__ == "__main__":
    main()

