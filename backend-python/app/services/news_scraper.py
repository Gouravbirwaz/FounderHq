"""
News scraper for Indian startup/tech ecosystem.
Fetches from public RSS feeds and stores sentiment-analyzed articles in MongoDB.
"""
import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from app.models.market import NewsArticle
from app.services.sentiment_service import analyze_text

# Lightweight mock news for offline/dev mode
_MOCK_NEWS = [
    {"title": "Zepto raises $350M in Series G, eyes quick commerce dominance", "source": "Inc42", "url": "https://inc42.com/", "summary": "Zepto's latest funding round values the company at $5B, making it one of India's fastest-growing unicorns.", "image_url": "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=800"},
    {"title": "SEBI approves new framework for startup IPOs in India", "source": "Economic Times", "url": "https://economictimes.com/", "summary": "New regulations ease the path for Indian tech startups to go public with reduced lock-in periods.", "image_url": "https://images.unsplash.com/photo-1611974717483-9b43793014b1?auto=format&fit=crop&q=80&w=800"},
    {"title": "AI startup Sarvam raises $41M to build India's foundational model", "source": "TechCrunch", "url": "https://techcrunch.com/", "summary": "Sarvam AI is building LLMs trained entirely on Indic languages, backed by Lightspeed and Peak XV.", "image_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800"},
    {"title": "PhonePe crosses 550M registered users, becomes India's largest fintech", "source": "Business Standard", "url": "https://business-standard.com/", "summary": "PhonePe now processes over 50% of all UPI transactions in India monthly.", "image_url": "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800"},
    {"title": "India's startup ecosystem sees $4.5B in Q1 2024 funding — recovery signals", "source": "Inc42", "url": "https://inc42.com/", "summary": "VC funding is recovering after a difficult 2023, with SaaS and AI leading the charge.", "image_url": "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=800"},
    {"title": "Meesho achieves operational profitability, files for IPO", "source": "Mint", "url": "https://livemint.com/", "summary": "The social commerce giant is on track to list at a $4.5B valuation post-profitability milestone.", "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800"},
]

_cached_articles: list[dict] = []


async def scrape_and_store():
    """Attempt to scrape live news; fall back to mock data."""
    global _cached_articles
    articles = []

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            # YourStory RSS
            resp = await client.get("https://yourstory.com/feed")
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "lxml-xml")
                for item in soup.find_all("item")[:8]:
                    title = item.find("title")
                    link = item.find("link")
                    desc = item.find("description")
                    media = item.find("media:content") or item.find("enclosure")
                    
                    if title and link:
                        articles.append({
                            "title": title.text.strip(),
                            "url": link.text.strip(),
                            "source": "YourStory",
                            "summary": BeautifulSoup(desc.text, "html.parser").get_text()[:200] if desc else "",
                            "image_url": media.get("url") if media else None,
                        })
    except Exception:
        pass  # Network unavailable — use mock

    if len(articles) < 5:
        articles = _MOCK_NEWS[:]

    stored = []
    for art in articles[:10]:
        score, label = analyze_text(art["title"] + " " + (art.get("summary") or ""))
        doc = NewsArticle(
            title=art["title"],
            url=art["url"],
            source=art["source"],
            summary=art.get("summary"),
            image_url=art.get("image_url"),
            sentiment_score=score,
            sentiment_label=label,
            published_at=datetime.utcnow(),
        )
        try:
            await doc.insert()
        except Exception:
            pass
        stored.append(doc)

    _cached_articles = [art.__dict__ for art in stored]
    return stored


async def get_cached_news() -> list:
    """Return cached or mock articles (avoids costly DB reads on every call)."""
    if not _cached_articles:
        return _MOCK_NEWS
    return _cached_articles
