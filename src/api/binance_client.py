"""Binance exchange client with testnet support."""

import os
from binance.client import Client
from binance.exceptions import BinanceAPIException
from loguru import logger


def get_client() -> Client:
    testnet = os.getenv("BINANCE_TESTNET", "true").lower() == "true"
    if testnet:
        api_key = os.getenv("BINANCE_TESTNET_API_KEY", "")
        secret = os.getenv("BINANCE_TESTNET_SECRET_KEY", "")
        client = Client(api_key, secret, testnet=True)
        logger.info("Connected to Binance TESTNET")
    else:
        api_key = os.environ["BINANCE_API_KEY"]
        secret = os.environ["BINANCE_SECRET_KEY"]
        client = Client(api_key, secret)
        logger.info("Connected to Binance LIVE")
    return client


def get_klines(client: Client, symbol: str, interval: str, limit: int = 200) -> list:
    try:
        return client.futures_klines(symbol=symbol, interval=interval, limit=limit)
    except BinanceAPIException as e:
        logger.error(f"Klines error {symbol}/{interval}: {e}")
        return []


def get_balance(client: Client) -> float:
    """Return available USDT balance in futures wallet."""
    try:
        balances = client.futures_account_balance()
        for b in balances:
            if b["asset"] == "USDT":
                return float(b["availableBalance"])
    except BinanceAPIException as e:
        logger.error(f"Balance error: {e}")
    return 0.0


def place_order(
    client: Client,
    symbol: str,
    side: str,  # "BUY" or "SELL"
    quantity: float,
    order_type: str = "MARKET",
) -> dict | None:
    try:
        order = client.futures_create_order(
            symbol=symbol,
            side=side,
            type=order_type,
            quantity=quantity,
        )
        logger.info(f"Order placed: {side} {quantity} {symbol} — id={order['orderId']}")
        return order
    except BinanceAPIException as e:
        logger.error(f"Order error: {e}")
        return None


def set_leverage(client: Client, symbol: str, leverage: int) -> None:
    try:
        client.futures_change_leverage(symbol=symbol, leverage=leverage)
    except BinanceAPIException as e:
        logger.warning(f"Leverage error {symbol}: {e}")


def get_position(client: Client, symbol: str) -> dict | None:
    try:
        positions = client.futures_position_information(symbol=symbol)
        for p in positions:
            if float(p["positionAmt"]) != 0:
                return p
    except BinanceAPIException as e:
        logger.error(f"Position error: {e}")
    return None
