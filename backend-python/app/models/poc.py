from beanie import Document, PydanticObjectId
from pydantic import Field
from typing import Optional, List
from datetime import datetime


class POC(Document):
    title: str
    description: str
    tags: List[str] = []
    author_id: PydanticObjectId
    author_name: str
    upvotes: int = 0
    upvoted_by: List[PydanticObjectId] = []
    demo_url: Optional[str] = None
    github_url: Optional[str] = None
    document_urls: List[str] = []
    stage: str = "idea"  # idea | prototype | mvp | funded
    seeking: str = "investment"  # investment | co-founder | mentorship
    created_at: datetime = datetime.utcnow()

    class Settings:
        name = "pocs"
