import os
import motor.motor_asyncio
from beanie import init_beanie
from app.models.user import User
from app.models.poc import POC
from app.models.job import Job
from app.models.market import MarketAlert, NewsArticle
from app.models.community import CommunityPost, CommunityComment
from app.models.schedule import Schedule
from dotenv import load_dotenv
load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "founderhq")

client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URL)

async def init_db():
    await init_beanie(
        database=client[DB_NAME],
        document_models=[User, POC, Job, MarketAlert, NewsArticle, CommunityPost, CommunityComment, Schedule],
    )
