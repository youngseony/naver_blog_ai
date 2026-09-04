import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel

from app.services.prompt_templates import (
    STEP1_RESEARCH_PROMPT,
    STEP2_OUTLINE_PROMPT,
    STEP3_CONTENT_PROMPT,
    STEP4_IMAGES_PROMPT,
)
from app.services.gemini_service import (
    generate_with_gemini,
    clean_json_response,
    get_active_api_key
)
from app.services.naver_editor_formatter import markdown_to_smart_editor_html
from app.services.mock_data import (
    generate_mock_research,
    generate_mock_outline,
    generate_mock_content,
    generate_mock_images
)
from app.database import save_post

router = APIRouter(prefix="/api/workflow", tags=["workflow"])
logger = logging.getLogger("uvicorn.error")

class ResearchRequest(BaseModel):
    topic: str
    additional_context: Optional[str] = ""
    use_search: Optional[bool] = True

class OutlineRequest(BaseModel):
    primary_keyword: str
    sub_keywords: List[str]
    briefing: Dict[str, Any]

class ContentRequest(BaseModel):
    primary_keyword: str
    sub_keywords: List[str]
    briefing: Dict[str, Any]
    outline: Dict[str, Any]
    tone: Optional[str] = "친절하고 전문적인 말투"
    title_hint: Optional[str] = ""

class ImagesRequest(BaseModel):
    title: str
    primary_keyword: str
    content_summary: str

class SavePostRequest(BaseModel):
    post_id: Optional[int] = None
    topic: str
    primary_keyword: str = ""
    sub_keywords: List[str] = []
    briefing: Dict[str, Any] = {}
    outline: Dict[str, Any] = {}
    title: str = ""
    content: str = ""
    images: List[Dict[str, Any]] = []

@router.post("/research")
async def step1_research(req: ResearchRequest):
    """1단계: 실시간 자료 검색 & 블로그 기획 6단계 브리핑 도출"""
    api_key = await get_active_api_key()
    if not api_key:
        return {"source": "mock", "data": generate_mock_research(req.topic)}

    prompt = STEP1_RESEARCH_PROMPT.format(
        topic=req.topic,
        additional_context=req.additional_context or "없음"
    )
    try:
        raw_res = await generate_with_gemini(
            prompt=prompt,
            system_instruction="당신은 한국 네이버 블로그 전문 검색최적화 수석 기획자입니다. JSON 형식으로만 답변하세요.",
            use_search=req.use_search
        )
        data = clean_json_response(raw_res)
        if "error" in data:
            return {"source": "mock_fallback", "data": generate_mock_research(req.topic), "note": "Gemini 응답 파싱 실패로 기본 추천 데이터 반환"}
        return {"source": "gemini", "data": data}
    except Exception as e:
        logger.error(f"Step 1 failed: {e}")
        return {"source": "mock_fallback", "data": generate_mock_research(req.topic), "error": str(e)}

@router.post("/outline")
async def step2_outline(req: OutlineRequest):
    """2단계: 3계층 목차 (H1-H2-H3) 및 시각적 요소 구조 설계"""
    api_key = await get_active_api_key()
    if not api_key:
        return {"source": "mock", "data": generate_mock_outline(req.primary_keyword)}

    prompt = STEP2_OUTLINE_PROMPT.format(
        primary_keyword=req.primary_keyword,
        sub_keywords=", ".join(req.sub_keywords),
        briefing=json.dumps(req.briefing, ensure_ascii=False)
    )
    try:
        raw_res = await generate_with_gemini(
            prompt=prompt,
            system_instruction="당신은 네이버 블로그 콘텐츠 구조화 전문가입니다. JSON 형식으로만 응답하세요."
        )
        data = clean_json_response(raw_res)
        if "error" in data:
            return {"source": "mock_fallback", "data": generate_mock_outline(req.primary_keyword)}
        return {"source": "gemini", "data": data}
    except Exception as e:
        logger.error(f"Step 2 failed: {e}")
        return {"source": "mock_fallback", "data": generate_mock_outline(req.primary_keyword), "error": str(e)}

