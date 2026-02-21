from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.models.market import MarketAlert, NewsArticle
from app.models.schemas import AlertCreate
from app.auth import get_current_user
from app.services.market_service import get_market_snapshot, get_stocks_list
from app.services.news_scraper import get_cached_news
from app.services.sentiment_service import get_market_sentiment_score

router = APIRouter(prefix="/market", tags=["market"])


@router.get("/snapshot")
async def market_snapshot():
    """Real-time market snapshot (Nifty, Sensex, top tech stocks)."""
    return get_market_snapshot()


@router.get("/stocks")
async def stocks():
    return get_stocks_list()


@router.get("/news")
async def news(limit: int = 20):
    articles = await NewsArticle.find_all().sort(-NewsArticle.scraped_at).limit(limit).to_list()
    return [
        {
            "id": str(a.id),
            "title": a.title,
            "url": a.url,
            "source": a.source,
            "summary": a.summary,
            "sentiment_score": a.sentiment_score,
            "sentiment_label": a.sentiment_label,
            "published_at": a.published_at,
        }
        for a in articles
    ]


@router.get("/sentiment")
async def sentiment():
    score = await get_market_sentiment_score()
    label = "bullish" if score > 0.2 else "bearish" if score < -0.2 else "neutral"
    advice = (
        "Good time to raise funding — investor sentiment is positive."
        if score > 0.2
        else "Cautious market — consider waiting before approaching investors."
        if score < -0.2
        else "Mixed signals — evaluate carefully before making moves."
    )
    return {"score": score, "label": label, "advice": advice}


@router.post("/alerts")
async def create_alert(body: AlertCreate, user: User = Depends(get_current_user)):
    alert = MarketAlert(
        user_id=user.id,
        ticker=body.ticker.upper(),
        threshold=body.threshold,
        direction=body.direction,
    )
    await alert.insert()
    return {"message": "Alert created", "id": str(alert.id)}


@router.get("/alerts")
async def get_alerts(user: User = Depends(get_current_user)):
    alerts = await MarketAlert.find(MarketAlert.user_id == user.id).to_list()
    return [
        {
            "id": str(a.id),
            "ticker": a.ticker,
            "threshold": a.threshold,
            "direction": a.direction,
            "is_active": a.is_active,
            "triggered": a.triggered,
        }
        for a in alerts
    ]


@router.delete("/alerts/{alert_id}")
async def delete_alert(alert_id: str, user: User = Depends(get_current_user)):
    alert = await MarketAlert.get(alert_id)
    if not alert or alert.user_id != user.id:
        raise HTTPException(status_code=404, detail="Alert not found")
    await alert.delete()
    return {"message": "Alert deleted"}
