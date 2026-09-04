from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.database import list_posts, get_post, delete_post

router = APIRouter(prefix="/api/history", tags=["history"])

@router.get("")
async def get_history_list(limit: int = 50, offset: int = 0):
    posts = await list_posts(limit=limit, offset=offset)
    return {"posts": posts}

@router.get("/{post_id}")
async def get_history_detail(post_id: int):
    post = await get_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="포스트를 찾을 수 없습니다.")
    return post

@router.delete("/{post_id}")
async def delete_history_item(post_id: int):
    deleted = await delete_post(post_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="삭제할 대상을 찾지 못했습니다.")
    return {"status": "success", "message": "삭제 완료"}
