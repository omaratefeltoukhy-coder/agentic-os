#!/usr/bin/env python3
"""
Agentic-OS — simple backtesting script.
Replays historical klines through the quant + Kimi decision pipeline.

Usage:
    python backtest.py --symbol BTCUSDT --timeframe 15m --days 30
"""

import argparse
import os
import json
from datetime import datetime, timedelta
from dotenv import load_dotenv
from loguru import logger
from rich.console import Console
from rich.table import Table

load_dotenv()

console = Console()


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--symbol", default="BTCUSDT")
    p.add_argument("--timeframe", default="15m")
    p.add_argument("--days", type=int, default=7)
    p.add_argument("--config", default="config.yaml")
    return p.parse_args()


def main():
    args = parse_args()
    os.environ["BINANCE_TESTNET"] = "true"

    from src.api import binance_client as bc
    from src.data.processor import klines_to_df, add_indicators
    from src.agents.quant_analyst import QuantAnalystAgent
    from src.agents.llm_agent import LLMAgent
    from src.risk.manager import RiskManager

    client = bc.get_client()
    limit = args.days * 24 * 4   # approximate for 15m candles
    raw = bc.get_klines(client, args.symbol, args.timeframe, limit=min(limit, 1000))
    df = add_indicators(klines_to_df(raw))

    if df.empty:
        console.print("[red]No data retrieved[/red]")
        return

    quant = QuantAnalystAgent()
    llm = LLMAgent()
    risk = RiskManager({"max_loss_per_trade": 0.015, "max_total_exposure": 0.333})

    results = []
    balance = 1000.0
    window = 50

    for i in range(window, len(df) - 1, 10):
        slice_df = df.iloc[:i]
        data = {args.timeframe: slice_df}
        signal = quant.analyze(data)
        decision = llm.decide(data, signal)

        action = decision.get("action", "STAY_OUT")
        if action == "STAY_OUT":
            continue

        entry = float(slice_df.iloc[-1]["close"])
        sl_pct = decision.get("stop_loss_pct", 0.02)
        tp_pct = decision.get("take_profit_pct", 0.04)
        next_close = float(df.iloc[i + 1]["close"])
        change = (next_close - entry) / entry

        if action == "LONG":
            pnl_pct = change
        else:
            pnl_pct = -change

        pnl = balance * 0.015 * (pnl_pct / sl_pct)
        balance += pnl
        results.append({
            "time": str(slice_df.index[-1]),
            "action": action,
            "entry": entry,
            "next": next_close,
            "pnl": round(pnl, 2),
            "balance": round(balance, 2),
        })

    if not results:
        console.print("[yellow]No trades generated[/yellow]")
        return

    table = Table(title=f"Backtest: {args.symbol} {args.timeframe} {args.days}d")
    for col in ["time", "action", "entry", "next", "pnl", "balance"]:
        table.add_column(col)
    for r in results[-20:]:
        color = "green" if r["pnl"] > 0 else "red"
        table.add_row(*[f"[{color}]{r[k]}[/{color}]" for k in ["time", "action", "entry", "next", "pnl", "balance"]])
    console.print(table)

    wins = sum(1 for r in results if r["pnl"] > 0)
    console.print(f"\nTotal trades: {len(results)} | Win rate: {wins/len(results)*100:.1f}% | Final balance: ${balance:.2f}")


if __name__ == "__main__":
    main()
