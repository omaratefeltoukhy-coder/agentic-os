"""
Hermes skill: daily_report
Asks Kimi K2.6 for a morning market brief + bot performance summary.

Install into Hermes:
    cp hermes/skills/daily_report.py ~/.hermes/skills/agentic-os/
"""

import os
import sys
import json
from datetime import datetime, timedelta

PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, PROJECT_ROOT)

from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_ROOT, ".env"))

from src.llm import kimi_provider
from src.api import binance_client as bc
from src.data.processor import klines_to_df, add_indicators, format_for_llm


SKILL_META = {
    "name": "daily_report",
    "description": "Generate a morning market brief for configured symbols using Kimi K2.6.",
    "parameters": {
        "symbols": {"type": "array", "default": ["BTCUSDT", "ETHUSDT"]},
    },
}


def run(symbols: list = None) -> dict:
    if symbols is None:
        symbols = ["BTCUSDT", "ETHUSDT"]

    client = bc.get_client()
    reports = {}

    for sym in symbols:
        from src.api.binance_client import get_klines
        raw = get_klines(client, sym, "1h", limit=24)
        df = add_indicators(klines_to_df(raw))
        ctx = format_for_llm(df, rows=24)

        analysis = kimi_provider.analyze_market(
            context=ctx,
            task=(
                f"Provide a concise morning market brief for {sym}. "
                "Include: trend direction, key levels, potential setups, "
                "and risk factors. Keep it under 150 words. "
                "Respond in plain text, not JSON."
            ),
        )
        reports[sym] = analysis

    return {
        "date": datetime.utcnow().strftime("%Y-%m-%d"),
        "reports": reports,
    }


if __name__ == "__main__":
    result = run()
    for sym, report in result["reports"].items():
        print(f"\n=== {sym} ===\n{report}")
