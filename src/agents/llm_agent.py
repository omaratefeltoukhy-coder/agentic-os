"""LLMAgent — asks Kimi K2.6 to produce a final trade decision."""

import json
from loguru import logger
from src.llm import kimi_provider
from src.data.processor import format_for_llm
from src.agents.quant_analyst import QuantSignal


DECISION_PROMPT = """
You are a disciplined algorithmic trading agent. Based on the market data and
quant signals below, decide whether to LONG, SHORT, or STAY_OUT.

Respond ONLY with valid JSON in this exact format:
{{
  "action": "LONG" | "SHORT" | "STAY_OUT",
  "confidence": 0.0-1.0,
  "reason": "one-sentence rationale",
  "stop_loss_pct": 0.01-0.05,
  "take_profit_pct": 0.02-0.10
}}

Quant signals:
{quant_summary}

Multi-timeframe price & indicator data:
{market_data}
"""


class LLMAgent:
    def __init__(self, config: dict | None = None):
        self.config = config or {}

    def decide(self, market_data: dict, quant_signal: QuantSignal) -> dict:
        # Build compact market context from the primary timeframe
        primary_tf = "15m" if "15m" in market_data else next(iter(market_data))
        df = market_data[primary_tf]
        ctx = format_for_llm(df, rows=30)

        prompt = DECISION_PROMPT.format(
            quant_summary=quant_signal.summary,
            market_data=ctx,
        )
        try:
            raw = kimi_provider.analyze_market(context="", task=prompt)
            # Strip markdown fences if present
            raw = raw.strip().lstrip("```json").lstrip("```").rstrip("```").strip()
            decision = json.loads(raw)
            logger.info(f"Kimi decision: {decision}")
            return decision
        except Exception as e:
            logger.error(f"LLMAgent error: {e}")
            return {"action": "STAY_OUT", "confidence": 0.0, "reason": str(e)}
