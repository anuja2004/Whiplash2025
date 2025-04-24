import socket
from app import create_app
import logging

app = create_app()

def find_free_port(start_port=5000, max_tries=50):
    port = start_port
    for _ in range(max_tries):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("0.0.0.0", port))
                return port
            except OSError:
                port += 1
    raise RuntimeError(f"No free port found in range {start_port}-{port}")

if __name__ == "__main__":
    port = find_free_port()
    logging.basicConfig(level=logging.INFO)
    logging.info(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=True)