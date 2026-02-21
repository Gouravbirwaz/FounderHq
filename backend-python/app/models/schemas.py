from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ─── Auth Schemas ────────────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: str
    password: str
    role: str = "founder"

class UserLogin(BaseModel):
    email: str
    password: str

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
