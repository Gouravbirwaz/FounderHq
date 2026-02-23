import os
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from app.models.market import NewsArticle
from app.services.sentiment_service import analyze_text
from dotenv import load_dotenv

load_dotenv()

# GNews API Configuration
GNEWS_API_KEY = os.getenv("NEWS_API_KEY")

# Lightweight mock news for offline/dev mode
_MOCK_NEWS = [
    {"title": "Zepto raises $350M in Series G, eyes quick commerce dominance", "source": "Zepto", "url": "https://zepto.com/", "summary": "Zepto's latest funding round values the company at $5B, making it one of India's fastest-growing unicorns.", "image_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800"},
    {"title": "SEBI approves new framework for startup IPOs in India", "source": "SEBI", "url": "https://sebi.gov.in/", "summary": "New regulations ease the path for Indian tech startups to go public with reduced lock-in periods.", "image_url": "https://images.unsplash.com/photo-1611974717483-9b43793014b1?auto=format&fit=crop&q=80&w=800"},
    {"title": "AI startup Sarvam raises $41M to build India's foundational model", "source": "Sarvam AI", "url": "https://sarvam.ai/", "summary": "Sarvam AI is building LLMs trained entirely on Indic languages, backed by Lightspeed and Peak XV.", "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"},
    {"title": "PhonePe crosses 550M registered users, becomes India's largest fintech", "source": "PhonePe", "url": "https://phonepe.com/", "summary": "PhonePe now processes over 50% of all UPI transactions in India monthly.", "image_url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"},
]

_cached_articles: list[dict] = []

async def scrape_and_store():
    """Attempt to fetch from GNews; fall back to mock data."""
    global _cached_articles
    articles = []

    if GNEWS_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=15) as client:
                # Top technology headlines for startup context
                url = f"https://gnews.io/api/v4/top-headlines?category=technology&lang=en&token={GNEWS_API_KEY}"
                resp = await client.get(url)
                if resp.status_code == 200:
                    data = resp.json()
                    for item in data.get("articles", [])[:15]:
                        articles.append({
                            "title": item.get("title"),
                            "url": item.get("url"),
                            "source": item.get("source", {}).get("name", "GNews"),
                            "summary": item.get("description", ""),
                            "image_url": item.get("image"),
                            "published_at": item.get("publishedAt"),
                        })
        except Exception as e:
            print(f"GNews API request failed: {e}")

    if len(articles) < 3:
        articles = _MOCK_NEWS[:]

    stored = []
    for art in articles[:15]:
        score, label = analyze_text(art["title"] + " " + (art.get("summary") or ""))
        
        pub_at = art.get("published_at")
        if isinstance(pub_at, str):
            try:
                # Handle ISO format from GNews
                pub_at = datetime.fromisoformat(pub_at.replace('Z', '+00:00'))
            except Exception:
                pub_at = datetime.utcnow()
        else:
            pub_at = datetime.utcnow()

        doc = NewsArticle(
            title=art["title"],
            url=art["url"],
            source=art["source"],
            summary=art.get("summary"),
            image_url=art.get("image_url"),
            sentiment_score=score,
            sentiment_label=label,
            published_at=pub_at,
        )
        try:
            await doc.insert()
        except Exception:
            pass
        stored.append(doc)

    _cached_articles = [art.model_dump() if hasattr(art, "model_dump") else art.dict() for art in stored]
    return stored

async def get_cached_news() -> list:
    """Return cached or mock articles."""
    if not _cached_articles:
        return _MOCK_NEWS
    return _cached_articles
