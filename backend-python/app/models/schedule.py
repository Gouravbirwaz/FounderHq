from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field
import uuid

class Schedule(Document):
    user_id: str
    title: str
    time: str
    is_completed: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "schedules"
