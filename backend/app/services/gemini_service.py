import os
import re
import json
import logging
from typing import Dict, Any, Optional
from google import genai
from google.genai import types
from app.config import settings
from app.database import get_setting

logger = logging.getLogger("uvicorn.error")

async def get_active_api_key() -> str:
    # 1. DB에 저장된 키 우선
    db_key = await get_setting("GEMINI_API_KEY", "")
    if db_key and db_key.strip():
        return db_key.strip()
    # 2. .env 환경변수 키
    env_key = os.environ.get("GEMINI_API_KEY", settings.GEMINI_API_KEY)
    if env_key and env_key.strip() and env_key != "your_gemini_api_key_here":
        return env_key.strip()
    return ""

async def get_active_model() -> str:
    db_model = await get_setting("GEMINI_MODEL", "")
    if db_model and db_model.strip():
        return db_model.strip()
    return settings.GEMINI_MODEL or "gemini-3.6-flash"

def clean_json_response(text: str) -> Dict[str, Any]:
    """Gemini 응답 텍스트에서 마크다운 코드블록을 제거하고 JSON으로 파싱"""
    text = text.strip()
    # ```json ... ``` 패턴 매칭
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError as e:
        logger.warning(f"JSON parsing direct failed: {e}. Trying fuzzy extract.")
        # 첫 { 와 마지막 } 추출 시도
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(text[start:end+1])
            except Exception:
                pass
        return {"raw_text": text, "error": "JSON 파싱 실패"}

async def generate_with_gemini(prompt: str, system_instruction: Optional[str] = None, use_search: bool = False) -> str:
    api_key = await get_active_api_key()
    model_name = await get_active_model()

    if not api_key:
        logger.info("No Gemini API key provided. Falling back to mock generator.")
        return ""

    client = genai.Client(api_key=api_key)
    
    config_args = {}
    if system_instruction:
        config_args["system_instruction"] = system_instruction
    
    if use_search:
        try:
            config_args["tools"] = [{"google_search": {}}]
        except Exception:
            pass

    config = types.GenerateContentConfig(**config_args) if config_args else None

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config
        )
        return response.text or ""
    except Exception as e:
        logger.error(f"Gemini API generation failed: {e}")
        raise e
