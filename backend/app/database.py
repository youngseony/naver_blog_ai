import aiosqlite
import json
from datetime import datetime
from typing import Optional, List, Dict, Any
from app.config import settings

_db_initialized = False

async def init_db():
    async with aiosqlite.connect(settings.DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                topic TEXT NOT NULL,
                primary_keyword TEXT,
                sub_keywords TEXT,
                briefing TEXT,
                outline TEXT,
                title TEXT,
                content TEXT,
                images TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()

async def ensure_db():
    global _db_initialized
    if not _db_initialized:
        await init_db()
        _db_initialized = True

async def get_db():
    await ensure_db()
    db = await aiosqlite.connect(settings.DB_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()

async def get_setting(key: str, default: str = "") -> str:
    await ensure_db()
    async with aiosqlite.connect(settings.DB_PATH) as db:
        async with db.execute("SELECT value FROM settings WHERE key = ?", (key,)) as cursor:
            row = await cursor.fetchone()
            if row:
                return row[0]
            return default

async def set_setting(key: str, value: str):
    await ensure_db()
    async with aiosqlite.connect(settings.DB_PATH) as db:
        await db.execute("""
            INSERT INTO settings (key, value, updated_at) 
            VALUES (?, ?, CURRENT_TIMESTAMP)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
        """, (key, value))
        await db.commit()

async def save_post(
    topic: str,
    primary_keyword: str = "",
    sub_keywords: List[str] = None,
    briefing: Dict[str, Any] = None,
    outline: Dict[str, Any] = None,
    title: str = "",
    content: str = "",
    images: List[Dict[str, Any]] = None,
    post_id: Optional[int] = None
) -> int:
    await ensure_db()
    sub_keywords_json = json.dumps(sub_keywords or [], ensure_ascii=False)
    briefing_json = json.dumps(briefing or {}, ensure_ascii=False)
    outline_json = json.dumps(outline or {}, ensure_ascii=False)
    images_json = json.dumps(images or [], ensure_ascii=False)

    async with aiosqlite.connect(settings.DB_PATH) as db:
        if post_id:
            await db.execute("""
                UPDATE posts 
                SET topic = ?, primary_keyword = ?, sub_keywords = ?, 
                    briefing = ?, outline = ?, title = ?, content = ?, 
                    images = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (topic, primary_keyword, sub_keywords_json, briefing_json, outline_json, title, content, images_json, post_id))
            await db.commit()
            return post_id
        else:
            cursor = await db.execute("""
                INSERT INTO posts (topic, primary_keyword, sub_keywords, briefing, outline, title, content, images)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (topic, primary_keyword, sub_keywords_json, briefing_json, outline_json, title, content, images_json))
            await db.commit()
            return cursor.lastrowid

async def list_posts(limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
    await ensure_db()
    async with aiosqlite.connect(settings.DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("""
            SELECT id, topic, primary_keyword, title, created_at, updated_at 
            FROM posts 
            ORDER BY updated_at DESC 
            LIMIT ? OFFSET ?
        """, (limit, offset)) as cursor:
            rows = await cursor.fetchall()
            return [dict(row) for row in rows]

async def get_post(post_id: int) -> Optional[Dict[str, Any]]:
    await ensure_db()
    async with aiosqlite.connect(settings.DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM posts WHERE id = ?", (post_id,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                return None
            data = dict(row)
            try:
                data["sub_keywords"] = json.loads(data["sub_keywords"] or "[]")
                data["briefing"] = json.loads(data["briefing"] or "{}")
                data["outline"] = json.loads(data["outline"] or "{}")
                data["images"] = json.loads(data["images"] or "[]")
            except Exception:
                pass
            return data

async def delete_post(post_id: int) -> bool:
    await ensure_db()
    async with aiosqlite.connect(settings.DB_PATH) as db:
        cursor = await db.execute("DELETE FROM posts WHERE id = ?", (post_id,))
        await db.commit()
        return cursor.rowcount > 0
