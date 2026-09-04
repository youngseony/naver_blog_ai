"""
네이버 스마트에디터 ONE 서식 완벽 호환 HTML 변환기
마크다운 및 텍스트를 네이버 블로그 에디터에 그대로 붙여넣었을 때 미려하게 렌더링되도록
인라인 스타일이 적용된 HTML로 변환합니다.
"""
import re

def format_inline_text(text: str) -> str:
    if not text:
        return ""
    # 1. **볼드** -> 네이버 블로그 스마트에디터 스타일 강조 (<strong style="...">)
    formatted = re.sub(r"\*\*(.*?)\*\*", r'<strong style="color: #0f172a; background: linear-gradient(to top, #dcfce7 45%, transparent 45%); padding: 0 3px; font-weight: 700;">\1</strong>', text)
    # 2. 잔존하는 날것의 ** 기호 완전 제거
    formatted = formatted.replace("**", "")
    return formatted

def markdown_to_smart_editor_html(markdown_text: str, title: str = "", subtitle: str = "") -> str:
    lines = (markdown_text or "").split("\n")
    html_parts = []

    # 전체 컨테이너 스타일 (네이버 블로그 본문 기본 폰트 및 모바일 최적화 여백)
    container_style = 'font-family: -apple-system, BlinkMacSystemFont, "Nanum Gothic", "Malgun Gothic", "Apple SD Gothic Neo", sans-serif; font-size: 16px; line-height: 1.85; color: #333333; word-break: keep-all; letter-spacing: -0.3px;'

    html_parts.append(f'<div class="se-main-container" style="{container_style}">')

    if title:
        # 타이틀 헤더 스타일
        subtitle_html = ""
        if subtitle:
            subtitle_html = f'<p style="font-size: 15px; font-weight: 600; color: #64748b; margin: 8px 0 0 0; line-height: 1.6;">{format_inline_text(subtitle)}</p>'
        html_parts.append(f'''
        <div style="margin-bottom: 30px; padding-bottom: 18px; border-bottom: 2px solid #03c75a;">
            <h1 style="font-size: 26px; font-weight: 800; color: #111111; line-height: 1.35; margin: 0;">{title}</h1>
            {subtitle_html}
        </div>
        ''')

    for line in lines:
        raw_line = line.strip()

        # 인용구 블록 감지 [인용구: ...]
        if raw_line.startswith("[인용구") or raw_line.startswith("> "):
            quote_text = re.sub(r"^\[인용구[^\]]*\]\s*|^>\s*", "", raw_line)
            clean_quote = format_inline_text(quote_text)
            html_parts.append(f'''
            <div style="margin: 28px 0; padding: 20px 24px; border-left: 4px solid #03c75a; background-color: #f8fbf9; border-radius: 0 8px 8px 0;">
                <p style="font-size: 17px; font-weight: 600; color: #028a3e; margin: 0; line-height: 1.6;">“{clean_quote}”</p>
            </div>
            ''')
            continue

        # 요약 박스 / 콜아웃 감지 [요약박스: ...]
        if raw_line.startswith("[요약") or raw_line.startswith("[팁") or raw_line.startswith("[체크"):
            box_text = re.sub(r"^\[[^\]]*\]\s*", "", raw_line)
            clean_box = format_inline_text(box_text)
            html_parts.append(f'''
            <div style="margin: 28px 0; padding: 22px 24px; background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 12px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="background: #03c75a; color: white; font-size: 12px; font-weight: bold; padding: 3px 8px; border-radius: 4px; margin-right: 8px;">핵심 포인트</span>
                </div>
                <p style="font-size: 15.5px; color: #475569; margin: 0; line-height: 1.75;">{clean_box}</p>
            </div>
            ''')
            continue

        # 이미지 배치 플레이스홀더 감지 [이미지: ...]
        if "[이미지" in raw_line or "![image" in raw_line or "![이미지" in raw_line:
            img_label = re.sub(r"[\[\]!]", "", raw_line)
            html_parts.append(f'''
            <div style="margin: 32px 0; text-align: center;">
                <div style="padding: 40px 20px; background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; color: #64748b;">
                    <p style="font-size: 14px; font-weight: 600; margin: 0 0 6px 0;">📸 {img_label}</p>
                    <span style="font-size: 12px; color: #94a3b8;">(스마트에디터 작성 시 여기에 생성된 이미지를 업로드하세요)</span>
                </div>
            </div>
            ''')
            continue

        # H2 소제목
        if raw_line.startswith("## "):
            h2_text = format_inline_text(raw_line[3:].strip())
            html_parts.append(f'''
            <div style="margin-top: 40px; margin-bottom: 18px;">
                <h2 style="font-size: 21px; font-weight: 700; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin: 0;">
                    <span style="color: #03c75a; margin-right: 6px;">■</span>{h2_text}
                </h2>
            </div>
            ''')
            continue

        # H3 소제목
        if raw_line.startswith("### "):
            h3_text = format_inline_text(raw_line[4:].strip())
            html_parts.append(f'''
            <div style="margin-top: 26px; margin-bottom: 12px;">
                <h3 style="font-size: 18px; font-weight: 600; color: #334155; margin: 0;">
                    ✔ {h3_text}
                </h3>
            </div>
            ''')
            continue

        # 일반 문단 (빈 줄은 문단 간격)
        if not raw_line:
            html_parts.append('<div style="height: 16px;"></div>')
            continue

        # 인라인 서식 처리
        formatted_line = format_inline_text(raw_line)

        # 불릿 리스트 (- 또는 * )
        if raw_line.startswith("- ") or raw_line.startswith("* "):
            list_content = format_inline_text(raw_line[2:].strip())
            html_parts.append(f'''
            <div style="display: flex; align-items: flex-start; margin-bottom: 8px; padding-left: 4px;">
                <span style="color: #03c75a; font-weight: bold; margin-right: 8px;">•</span>
                <span style="font-size: 16px; color: #334155; line-height: 1.75;">{list_content}</span>
            </div>
            ''')
            continue

        # 일반 텍스트 문단
        html_parts.append(f'<p style="margin: 0 0 16px 0; font-size: 16px; color: #334155; line-height: 1.85;">{formatted_line}</p>')

    html_parts.append('</div>')
    return "\n".join(html_parts)
