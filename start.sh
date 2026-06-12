#!/bin/bash
# JobPilot 一键启动脚本

ROOT="$(cd "$(dirname "$0")" && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
BACKEND_PORT=10320

echo "🚀 Starting JobPilot..."

# Copy .env if not exists
if [ ! -f "$BACKEND/.env" ]; then
  cp "$BACKEND/.env.example" "$BACKEND/.env"
  echo "ℹ️  Created backend/.env from .env.example (default: ollama gemma4:12b)"
fi

# Start backend
echo "▶ Starting FastAPI backend on :$BACKEND_PORT"
cd "$BACKEND"
set -a; source .env; set +a
./venv/bin/uvicorn main:app --reload --port "$BACKEND_PORT" &
BACKEND_PID=$!

# Start frontend
echo "▶ Starting Next.js frontend on :3000"
cd "$FRONTEND"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ JobPilot is running!"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:$BACKEND_PORT"
echo "   API docs: http://localhost:$BACKEND_PORT/docs"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
