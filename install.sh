#!/usr/bin/env bash
# Agentic-OS — one-shot installer
set -e

echo "=== Agentic-OS Trading Bot Installer ==="

# 1. Check Python
if ! command -v python3 &>/dev/null; then
  echo "ERROR: python3 not found. Install Python 3.11+ first."
  exit 1
fi
PYTHON_VERSION=$(python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')")
echo "Python $PYTHON_VERSION detected"

# 2. Virtual environment
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  echo "Virtual environment created"
fi
source .venv/bin/activate

# 3. Dependencies
pip install --upgrade pip -q
pip install -r requirements.txt -q
echo "Dependencies installed"

# 4. Config files
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo ""
  echo ">>> .env created from template. EDIT IT NOW with your API keys! <<<"
  echo ""
fi

if [ ! -f "config.yaml" ]; then
  cp config.example.yaml config.yaml
  echo "config.yaml created"
fi

# 5. Hermes skills (optional)
HERMES_SKILLS_DIR="$HOME/.hermes/skills/agentic-os"
if command -v hermes &>/dev/null; then
  mkdir -p "$HERMES_SKILLS_DIR"
  cp hermes/skills/*.py "$HERMES_SKILLS_DIR/"
  echo "Hermes skills installed to $HERMES_SKILLS_DIR"
  echo "Tip: merge hermes/config.yaml into ~/.hermes/config.yaml to enable auto-scheduling"
else
  echo "Hermes not found in PATH — skip skill installation"
fi

echo ""
echo "=== Installation complete ==="
echo "Next steps:"
echo "  1. Edit .env with your Kimi API key and Binance keys"
echo "  2. source .venv/bin/activate"
echo "  3. python simple_cli.py --test         # paper trading"
echo "  4. python main.py --test               # with web dashboard"
echo ""
