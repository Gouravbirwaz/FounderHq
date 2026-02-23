from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ─── Auth Schemas ────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: str
    phone_number: str
    password: str
    role: str = "founder"

class UserLogin(BaseModel):
    email: str
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    role: str
    vetting_badge: bool

# ─── POC Schemas ─────────────────────────────────────────────────────────────
class POCCreate(BaseModel):
    title: str
    description: str
    tags: list[str] = []
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    stage: str = "idea"
    seeking: str = "investment"

# ─── Job Schemas ─────────────────────────────────────────────────────────────
class JobCreate(BaseModel):
    title: str
    company: str
    description: str
    skills: list[str] = []
    equity_offer: float
    base_pay: Optional[float] = None
    location: str = "Remote"
    role_type: str = "co-founder"

# ─── Alert Schemas ────────────────────────────────────────────────────────────
class AlertCreate(BaseModel):
    ticker: str
    threshold: float
    direction: str = "above"

# ─── Cap Table Schemas ────────────────────────────────────────────────────────
class RoundInput(BaseModel):
    name: str
    investment: float  # in INR
    pre_money_valuation: float  # in INR

class CapTableRequest(BaseModel):
    founder_equity: float = 100.0  # starting %
    rounds: list[RoundInput]

# ─── Community Schemas ────────────────────────────────────────────────────────
class PostCreate(BaseModel):
    content: str
    tags: list[str] = []
    has_image: bool = False
    image_alt: Optional[str] = None
    has_file: bool = False
    file_name: Optional[str] = None

class PostResponse(BaseModel):
    id: str
    author_id: str
    author_name: str
    author_role: str
    content: str
    timestamp: datetime
    likes_count: int
    has_liked: bool = False
    comments_count: int
    tags: list[str]
    has_image: bool
    image_alt: Optional[str]
    image_url: Optional[str] = None
    has_file: bool
    file_name: Optional[str]
    file_url: Optional[str] = None

# ─── Comment Schemas ──────────────────────────────────────────────────────────
class CommentCreate(BaseModel):
    content: str

class CommentResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    author_name: str
    author_role: str
    content: str
    timestamp: datetime

# ─── Schedule Schemas ──────────────────────────────────────────────────────────
class ScheduleCreate(BaseModel):
    title: str
    time: str

class ScheduleResponse(BaseModel):
    id: str
    user_id: str
    title: str
    time: str
    is_completed: bool
    timestamp: datetime
