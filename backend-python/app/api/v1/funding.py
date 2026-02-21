from fastapi import APIRouter, Depends
from app.models.user import User
from app.models.schemas import CapTableRequest
from app.auth import get_current_user
from app.services.cap_table_service import simulate_cap_table
from app.services.mca_service import mock_verify_startup

router = APIRouter(prefix="/funding", tags=["funding"])


@router.post("/cap-table")
async def cap_table(body: CapTableRequest, user: User = Depends(get_current_user)):
    result = simulate_cap_table(body.founder_equity, body.rounds)
    return result


@router.get("/vetting/{company_name}")
async def vetting(company_name: str, user: User = Depends(get_current_user)):
    result = mock_verify_startup(company_name)
    if result["verified"] and not user.vetting_badge:
        user.vetting_badge = True
        await user.save()
    return result
