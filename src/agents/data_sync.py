"""DataSyncAgent — fetches multi-timeframe klines concurrently."""

import asyncio
from loguru import logger
from src.api import binance_client as bc
from src.data.processor import klines_to_df, add_indicators


class DataSyncAgent:
    def __init__(self, client, symbol: str, timeframes: list[str]):
        self.client = client
        self.symbol = symbol
        self.timeframes = timeframes
        self.data: dict = {}

    def sync(self) -> dict:
        for tf in self.timeframes:
            raw = bc.get_klines(self.client, self.symbol, tf, limit=200)
            df = klines_to_df(raw)
            df = add_indicators(df)
            self.data[tf] = df
            logger.debug(f"DataSync {self.symbol}/{tf}: {len(df)} rows")
        return self.data
