from fastapi import APIRouter, HTTPException, Depends, status, UploadFile, File, Form
from typing import List, Optional
from app.models.community import CommunityPost, CommunityComment
from beanie import PydanticObjectId
from app.models.user import User
from app.models.schemas import PostResponse, CommentCreate, CommentResponse
from app.auth import get_current_user
from datetime import datetime
import shutil
import os
import uuid

router = APIRouter(prefix="/community", tags=["community"])

@router.get("/", response_model=List[PostResponse])
async def get_posts(current_user: User = Depends(get_current_user)):
    posts = await CommunityPost.find_all().sort("-timestamp").to_list()
    
    response = []
    for p in posts:
        response.append(PostResponse(
            id=str(p.id),
            author_id=p.author_id,
            author_name=p.author_name,
            author_role=p.author_role,
            content=p.content,
            timestamp=p.timestamp,
            likes_count=len(p.likes),
            has_liked=str(current_user.id) in p.likes,
            comments_count=p.comments_count,
            tags=p.tags,
            has_image=p.has_image,
            image_alt=p.image_alt,
            image_url=p.image_url,
            has_file=p.has_file,
            file_name=p.file_name,
            file_url=p.file_url,
        ))
    return response

@router.post("/", response_model=PostResponse)
async def create_post(
    content: str = Form(...),
    tags: str = Form("[]"),
    image: Optional[UploadFile] = File(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user)
):
    import json
    try:
        tags_list = json.loads(tags)
    except:
        tags_list = []

    has_image = False
    image_url = None
    image_alt = None
    
    if image:
        ext = os.path.splitext(image.filename)[1]
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join("uploads", filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        has_image = True
        image_url = f"/uploads/{filename}"
        image_alt = image.filename

    has_file = False
    file_url = None
    file_name = None
    
    if file:
        ext = os.path.splitext(file.filename)[1].lower()
        filename = f"{uuid.uuid4()}{ext}"
        filepath = os.path.join("uploads", filename)
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        current_file_url = f"/uploads/{filename}"
        current_file_name = file.filename
        
        # Smart Media Detection: If it's an image and no primary image was uploaded
        image_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
        if ext in image_extensions and not has_image:
            has_image = True
            image_url = current_file_url
            image_alt = current_file_name
            # We skip setting has_file to True to avoid redundant document cards for images
        else:
            has_file = True
            file_url = current_file_url
            file_name = current_file_name

    post = CommunityPost(
        author_id=str(current_user.id),
        author_name=current_user.name,
        author_role=current_user.role,
        content=content,
        tags=tags_list,
        has_image=has_image,
        image_alt=image_alt,
        image_url=image_url,
        has_file=has_file,
        file_name=file_name,
        file_url=file_url,
    )
    await post.insert()
    
    return PostResponse(
        id=str(post.id),
        author_id=post.author_id,
        author_name=post.author_name,
        author_role=post.author_role,
        content=post.content,
        timestamp=post.timestamp,
        likes_count=0,
        has_liked=False,
        comments_count=0,
        tags=post.tags,
        has_image=post.has_image,
        image_alt=post.image_alt,
        image_url=post.image_url,
        has_file=post.has_file,
        file_name=post.file_name,
        file_url=post.file_url,
    )

@router.post("/{post_id}/like")
async def like_post(post_id: str, current_user: User = Depends(get_current_user)):
    post = await CommunityPost.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    uid = str(current_user.id)
    if uid in post.likes:
        post.likes.remove(uid)
    else:
        post.likes.append(uid)
    
    await post.save()
    return {"likes_count": len(post.likes), "has_liked": uid in post.likes}

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(post_id: str, current_user: User = Depends(get_current_user)):
    comments = await CommunityComment.find(CommunityComment.post_id == post_id).sort("timestamp").to_list()
    return [CommentResponse(
        id=str(c.id),
        post_id=c.post_id,
        author_id=c.author_id,
        author_name=c.author_name,
        author_role=c.author_role,
        content=c.content,
        timestamp=c.timestamp
    ) for c in comments]

@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(post_id: str, body: CommentCreate, current_user: User = Depends(get_current_user)):
    post = await CommunityPost.get(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment = CommunityComment(
        post_id=post_id,
        author_id=str(current_user.id),
        author_name=current_user.name,
        author_role=current_user.role,
        content=body.content
    )
    await comment.insert()
    
    # Increment comment count
    post.comments_count += 1
    await post.save()
    
    return CommentResponse(
        id=str(comment.id),
        post_id=comment.post_id,
        author_id=comment.author_id,
        author_name=comment.author_name,
        author_role=comment.author_role,
        content=comment.content,
        timestamp=comment.timestamp
    )

@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(post_id: str, current_user: User = Depends(get_current_user)):
    # Attempt to find the post using explicit PydanticObjectId conversion
    try:
        if PydanticObjectId.is_valid(post_id):
            post = await CommunityPost.get(PydanticObjectId(post_id))
        else:
            post = await CommunityPost.get(post_id) # Fallback for custom string IDs
    except Exception:
        post = await CommunityPost.get(post_id)

    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.author_id != str(current_user.id):
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    
    # Delete associated comments
    await CommunityComment.find(CommunityComment.post_id == post_id).delete()
    
    # Delete media files from disk if they exist
    if post.has_image and post.image_url:
        img_path = post.image_url.lstrip("/")
        if os.path.exists(img_path):
            try:
                os.remove(img_path)
            except Exception as e:
                print(f"Error removing image file: {e}")
                
    if post.has_file and post.file_url:
        file_path = post.file_url.lstrip("/")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception as e:
                print(f"Error removing document file: {e}")

    await post.delete()
    return None
