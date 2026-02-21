"""
Sentiment analysis using TextBlob on article text.
Returns a score in [-1, 1] and a label.
"""
from textblob import TextBlob
from app.models.market import NewsArticle


def analyze_text(text: str) -> tuple[float, str]:
    """Returns (polarity_score, label)."""
    try:
        blob = TextBlob(text)
        score = round(blob.sentiment.polarity, 3)
    except Exception:
        score = 0.0

    if score > 0.1:
        label = "positive"
    elif score < -0.1:
        label = "negative"
    else:
        label = "neutral"

    return score, label


async def get_market_sentiment_score() -> float:
    """Aggregate sentiment score from recent news articles."""
    try:
        articles = await NewsArticle.find_all().sort(-NewsArticle.scraped_at).limit(20).to_list()
        if not articles:
            return 0.0
        scores = [a.sentiment_score for a in articles]
        return round(sum(scores) / len(scores), 3)
    except Exception:
        return 0.12  # Slightly positive default
