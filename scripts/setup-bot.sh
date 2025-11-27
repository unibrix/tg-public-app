#!/bin/bash

# Telegram Mini App - Bot Setup Script
# Configures the bot's menu button to open your Mini App
# Safe to run multiple times (idempotent)

set -e

echo "Telegram Mini App - Bot Setup"
echo "=============================="
echo ""

# Load environment file (production by default)
ENV_FILE=${ENV_FILE:-.env.production}
if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
  echo "Loaded environment from $ENV_FILE"
fi

# Use args if provided, otherwise fall back to env vars
BOT_TOKEN=${1:-$BOT_TOKEN}
VITE_APP_URL=${2:-$VITE_APP_URL}

# Validate required variables
if [ -z "$BOT_TOKEN" ]; then
  echo "Error: BOT_TOKEN is required"
  echo ""
  echo "Usage: ./scripts/setup-bot.sh [BOT_TOKEN] [VITE_APP_URL]"
  echo ""
  echo "Setup:"
  echo "  1. Copy .env.example to .env.production"
  echo "  2. Add your BOT_TOKEN and VITE_APP_URL"
  echo "  3. Run: ./scripts/setup-bot.sh"
  echo ""
  echo "Get BOT_TOKEN from @BotFather on Telegram"
  exit 1
fi

if [ -z "$VITE_APP_URL" ]; then
  echo "Error: VITE_APP_URL is required"
  echo ""
  echo "Usage: ./scripts/setup-bot.sh [BOT_TOKEN] [VITE_APP_URL]"
  echo ""
  echo "VITE_APP_URL is your deployed app URL, e.g.:"
  echo "  https://username.github.io/repo-name/"
  exit 1
fi

echo "Bot Token: ${BOT_TOKEN:0:10}..."
echo "App URL: $VITE_APP_URL"
echo ""

# Get bot info first
echo "Checking bot..."
BOT_INFO=$(curl -s "https://api.telegram.org/bot${BOT_TOKEN}/getMe")
if echo "$BOT_INFO" | grep -q '"ok":true'; then
  BOT_NAME=$(echo "$BOT_INFO" | grep -o '"first_name":"[^"]*"' | cut -d'"' -f4)
  BOT_USERNAME=$(echo "$BOT_INFO" | grep -o '"username":"[^"]*"' | cut -d'"' -f4)
  echo "Bot: $BOT_NAME (@$BOT_USERNAME)"
else
  echo "Error: Invalid bot token"
  echo "$BOT_INFO"
  exit 1
fi

# Set the menu button
echo ""
echo "Setting menu button..."
RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot${BOT_TOKEN}/setChatMenuButton" \
  -H "Content-Type: application/json" \
  -d "{
    \"menu_button\": {
      \"type\": \"web_app\",
      \"text\": \"Open App\",
      \"web_app\": {\"url\": \"${VITE_APP_URL}\"}
    }
  }")

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo ""
  echo "Done! Menu button configured."
  echo ""
  echo "Open Telegram and search for @$BOT_USERNAME"
  echo "Click the menu button to open your app"
else
  echo ""
  echo "Error: Failed to set menu button"
  echo "$RESPONSE"
  exit 1
fi
