#!/usr/bin/env python3
"""
Agentic-OS Trading Bot — web dashboard entry point.

Usage:
    python main.py                        # live mode
    python main.py --test                 # paper trading
    python main.py --test --headless      # no dashboard, just logs
"""

import argparse
import os
import threading
import time
from dotenv import load_dotenv
import yaml
from loguru import logger

load_dotenv()


def parse_args():
    p = argparse.ArgumentParser()
    p.add_argument("--test", action="store_true")
    p.add_argument("--headless", action="store_true")
    p.add_argument("--mode", choices=["continuous", "once"], default="continuous")
    p.add_argument("--interval", type=int, default=60)
    p.add_argument("--config", default="config.yaml")
    return p.parse_args()


def load_config(path: str) -> dict:
    if os.path.exists(path):
        with open(path) as f:
            return yaml.safe_load(f) or {}
    return {}


def trading_loop(core, interval: int, stop_event: threading.Event):
    while not stop_event.is_set():
        try:
            result = core.run_cycle()
            logger.info(f"Cycle result: {result}")
        except Exception as e:
            logger.error(f"Cycle error: {e}")
        stop_event.wait(interval)


def main():
    args = parse_args()
    config = load_config(args.config)

    if args.test:
        os.environ["BINANCE_TESTNET"] = "true"

    from src.api import binance_client as bc
    from src.strategy.decision import DecisionCore

    client = bc.get_client()
    core = DecisionCore(client, config)

    if args.mode == "once":
        result = core.run_cycle()
        logger.info(f"Result: {result}")
        return

    stop_event = threading.Event()
    trader = threading.Thread(
        target=trading_loop,
        args=(core, args.interval, stop_event),
        daemon=True,
    )
    trader.start()

    if args.headless:
        logger.info("Running in headless mode. Ctrl+C to stop.")
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            stop_event.set()
    else:
        from dashboard import create_app
        app = create_app(core)
        import uvicorn
        port = int(os.getenv("DASHBOARD_PORT", 8000))
        logger.info(f"Dashboard: http://localhost:{port}")
        uvicorn.run(app, host="0.0.0.0", port=port)
        stop_event.set()


if __name__ == "__main__":
    main()
