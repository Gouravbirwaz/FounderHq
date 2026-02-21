from beanie import Document, PydanticObjectId
from typing import Optional, List
from datetime import datetime


class Job(Document):
    title: str
    company: str
    description: str
    skills: List[str] = []
    equity_offer: float  # percentage e.g. 0.5 for 0.5%
    base_pay: Optional[float] = None  # in INR/month, None = pure equity
    location: str = "Remote"
    role_type: str = "co-founder"  # co-founder | engineer | designer | marketer
    posted_by: PydanticObjectId
    poster_name: str
    is_active: bool = True
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "jobs"
