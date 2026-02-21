from fastapi import APIRouter, Depends, HTTPException
from beanie import PydanticObjectId
from app.models.user import User
from app.models.poc import POC
from app.models.schemas import POCCreate
from app.auth import get_current_user

router = APIRouter(prefix="/pocs", tags=["pocs"])


@router.get("/")
async def list_pocs(skip: int = 0, limit: int = 20, tag: str = None, stage: str = None):
    query = POC.find()
    if tag:
        query = POC.find({"tags": tag})
    if stage:
        query = POC.find(POC.stage == stage)
    pocs = await query.sort(-POC.upvotes).skip(skip).limit(limit).to_list()
    return [_serialize(p) for p in pocs]


@router.post("/")
async def create_poc(body: POCCreate, user: User = Depends(get_current_user)):
    poc = POC(
        **body.model_dump(),
        author_id=user.id,
        author_name=user.name,
    )
    await poc.insert()
    return _serialize(poc)


@router.get("/{poc_id}")
async def get_poc(poc_id: str):
    poc = await POC.get(poc_id)
    if not poc:
        raise HTTPException(status_code=404, detail="POC not found")
    return _serialize(poc)


@router.post("/{poc_id}/upvote")
async def upvote_poc(poc_id: str, user: User = Depends(get_current_user)):
    poc = await POC.get(poc_id)
    if not poc:
        raise HTTPException(status_code=404, detail="POC not found")
    if user.id in poc.upvoted_by:
        poc.upvotes -= 1
        poc.upvoted_by.remove(user.id)
        action = "removed"
    else:
        poc.upvotes += 1
        poc.upvoted_by.append(user.id)
        action = "added"
    await poc.save()
    return {"upvotes": poc.upvotes, "action": action}


@router.delete("/{poc_id}")
async def delete_poc(poc_id: str, user: User = Depends(get_current_user)):
    poc = await POC.get(poc_id)
    if not poc or poc.author_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    await poc.delete()
    return {"message": "Deleted"}


def _serialize(p: POC) -> dict:
    return {
        "id": str(p.id),
        "title": p.title,
        "description": p.description,
        "tags": p.tags,
        "author_id": str(p.author_id),
        "author_name": p.author_name,
        "upvotes": p.upvotes,
        "demo_url": p.demo_url,
        "github_url": p.github_url,
        "stage": p.stage,
        "seeking": p.seeking,
        "created_at": p.created_at,
    }
