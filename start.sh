#!/usr/bin/env bash
# Agentic-OS — start the bot
set -e

if [ -d ".venv" ]; then
  source .venv/bin/activate
fi

if [ ! -f ".env" ]; then
  echo "ERROR: .env not found. Run install.sh first."
  exit 1
fi

MODE="${1:-testnet}"

if [ "$MODE" = "live" ]; then
  echo "Starting in LIVE trading mode — real money at risk!"
  python main.py --mode continuous
else
  echo "Starting in TESTNET (paper trading) mode"
  python main.py --test --mode continuous
fi
