from beanie import Document
from pydantic import EmailStr
from typing import Optional
from datetime import datetime


class User(Document):
    name: str
    email: EmailStr
    hashed_password: str
    role: str = "founder"  # founder | investor | student | mentor
    bio: Optional[str] = None
    company: Optional[str] = None
    is_verified: bool = False
    vetting_badge: bool = False
    avatar_url: Optional[str] = None
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"
