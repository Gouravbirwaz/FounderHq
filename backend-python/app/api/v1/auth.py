from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File
import os
import uuid
from app.models.user import User
from app.models.schemas import UserRegister, UserLogin, TokenResponse, UserUpdate
from app.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(body: UserRegister):
    existing = await User.find_one(User.email == body.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=body.name,
        email=body.email,
        phone_number=body.phone_number,
        hashed_password=hash_password(body.password),
        role=body.role,
    )
    await user.insert()
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        name=user.name,
        role=user.role,
        vetting_badge=user.vetting_badge,
    )


@router.post("/login", response_model=TokenResponse)
async def login(body: UserLogin):
    user = await User.find_one(User.email == body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        user_id=str(user.id),
        name=user.name,
        role=user.role,
        vetting_badge=user.vetting_badge,
    )


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return {
        "id": str(user.id),
        "name": user.name,
        "email": user.email,
        "phone_number": user.phone_number,
        "role": user.role,
        "bio": user.bio,
        "company": user.company,
        "vetting_badge": user.vetting_badge,
        "avatar_url": user.avatar_url,
    }


@router.put("/me")
async def update_me(body: UserUpdate, current_user: User = Depends(get_current_user)):
    if body.name is not None:
        current_user.name = body.name
    if body.email is not None:
        current_user.email = body.email
    if body.phone_number is not None:
        current_user.phone_number = body.phone_number
    if body.bio is not None:
        current_user.bio = body.bio
    if body.company is not None:
        current_user.company = body.company
        
    await current_user.save()
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "phone_number": current_user.phone_number,
        "role": current_user.role,
        "bio": current_user.bio,
        "company": current_user.company,
        "vetting_badge": current_user.vetting_badge,
        "avatar_url": current_user.avatar_url,
    }


@router.post("/avatar")
async def upload_avatar(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
        
    # Generate unique filename
    ext = file.filename.split(".")[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads", filename)
    
    # Save file
    with open(filepath, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Construct URL (assuming server runs on standard host/port or using relative path)
    # Using relative path so it works regardless of domain
    avatar_url = f"/uploads/{filename}"
    
    # Update user
    current_user.avatar_url = avatar_url
    await current_user.save()
    
    return {"avatar_url": avatar_url}


@router.get("/search")
async def search_users(q: str, current_user: User = Depends(get_current_user)):
    if not q:
        return []
    
    # Simple search by name
    users = await User.find(
        {"name": {"$regex": q, "$options": "i"}},
        User.id != current_user.id
    ).limit(5).to_list()
    
    return [{
        "id": str(u.id),
        "name": u.name,
        "role": u.role,
        "avatar_url": u.avatar_url
    } for u in users]


@router.get("/{user_id}")
async def get_user_by_id(user_id: str, current_user: User = Depends(get_current_user)):
    user = await User.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {
        "id": str(user.id),
        "name": user.name,
        "role": user.role,
        "avatar_url": user.avatar_url,
    }
