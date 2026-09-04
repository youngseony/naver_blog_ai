from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.config import settings
from app.database import init_db
from app.routers import workflow, history, settings as settings_router

app = FastAPI(
    title="Naver Blog AI Automation Backend",
    description="네이버 블로그 상위 노출 자동화 AI 어시스턴트 API",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(workflow.router)
app.include_router(history.router)
app.include_router(settings_router.router)

# 이미지 정적 서빙
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/static/images", StaticFiles(directory=settings.UPLOAD_DIR), name="static_images")

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "service": "Naver Blog AI Automation"}
