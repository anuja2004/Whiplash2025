# Use an official Python image as the base image
FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements.txt and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application code
COPY . .

# Set PYTHONPATH so Python can find modules like 'common'
ENV PYTHONPATH=/app

# Expose the application ports
EXPOSE 5001 5002 5003 5004

# Run the application (you can specify the port to run each service based on its role)
CMD ["python3", "mcp_server/app.py"]
