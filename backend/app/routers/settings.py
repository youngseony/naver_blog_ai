import os
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.database import get_setting, set_setting
from app.services.gemini_service import get_active_api_key, get_active_model
from google import genai

router = APIRouter(prefix="/api/settings", tags=["settings"])

class SettingsUpdate(BaseModel):
    gemini_api_key: Optional[str] = None
    gemini_model: Optional[str] = None

@router.get("")
async def get_current_settings():
    api_key = await get_active_api_key()
    model = await get_active_model()
    # 보안을 위해 키는 마스킹 처리하여 반환
    masked_key = ""
    if api_key:
        masked_key = api_key[:4] + "*" * max(0, len(api_key) - 8) + api_key[-4:] if len(api_key) > 8 else "****"

    return {
        "has_api_key": bool(api_key),
        "masked_api_key": masked_key,
        "model": model,
        "available_models": [
            {"id": "gemini-3.6-flash", "name": "Gemini 3.6 Flash (최신 초고속, 추천)"},
            {"id": "gemini-flash-latest", "name": "Gemini Flash Latest (최신 자동 갱신)"},
            {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro (고지능 심층 분석)"},
            {"id": "gemini-3.8-flash", "name": "Gemini 3.8 Flash (차세대 프리뷰)"}
        ]
    }

@router.post("")
async def save_settings(data: SettingsUpdate):
    if data.gemini_api_key is not None:
        await set_setting("GEMINI_API_KEY", data.gemini_api_key.strip())
    if data.gemini_model is not None:
        await set_setting("GEMINI_MODEL", data.gemini_model.strip())
    
    return {"status": "success", "message": "설정이 성공적으로 저장되었습니다."}

@router.post("/test-connection")
async def test_connection():
    api_key = await get_active_api_key()
    if not api_key:
        return {"success": False, "message": "등록된 Gemini API 키가 없습니다. API 키를 입력해 주세요."}
    
    try:
        client = genai.Client(api_key=api_key)
        model = await get_active_model()
        res = client.models.generate_content(
            model=model,
            contents="간단하게 '연결 성공'이라고만 대답해줘."
        )
        return {"success": True, "message": f"정상 연결되었습니다! (응답: {res.text.strip()})"}
    except Exception as e:
        return {"success": False, "message": f"연결 실패: {str(e)}"}
