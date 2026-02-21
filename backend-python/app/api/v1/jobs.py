from fastapi import APIRouter, Depends, HTTPException
from app.models.user import User
from app.models.job import Job
from app.models.schemas import JobCreate
from app.auth import get_current_user

router = APIRouter(prefix="/jobs", tags=["jobs"])


@router.get("/")
async def list_jobs(skip: int = 0, limit: int = 20, role_type: str = None):
    query = Job.find(Job.is_active == True)
    if role_type:
        query = Job.find(Job.role_type == role_type, Job.is_active == True)
    jobs = await query.sort(-Job.created_at).skip(skip).limit(limit).to_list()
    return [_serialize(j) for j in jobs]


@router.post("/")
async def create_job(body: JobCreate, user: User = Depends(get_current_user)):
    job = Job(**body.model_dump(), posted_by=user.id, poster_name=user.name)
    await job.insert()
    return _serialize(job)


@router.delete("/{job_id}")
async def delete_job(job_id: str, user: User = Depends(get_current_user)):
    job = await Job.get(job_id)
    if not job or job.posted_by != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    job.is_active = False
    await job.save()
    return {"message": "Job closed"}


def _serialize(j: Job) -> dict:
    return {
        "id": str(j.id),
        "title": j.title,
        "company": j.company,
        "description": j.description,
        "skills": j.skills,
        "equity_offer": j.equity_offer,
        "base_pay": j.base_pay,
        "location": j.location,
        "role_type": j.role_type,
        "poster_name": j.poster_name,
        "created_at": j.created_at,
    }
