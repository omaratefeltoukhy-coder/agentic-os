#!/usr/bin/env python3
"""
Agentic-OS Trading Bot — headless CLI mode.

Usage:
    python simple_cli.py --symbol BTCUSDT --interval 60 --test
"""

import argparse
import time
import os
from dotenv import load_dotenv
import yaml
from loguru import logger
from rich.console import Console
from rich.table import Table

load_dotenv()

console = Console()


def parse_args():
    p = argparse.ArgumentParser(description="Agentic-OS trading bot CLI")
    p.add_argument("--symbol", default=os.getenv("TRADING_SYMBOL", "BTCUSDT"))
    p.add_argument("--interval", type=int, default=60, help="Seconds between cycles")
    p.add_argument("--test", action="store_true", help="Paper trading mode")
    p.add_argument("--config", default="config.yaml", help="Config file path")
    return p.parse_args()


def load_config(path: str) -> dict:
    if not os.path.exists(path):
        logger.warning(f"{path} not found, using defaults")
        return {}
    with open(path) as f:
        return yaml.safe_load(f)


def print_result(result: dict) -> None:
    table = Table(title="Cycle Result", show_header=True)
    table.add_column("Key", style="cyan")
    table.add_column("Value", style="green")
    for k, v in result.items():
        table.add_row(str(k), str(v))
    console.print(table)


def main():
    args = parse_args()
    config = load_config(args.config)

    if args.test or os.getenv("BINANCE_TESTNET", "true").lower() == "true":
        os.environ["BINANCE_TESTNET"] = "true"
        console.print("[yellow]Running in TESTNET (paper trading) mode[/yellow]")

    from src.api import binance_client as bc
    from src.strategy.decision import DecisionCore

    client = bc.get_client()
    if args.symbol:
        config.setdefault("trading", {})["symbol"] = args.symbol

    core = DecisionCore(client, config)

    console.print(f"[green]Bot started — {args.symbol} — every {args.interval}s[/green]")
    console.print("Press Ctrl+C to stop\n")

    try:
        while True:
            result = core.run_cycle()
            print_result(result)
            time.sleep(args.interval)
    except KeyboardInterrupt:
        console.print("\n[red]Bot stopped[/red]")


if __name__ == "__main__":
    main()
