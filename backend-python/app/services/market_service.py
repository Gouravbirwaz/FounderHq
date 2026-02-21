import random
import time
from datetime import datetime

# Simulated base prices (INR)
_BASE = {
    "NIFTY50": 22_500,
    "SENSEX": 74_000,
    "PAYTM": 520,
    "ZOMATO": 205,
    "SWIGGY": 420,
    "NYKAA": 170,
    "POLICYBAZAAR": 890,
    "DELHIVERY": 390,
    "MAPMYINDIA": 1_750,
    "IDEAFORGE": 680,
}

_last_prices: dict[str, float] = {k: v for k, v in _BASE.items()}
_last_tick = 0.0


def _tick_prices():
    global _last_tick
    now = time.time()
    if now - _last_tick > 1:
        for k in _last_prices:
            change = random.uniform(-0.003, 0.003)
            _last_prices[k] = round(_last_prices[k] * (1 + change), 2)
        _last_tick = now


def get_market_snapshot() -> dict:
    _tick_prices()
    snapshot = {}
    for ticker, price in _last_prices.items():
        base = _BASE[ticker]
        change = round(price - base, 2)
        change_pct = round((change / base) * 100, 2)
        snapshot[ticker] = {
            "price": price,
            "change": change,
            "change_pct": change_pct,
            "direction": "up" if change >= 0 else "down",
            "timestamp": datetime.utcnow().isoformat(),
        }
    return snapshot


def get_stocks_list() -> list:
    _tick_prices()
    stocks = []
    for ticker, price in _last_prices.items():
        base = _BASE[ticker]
        change = round(price - base, 2)
        change_pct = round((change / base) * 100, 2)
        stocks.append({
            "ticker": ticker,
            "price": price,
            "change": change,
            "change_pct": change_pct,
            "direction": "up" if change >= 0 else "down",
        })
    return stocks


def get_price(ticker: str) -> float | None:
    _tick_prices()
    return _last_prices.get(ticker.upper())
