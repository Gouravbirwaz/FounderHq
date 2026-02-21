from beanie import Document, PydanticObjectId
from typing import Optional
from datetime import datetime


class MarketAlert(Document):
    user_id: PydanticObjectId
    ticker: str  # e.g. "PAYTM", "NIFTY50"
    threshold: float
    direction: str = "above"  # above | below
    is_active: bool = True
    triggered: bool = False
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "market_alerts"


class NewsArticle(Document):
    title: str
    url: str
    source: str
    summary: Optional[str] = None
    sentiment_score: float = 0.0  # -1 to 1
    sentiment_label: str = "neutral"  # positive | negative | neutral
    published_at: Optional[datetime] = None
    scraped_at: datetime = datetime.utcnow()

    class Settings:
        name = "news_articles"
