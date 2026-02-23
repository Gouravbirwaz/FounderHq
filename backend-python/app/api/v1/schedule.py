from fastapi import APIRouter, Depends, HTTPException
from app.models.schedule import Schedule
from app.models.user import User
from app.models.schemas import ScheduleCreate, ScheduleResponse
from app.api.v1.auth import get_current_user
from typing import List
from beanie import PydanticObjectId

router = APIRouter(prefix="/schedule", tags=["Schedule"])

@router.get("/", response_model=List[ScheduleResponse])
async def get_schedules(
    current_user: User = Depends(get_current_user)
):
    results = await Schedule.find(Schedule.user_id == str(current_user.id)).to_list()
    return results

@router.post("/", response_model=ScheduleResponse)
async def create_schedule(
    schedule_in: ScheduleCreate,
    current_user: User = Depends(get_current_user)
):
    new_schedule = Schedule(
        user_id=str(current_user.id),
        title=schedule_in.title,
        time=schedule_in.time
    )
    await new_schedule.insert()
    return new_schedule

@router.patch("/{schedule_id}/toggle", response_model=ScheduleResponse)
async def toggle_schedule(
    schedule_id: str,
    current_user: User = Depends(get_current_user)
):
    schedule = await Schedule.find_one(
        Schedule.id == PydanticObjectId(schedule_id), 
        Schedule.user_id == str(current_user.id)
    )
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    schedule.is_completed = not schedule.is_completed
    await schedule.save()
    return schedule

@router.delete("/{schedule_id}")
async def delete_schedule(
    schedule_id: str,
    current_user: User = Depends(get_current_user)
):
    schedule = await Schedule.find_one(
        Schedule.id == PydanticObjectId(schedule_id), 
        Schedule.user_id == str(current_user.id)
    )
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    
    await schedule.delete()
    return {"status": "deleted"}
