#!/bin/bash

# Development with ngrok - Auto-updates bot URL
# Starts Vite + ngrok and configures bot automatically

set -e

echo "TMA Development with ngrok"
echo "=========================="
echo ""

# Load environment
ENV_FILE=${ENV_FILE:-.env.development}
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
  echo "Loaded environment from $ENV_FILE"
fi

if [ -z "$BOT_TOKEN" ]; then
  echo "Error: BOT_TOKEN not found in $ENV_FILE"
  exit 1
fi

# Check ngrok is installed
if ! command -v ngrok &> /dev/null; then
  echo "Error: ngrok not installed"
  echo "Install: brew install ngrok"
  exit 1
fi

# Cleanup on exit
cleanup() {
  echo ""
  echo "Shutting down..."
  kill $VITE_PID 2>/dev/null || true
  kill $NGROK_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM

# Start Vite dev server
echo "Starting Vite dev server..."
npx vite --host &
VITE_PID=$!
sleep 3

# Start ngrok
echo "Starting ngrok tunnel..."
ngrok http 5173 --log=stdout > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!
sleep 3

# Get ngrok URL from API
echo "Getting ngrok URL..."
for i in {1..10}; do
  NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | cut -d'"' -f4 | head -1)
  if [ -n "$NGROK_URL" ]; then
    break
  fi
  sleep 1
done

if [ -z "$NGROK_URL" ]; then
  echo "Error: Could not get ngrok URL"
  echo "Check ngrok status: http://localhost:4040"
  cleanup
  exit 1
fi

echo ""
echo "ngrok URL: $NGROK_URL"

# Update bot menu button
echo ""
echo "Updating bot menu button..."
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d "{
    \"menu_button\": {
      \"type\": \"web_app\",
      \"text\": \"Open App\",
      \"web_app\": {\"url\": \"${NGROK_URL}\"}
    }
  }")

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "Bot updated successfully!"
else
  echo "Warning: Failed to update bot"
  echo "$RESPONSE"
fi

echo ""
echo "========================================"
echo "Ready! Open your bot in Telegram"
echo "ngrok URL: $NGROK_URL"
echo "ngrok inspector: http://localhost:4040"
echo "Press Ctrl+C to stop"
echo "========================================"
echo ""

# Wait for processes
wait $VITE_PID
