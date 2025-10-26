#!/bin/bash
# Start the FastAPI backend server

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Agentic Document Manager Backend${NC}"

# Check if .env exists
if [ ! -f ../.env ]; then
    echo -e "${YELLOW}Warning: ../.env not found. Using .env.example values.${NC}"
    if [ -f ../.env.example ]; then
        cp ../.env.example ../.env
        echo -e "${GREEN}Copied .env.example to .env${NC}"
    else
        echo -e "${YELLOW}Warning: No .env.example found either. Please create ../.env${NC}"
    fi
fi

# Activate virtual environment if it exists
if [ -d ".venv" ]; then
    echo -e "${GREEN}Activating virtual environment...${NC}"
    source .venv/bin/activate
else
    echo -e "${YELLOW}Virtual environment not found. Run: python -m venv .venv${NC}"
fi

# Load environment variables
if [ -f ../.env ]; then
    echo -e "${GREEN}Loading environment variables...${NC}"
    export $(grep -v '^#' ../.env | xargs)
fi

# Check if dependencies are installed
if ! python -c "import fastapi" 2>/dev/null; then
    echo -e "${YELLOW}Dependencies not installed. Run: pip install -r requirements.txt${NC}"
    exit 1
fi

# Start server
echo -e "${GREEN}Starting server on http://localhost:8080${NC}"
echo -e "${GREEN}API docs available at http://localhost:8080/docs${NC}"
uvicorn app.main:app --reload --port 8080

