from beanie import Document, Link
from pydantic import Field
from typing import Optional, List
from datetime import datetime
from app.models.user import User

class CommunityPost(Document):
    author_id: str
    author_name: str
    author_role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    likes: List[str] = []  # List of user IDs who liked
    comments_count: int = 0
    tags: List[str] = []
    has_image: bool = False
    image_alt: Optional[str] = None
    image_url: Optional[str] = None
    has_file: bool = False
    file_name: Optional[str] = None
    file_url: Optional[str] = None

    class Settings:
        name = "community_posts"

class CommunityComment(Document):
    post_id: str
    author_id: str
    author_name: str
    author_role: str
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "community_comments"
