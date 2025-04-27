#!/bin/bash
# Script to run all microservices in background with correct PYTHONPATH

BASEDIR=$(dirname "$0")
cd "$BASEDIR"

export PYTHONPATH=.

nohup python3 mcp_server/app.py > mcp_server.log 2>&1 &
echo "Started MCP Server (Flask)"

nohup python3 video_fetcher/app.py > video_fetcher.log 2>&1 &
echo "Started Video Fetcher"

nohup python3 material_generator/app.py > material_generator.log 2>&1 &
echo "Started Material Generator"

nohup python3 quiz_generator/app.py > quiz_generator.log 2>&1 &
echo "Started Quiz Generator"

# To stop all: pkill -f mcp_server/app.py; pkill -f video_fetcher/app.py; pkill -f material_generator/app.py; pkill -f quiz_generator/app.py