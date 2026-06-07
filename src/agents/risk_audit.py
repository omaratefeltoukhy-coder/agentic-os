"""RiskAuditAgent — final veto before any order is sent."""

from loguru import logger
from src.risk.manager import RiskManager


class RiskAuditAgent:
    def __init__(self, risk_manager: RiskManager):
        self.rm = risk_manager

    def audit(
        self,
        decision: dict,
        balance: float,
        entry_price: float,
        leverage: int,
    ) -> tuple[bool, float, str]:
        """
        Returns (approved, quantity, reason).
        quantity is 0 when not approved.
        """
        action = decision.get("action", "STAY_OUT")
        confidence = decision.get("confidence", 0.0)

        if action == "STAY_OUT":
            return False, 0.0, "LLM chose STAY_OUT"

        if confidence < 0.55:
            return False, 0.0, f"Confidence too low ({confidence:.2f})"

        qty = self.rm.calc_position_size(balance, entry_price, leverage)
        if qty <= 0:
            return False, 0.0, "Calculated quantity is zero"

        approved, reason = self.rm.approve_trade(balance, qty * entry_price / leverage)
        if not approved:
            return False, 0.0, reason

        logger.info(f"RiskAudit approved: {action} qty={qty} @ {entry_price}")
        return True, qty, "approved"
