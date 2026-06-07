"""DecisionCore — orchestrates all agents and produces a final trade signal."""

from loguru import logger
from src.agents.data_sync import DataSyncAgent
from src.agents.quant_analyst import QuantAnalystAgent
from src.agents.llm_agent import LLMAgent
from src.agents.risk_audit import RiskAuditAgent
from src.execution.order_engine import OrderEngine
from src.risk.manager import RiskManager
from src.api import binance_client as bc


class DecisionCore:
    def __init__(self, client, config: dict):
        self.client = client
        self.config = config
        trading_cfg = config.get("trading", {})
        risk_cfg = config.get("risk", {})

        self.symbol = trading_cfg.get("symbol", "BTCUSDT")
        self.timeframes = trading_cfg.get("timeframes", ["5m", "15m", "1h"])
        self.leverage = trading_cfg.get("leverage", 5)

        self.risk_mgr = RiskManager(risk_cfg)
        self.data_agent = DataSyncAgent(client, self.symbol, self.timeframes)
        self.quant_agent = QuantAnalystAgent()
        self.llm_agent = LLMAgent(config.get("llm", {}))
        self.risk_audit = RiskAuditAgent(self.risk_mgr)
        self.order_engine = OrderEngine(client, {**risk_cfg, "leverage": self.leverage})

    def run_cycle(self) -> dict:
        """One full decision cycle. Returns a result dict."""
        logger.info(f"=== Decision cycle: {self.symbol} ===")

        # 1. Fetch market data
        market_data = self.data_agent.sync()

        # 2. Quant analysis
        quant_signal = self.quant_agent.analyze(market_data)
        logger.info(f"Quant: {quant_signal.summary}")

        # 3. Kimi K2.6 LLM decision
        decision = self.llm_agent.decide(market_data, quant_signal)

        # 4. Get current price and balance
        ticker = self.client.futures_symbol_ticker(symbol=self.symbol)
        entry_price = float(ticker["price"])
        balance = bc.get_balance(self.client)

        # 5. Risk audit
        approved, qty, reason = self.risk_audit.audit(
            decision, balance, entry_price, self.leverage
        )
        if not approved:
            logger.info(f"Trade rejected: {reason}")
            return {"action": "STAY_OUT", "reason": reason, "quant": quant_signal.summary}

        # 6. Execute
        result = self.order_engine.execute(
            self.symbol, decision["action"], qty, entry_price, decision
        )
        return {**result, "quant": quant_signal.summary, "llm": decision}
