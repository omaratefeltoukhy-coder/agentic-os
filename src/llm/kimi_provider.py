"""Kimi K2.6 LLM provider — OpenAI-compatible client."""

import os
from openai import OpenAI

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(
            api_key=os.environ["KIMI_API_KEY"],
            base_url=os.getenv("KIMI_API_BASE", "https://api.moonshot.ai/v1"),
        )
    return _client


def chat(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.3,
    max_tokens: int = 2048,
) -> str:
    model = model or os.getenv("KIMI_MODEL", "kimi-k2.6")
    client = get_client()
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def analyze_market(context: str, task: str) -> str:
    """Send market context + task to Kimi K2.6 and return the analysis."""
    messages = [
        {
            "role": "system",
            "content": (
                "You are an expert quantitative analyst and algorithmic trader. "
                "You analyze cryptocurrency market data and provide precise, "
                "data-driven trading signals. Always respond with valid JSON."
            ),
        },
        {
            "role": "user",
            "content": f"Market context:\n{context}\n\nTask:\n{task}",
        },
    ]
    return chat(messages)
