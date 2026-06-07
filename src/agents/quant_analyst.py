"""QuantAnalystAgent — rule-based trend score and oscillator generation."""

import pandas as pd
from dataclasses import dataclass


@dataclass
class QuantSignal:
    trend_score: float       # -1.0 (strong bear) to +1.0 (strong bull)
    momentum_score: float    # -1.0 to +1.0
    volatility: float        # normalised ATR
    volume_ratio: float      # current vol / 20-period avg
    summary: str


class QuantAnalystAgent:
    def analyze(self, data: dict) -> QuantSignal:
        """Aggregate signals across all available timeframes."""
        trend_votes = []
        momentum_votes = []
        volatility_vals = []
        volume_vals = []

        for tf, df in data.items():
            if df.empty or len(df) < 5:
                continue
            last = df.iloc[-1]

            # Trend: EMA alignment
            if last["ema_20"] > last["ema_50"] > last["ema_200"]:
                trend_votes.append(1.0)
            elif last["ema_20"] < last["ema_50"] < last["ema_200"]:
                trend_votes.append(-1.0)
            else:
                trend_votes.append(0.0)

            # Momentum: RSI + MACD
            rsi_score = (last["rsi"] - 50) / 50   # -1 to +1
            macd_score = 1.0 if last["macd_diff"] > 0 else -1.0
            momentum_votes.append((rsi_score + macd_score) / 2)

            # Volatility: ATR / price
            if last["close"] > 0:
                volatility_vals.append(last["atr"] / last["close"])

            # Volume ratio
            if last["volume_ma"] > 0:
                volume_vals.append(last["volume"] / last["volume_ma"])

        trend_score = sum(trend_votes) / len(trend_votes) if trend_votes else 0.0
        momentum_score = sum(momentum_votes) / len(momentum_votes) if momentum_votes else 0.0
        volatility = sum(volatility_vals) / len(volatility_vals) if volatility_vals else 0.0
        volume_ratio = sum(volume_vals) / len(volume_vals) if volume_vals else 1.0

        direction = "BULLISH" if trend_score > 0.3 else "BEARISH" if trend_score < -0.3 else "NEUTRAL"
        summary = (
            f"{direction} | trend={trend_score:.2f} mom={momentum_score:.2f} "
            f"vol_ratio={volume_ratio:.2f} atr_pct={volatility*100:.3f}%"
        )
        return QuantSignal(trend_score, momentum_score, volatility, volume_ratio, summary)
