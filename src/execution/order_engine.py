"""OrderEngine — places orders and sets SL/TP."""

import os
from loguru import logger
from src.api import binance_client as bc


class OrderEngine:
    def __init__(self, client, config: dict):
        self.client = client
        self.leverage = config.get("leverage", 5)
        self.stop_loss_pct = config.get("stop_loss_pct", 0.02)
        self.take_profit_pct = config.get("take_profit_pct", 0.04)

    def execute(
        self,
        symbol: str,
        action: str,  # "LONG" or "SHORT"
        quantity: float,
        entry_price: float,
        decision: dict,
    ) -> dict:
        side = "BUY" if action == "LONG" else "SELL"
        bc.set_leverage(self.client, symbol, self.leverage)

        order = bc.place_order(self.client, symbol, side, quantity)
        if not order:
            return {"status": "failed"}

        sl_pct = decision.get("stop_loss_pct", self.stop_loss_pct)
        tp_pct = decision.get("take_profit_pct", self.take_profit_pct)

        if action == "LONG":
            sl_price = round(entry_price * (1 - sl_pct), 2)
            tp_price = round(entry_price * (1 + tp_pct), 2)
            sl_side = "SELL"
        else:
            sl_price = round(entry_price * (1 + sl_pct), 2)
            tp_price = round(entry_price * (1 - tp_pct), 2)
            sl_side = "BUY"

        self._place_sl_tp(symbol, sl_side, quantity, sl_price, tp_price)

        return {
            "status": "filled",
            "action": action,
            "symbol": symbol,
            "quantity": quantity,
            "entry": entry_price,
            "sl": sl_price,
            "tp": tp_price,
            "order_id": order.get("orderId"),
        }

    def _place_sl_tp(
        self, symbol: str, side: str, quantity: float, sl: float, tp: float
    ) -> None:
        client = self.client
        try:
            client.futures_create_order(
                symbol=symbol,
                side=side,
                type="STOP_MARKET",
                stopPrice=sl,
                quantity=quantity,
                reduceOnly=True,
            )
        except Exception as e:
            logger.warning(f"SL order failed: {e}")

        try:
            client.futures_create_order(
                symbol=symbol,
                side=side,
                type="TAKE_PROFIT_MARKET",
                stopPrice=tp,
                quantity=quantity,
                reduceOnly=True,
            )
        except Exception as e:
            logger.warning(f"TP order failed: {e}")
