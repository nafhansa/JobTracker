#!/bin/bash
# Start the JobSpy FastAPI service
# Usage: ./start.sh [port]

PORT="${1:-8000}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
VENV_DIR="$PROJECT_DIR/.venv"

if [ -f "$VENV_DIR/bin/uvicorn" ]; then
    echo "Starting JobSpy service on port $PORT (using project venv)"
    cd "$SCRIPT_DIR"
    "$VENV_DIR/bin/uvicorn" main:app --host 0.0.0.0 --port "$PORT" --reload
else
    echo "Virtual environment not found at $VENV_DIR"
    echo ""
    echo "Setup instructions:"
    echo "  cd $PROJECT_DIR"
    echo "  python3 -m venv .venv"
    echo "  source .venv/bin/activate"
    echo "  cd jobspy-service"
    echo "  pip install -r requirements.txt"
    exit 1
fi