@router.post("/content")
async def step3_content(req: ContentRequest):
    """3단계: 제목 3선, PAS 도입부, 4줄 이내 모바일 최적화 본문 및 스마트에디터 HTML 작성"""
    api_key = await get_active_api_key()
    if not api_key:
        mock = generate_mock_content(req.title_hint, req.primary_keyword)
        html = markdown_to_smart_editor_html(mock["content_markdown"], mock["selected_title"])
        mock["content_html"] = html
        return {"source": "mock", "data": mock}

    prompt = STEP3_CONTENT_PROMPT.format(
        primary_keyword=req.primary_keyword,
        sub_keywords=", ".join(req.sub_keywords),
        briefing=json.dumps(req.briefing, ensure_ascii=False),
        outline=json.dumps(req.outline, ensure_ascii=False),
        tone=req.tone
    )
    try:
        raw_res = await generate_with_gemini(
            prompt=prompt,
            system_instruction="당신은 네이버 상위 0.1% 인플루언서 전문 카피라이터입니다. JSON 형식으로 응답하세요."
        )
        data = clean_json_response(raw_res)
        if "error" in data or "content_markdown" not in data:
            mock = generate_mock_content(req.title_hint, req.primary_keyword)
            mock["content_html"] = markdown_to_smart_editor_html(mock["content_markdown"], mock["selected_title"])
            return {"source": "mock_fallback", "data": mock}
        
        # 스마트에디터 최적화 HTML 인라인 생성
        selected_title = data.get("selected_title") or (data.get("title_candidates") or ["포스팅"])[0]
        selected_subtitle = data.get("selected_subtitle") or ""
        data["content_html"] = markdown_to_smart_editor_html(data["content_markdown"], selected_title, selected_subtitle)
        return {"source": "gemini", "data": data}
    except Exception as e:
        logger.error(f"Step 3 failed: {e}")
        mock = generate_mock_content(req.title_hint, req.primary_keyword)
        mock["content_html"] = markdown_to_smart_editor_html(mock["content_markdown"], mock["selected_title"], mock.get("selected_subtitle", ""))
        return {"source": "mock_fallback", "data": mock, "error": str(e)}

@router.post("/images")
async def step4_images(req: ImagesRequest):
    """4단계: 썸네일(1:1) 및 본문 이미지(16:9) 2~3개 프롬프트 자동 생성"""
    api_key = await get_active_api_key()
    if not api_key:
        return {"source": "mock", "data": {"images": generate_mock_images(req.title, req.primary_keyword)}}

    prompt = STEP4_IMAGES_PROMPT.format(
        title=req.title,
        primary_keyword=req.primary_keyword,
        content_summary=req.content_summary[:800]
    )
    try:
        raw_res = await generate_with_gemini(
            prompt=prompt,
            system_instruction="당신은 AI 아트 비주얼 디렉터입니다. JSON 형식으로만 응답하세요."
        )
        data = clean_json_response(raw_res)
        if "error" in data or "images" not in data:
            return {"source": "mock_fallback", "data": {"images": generate_mock_images(req.title, req.primary_keyword)}}
        return {"source": "gemini", "data": data}
    except Exception as e:
        logger.error(f"Step 4 failed: {e}")
        return {"source": "mock_fallback", "data": {"images": generate_mock_images(req.title, req.primary_keyword)}, "error": str(e)}

@router.post("/save")
async def save_workflow_post(req: SavePostRequest):
    """최종 작성된 포스팅을 SQLite DB에 저장 또는 갱신"""
    post_id = await save_post(
        topic=req.topic,
        primary_keyword=req.primary_keyword,
        sub_keywords=req.sub_keywords,
        briefing=req.briefing,
        outline=req.outline,
        title=req.title,
        content=req.content,
        images=req.images,
        post_id=req.post_id
    )
    return {"status": "success", "post_id": post_id}
