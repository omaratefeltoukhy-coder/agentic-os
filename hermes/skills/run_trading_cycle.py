"""
Hermes skill: run_trading_cycle
Triggers one full Kimi K2.6 decision cycle and returns the result.

Install into Hermes:
    cp hermes/skills/run_trading_cycle.py ~/.hermes/skills/agentic-os/
"""

import os
import sys
import json

# Add the project root so we can import src/
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

import yaml
from src.api import binance_client as bc
from src.strategy.decision import DecisionCore


SKILL_META = {
    "name": "run_trading_cycle",
    "description": (
        "Run one full Kimi K2.6 + Hermes trading analysis cycle for a given symbol. "
        "Fetches market data, runs quant analysis, asks Kimi for a trade decision, "
        "audits risk, and optionally executes an order."
    ),
    "parameters": {
        "symbol": {"type": "string", "default": "BTCUSDT"},
        "mode": {"type": "string", "enum": ["testnet", "live"], "default": "testnet"},
    },
}


def run(symbol: str = "BTCUSDT", mode: str = "testnet") -> dict:
    if mode == "testnet":
        os.environ["BINANCE_TESTNET"] = "true"

    config_path = os.path.join(PROJECT_ROOT, "config.yaml")
    config = {}
    if os.path.exists(config_path):
        with open(config_path) as f:
            config = yaml.safe_load(f) or {}

    config.setdefault("trading", {})["symbol"] = symbol

    client = bc.get_client()
    core = DecisionCore(client, config)
    result = core.run_cycle()
    return result


if __name__ == "__main__":
    result = run()
    print(json.dumps(result, indent=2))
