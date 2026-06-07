# agentic-os — Kimi K2.6 + Hermes Automated Trading Bot

A multi-agent cryptocurrency trading bot powered by **Kimi K2.6** as the AI brain and **Hermes Agent** for automation and scheduling.

## Architecture

```
Market Data → DataSyncAgent
                    ↓
            QuantAnalystAgent  (rule-based indicators)
                    ↓
              LLMAgent (Kimi K2.6) ← asks AI for LONG/SHORT/STAY_OUT
                    ↓
             RiskAuditAgent  (veto if exposure too high)
                    ↓
              OrderEngine  → Binance Futures
```

## Quick Start

### 1. Install

```bash
chmod +x install.sh
./install.sh
```

### 2. Configure — things YOU need to fill in

Edit `.env`:

```env
# Required
KIMI_API_KEY=sk-your-key-here          # from platform.kimi.ai
BINANCE_TESTNET_API_KEY=your-key       # from testnet.binancefuture.com
BINANCE_TESTNET_SECRET_KEY=your-secret

# When ready for live trading
BINANCE_API_KEY=your-live-key
BINANCE_SECRET_KEY=your-live-secret
BINANCE_TESTNET=false
```

### 3. Run (paper trading)

```bash
source .venv/bin/activate

# Simple CLI
python simple_cli.py --test --symbol BTCUSDT --interval 60

# With web dashboard at http://localhost:8000
python main.py --test
```

### 4. Backtest

```bash
python backtest.py --symbol BTCUSDT --timeframe 15m --days 14
```

### 5. Hermes Integration

The `hermes/skills/` folder contains two Hermes skills:

| Skill | What it does |
|-------|--------------|
| `run_trading_cycle` | One full Kimi decision cycle |
| `daily_report` | Morning market brief from Kimi K2.6 |

To install them into Hermes:
```bash
mkdir -p ~/.hermes/skills/agentic-os
cp hermes/skills/*.py ~/.hermes/skills/agentic-os/
```

Then in the Hermes CLI:
```
hermes> run skill run_trading_cycle symbol=BTCUSDT
hermes> run skill daily_report
```

To schedule them automatically, merge `hermes/config.yaml` into `~/.hermes/config.yaml`.

## Risk Controls

- Stop-loss per trade: **2%** (configurable)
- Take-profit: **4%** (configurable)
- Max position: **1.5% of balance at risk** per trade
- Circuit breakers: halts after 5 consecutive losses or 15% drawdown
- **Always start with `BINANCE_TESTNET=true`**

## Project Structure

```
agentic-os/
├── src/
│   ├── llm/kimi_provider.py      <- Kimi K2.6 API calls
│   ├── agents/
│   │   ├── data_sync.py          <- fetches klines
│   │   ├── quant_analyst.py      <- technical analysis
│   │   ├── llm_agent.py          <- Kimi decision maker
│   │   └── risk_audit.py         <- veto layer
│   ├── execution/order_engine.py <- places orders + SL/TP
│   ├── risk/manager.py           <- position sizing + circuit breakers
│   └── strategy/decision.py      <- orchestrator
├── hermes/
│   ├── config.yaml               <- Hermes provider + schedule config
│   └── skills/                   <- installable Hermes skills
├── simple_cli.py                 <- headless CLI
├── main.py                       <- web dashboard mode
├── backtest.py                   <- historical replay
├── install.sh                    <- one-shot installer
└── .env.example                  <- copy to .env and fill in keys
```

## What You Need To Do

Only two things require your manual action:

1. **Get a Kimi API key** from platform.kimi.ai — paste into `.env` as `KIMI_API_KEY`
2. **Get Binance testnet keys** from testnet.binancefuture.com — paste into `.env` as `BINANCE_TESTNET_API_KEY` / `BINANCE_TESTNET_SECRET_KEY`

Everything else is already set up in this repo.
