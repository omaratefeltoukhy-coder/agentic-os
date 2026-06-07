"""RiskManager — enforces position limits and circuit breakers."""

import os
from dataclasses import dataclass, field
from loguru import logger


@dataclass
class RiskState:
    consecutive_losses: int = 0
    peak_balance: float = 0.0
    total_trades: int = 0
    winning_trades: int = 0
    halted: bool = False
    halt_reason: str = ""


class RiskManager:
    def __init__(self, config: dict):
        self.max_loss_per_trade = config.get("max_loss_per_trade", 0.015)
        self.max_total_exposure = config.get("max_total_exposure", 0.333)
        self.stop_loss_pct = config.get("stop_loss_pct", 0.02)
        self.take_profit_pct = config.get("take_profit_pct", 0.04)
        self.max_consecutive_losses = config.get("max_consecutive_losses", 5)
        self.max_drawdown = config.get("max_drawdown", 0.15)
        self.state = RiskState()

    def approve_trade(self, balance: float, position_size: float) -> tuple[bool, str]:
        if self.state.halted:
            return False, f"Trading halted: {self.state.halt_reason}"

        if self.state.peak_balance == 0:
            self.state.peak_balance = balance

        drawdown = (self.state.peak_balance - balance) / self.state.peak_balance
        if drawdown > self.max_drawdown:
            self._halt(f"Max drawdown breached ({drawdown*100:.1f}%)")
            return False, self.state.halt_reason

        if self.state.consecutive_losses >= self.max_consecutive_losses:
            self._halt(f"{self.state.consecutive_losses} consecutive losses")
            return False, self.state.halt_reason

        exposure = position_size / balance if balance > 0 else 1.0
        if exposure > self.max_total_exposure:
            return False, f"Position too large ({exposure*100:.1f}% > {self.max_total_exposure*100:.1f}%)"

        return True, "OK"

    def calc_position_size(self, balance: float, entry: float, leverage: int) -> float:
        risk_usdt = balance * self.max_loss_per_trade
        stop_distance = entry * self.stop_loss_pct
        if stop_distance == 0:
            return 0.0
        qty = (risk_usdt * leverage) / stop_distance
        return round(qty, 3)

    def record_trade(self, pnl: float, balance: float) -> None:
        self.state.total_trades += 1
        if pnl > 0:
            self.state.winning_trades += 1
            self.state.consecutive_losses = 0
        else:
            self.state.consecutive_losses += 1
        self.state.peak_balance = max(self.state.peak_balance, balance)

    def _halt(self, reason: str) -> None:
        self.state.halted = True
        self.state.halt_reason = reason
        logger.warning(f"Trading HALTED: {reason}")

    def resume(self) -> None:
        self.state.halted = False
        self.state.halt_reason = ""
        self.state.consecutive_losses = 0
        logger.info("Trading resumed manually")

    @property
    def win_rate(self) -> float:
        if self.state.total_trades == 0:
            return 0.0
        return self.state.winning_trades / self.state.total_trades
