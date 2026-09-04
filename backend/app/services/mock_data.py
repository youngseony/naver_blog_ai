"""
API 키 미등록 시 즉각적인 프로토타입 체험을 지원하는 지능형 Mock 생성기
실제 네이버 블로그 상위 노출 규격(PAS, GEO, AIDA)을 준수한 고품질 데이터 생성
"""
from typing import Dict, Any, List

def generate_mock_research(topic: str) -> Dict[str, Any]:
    base_keyword = topic.split()[0] if topic else "네이버 블로그 마케팅"
    return {
        "primary_keyword": f"{base_keyword} 상위노출 비법",
        "sub_keywords": [
            f"{base_keyword} 최적화 가이드",
            f"{base_keyword} 방문자 늘리기",
            f"2025 {base_keyword} 필수 조건",
            f"{base_keyword} C-Rank 알고리즘"
        ],
        "briefing": {
            "purpose": f"{topic}에 대한 검색자의 가장 가려운 곳을 긁어주고, 실천 가능한 실행 로드맵을 제공하여 팬덤과 이웃을 확보합니다.",
            "target_audience": f"{topic}을 처음 시작하거나 열심히 글을 써도 노출이 되지 않아 고민인 2040 직장인 및 자영업자",
            "core_problem": "열심히 시간을 들여 포스팅을 작성해도 방문자 수가 늘지 않고 검색 결과 3페이지 밖으로 밀려나는 허탈함",
            "solution": "최신 D.I.A.+ 알고리즘이 선호하는 독자 체류 시간 중심의 글 구조와 실시간 검색어 롱테일 공략법 적용",
            "differentiation": "단순 이론이 아닌 실제 상위 1% 블로거들이 비밀리에 사용하는 PAS 글쓰기 공식과 모바일 최적화 배치 템플릿 제공",
            "call_to_action": "글 하단에 본인 블로그 상황을 댓글로 남기면 1:1 맞춤 피드백을 제공하겠다고 공지하여 댓글/공감 극대화"
        },
        "market_insight": f"최근 검색 이용자들은 장황한 서론을 건너뛰고 모바일에서 3초 안에 결론을 확인하기를 원합니다. {base_keyword} 관련 글은 서론의 PAS 공식과 시각적 요약 박스가 승부처입니다."
    }

def generate_mock_outline(primary_keyword: str) -> Dict[str, Any]:
    return {
        "sections": [
            {
                "level": "H2",
                "title": "글을 아무리 써도 방문자가 0명인 충격적인 진짜 이유",
                "type": "intro",
                "key_points": ["독자의 뼈아픈 현실 공감 (시간 낭비)", "3분만 투자하면 노출 공식이 바뀌는 이유"],
                "visual_element": "인용구 (따옴표) 블록"
            },
            {
                "level": "H2",
                "title": f"네이버 알고리즘이 무조건 사랑하는 3가지 핵심 규칙",
                "type": "body",
                "sub_sections": [
                    { "level": "H3", "title": "첫째, 4줄 이내 호흡과 모바일 가독성", "point": "스마트폰 화면에서 텍스트가 뭉치지 않게 줄바꿈하는 기술" },
                    { "level": "H3", "title": "둘째, 롱테일 서브 키워드 자연스러운 배치", "point": "본문 전체에 걸쳐 4~5회 물 흐르듯 녹여내는 방법" }
                ],
                "visual_element": "핵심 체크리스트 박스"
            },
            {
                "level": "H2",
                "title": "실제 상위 1% 블로거들이 쓰는 PAS 황금 구조",
                "type": "body",
                "sub_sections": [
                    { "level": "H3", "title": "문제(P) - 자극(A) - 해결(S) 단계별 작성법", "point": "이탈률을 70%에서 15%로 낮추는 마법의 도입부" },
                    { "level": "H3", "title": "Before vs After 효과 비교", "point": "일반 포스팅 vs 최적화 포스팅 체류 시간 차이" }
                ],
                "visual_element": "비교표 (Table)"
            },
            {
                "level": "H2",
                "title": "자주 묻는 질문(FAQ): 이것만은 절대 하지 마세요!",
                "type": "faq",
                "key_points": ["키워드 무한 반복(어뷰징)의 위험성", "외부 링크 삽입 시 저품질 피하는 올바른 팁"],
                "visual_element": "Q&A 박스"
            },
            {
                "level": "H2",
                "title": "오늘부터 바로 써먹는 3줄 요약 & 마무리 실천법",
                "type": "conclusion",
                "key_points": ["3줄 핵심 총정리", "댓글로 궁금한 점 소통 유도"],
                "visual_element": "최종 콜아웃 배너"
            }
        ]
    }

def generate_mock_content(title: str, primary_keyword: str) -> Dict[str, Any]:
    titles = [
        f"아직도 이것 몰라요? {primary_keyword} 상위 1% 비밀",
        f"방문자 10배 폭발시키는 {primary_keyword} 3가지 공식",
        f"2025 최신판 {primary_keyword} 완벽 정리 (이것만 보세요)"
    ]
    selected_title = title or titles[0]

    md = f"""[인용구: 따옴표]
"매일 2시간씩 정성껏 글을 쓰는데, 왜 내 글은 조회수가 두 자릿수에서 멈출까요?"

안녕하세요, 유용한 인사이트를 전해드리는 블로그 에디터입니다.

혹시 지금도 모니터 앞에서 하얀 빈 화면을 보며
**"도대체 어떤 글을 써야 네이버 상위에 뜰까?"**
고민하고 계시지 않으신가요?

밤새워 쓴 글이 검색 5페이지 너머로 밀려날 때의
그 막막함과 허탈함은 저 역시 뼈저리게 겪어보았기에
누구보다 그 마음을 깊이 공감합니다.

하지만 안심하세요!
네이버 상위 노출은 결코 운이나 타고난 글재주가 아닙니다.
**알고리즘의 원리와 독자의 시선을 사로잡는 구조**만 알면
누구나 오늘 당장 첫 페이지의 주인공이 될 수 있습니다.

지금부터 그 핵심 비결을 하나씩 공개합니다!

---

[이미지: 대표 썸네일 - 호기심을 유발하는 깔끔한 인포그래픽]

## ■ 네이버 알고리즘이 무조건 사랑하는 3가지 핵심 규칙

많은 분들이 키워드만 많이 넣으면 상위에 뜬다고 오해하십니다.
하지만 무분별한 반복은 오히려 블로그 품질을 떨어뜨립니다.

네이버의 최신 D.I.A.+ 알고리즘이 가장 주목하는 것은
다름 아닌 **'체류 시간'**과 **'독자의 반응'**입니다.

[요약: 모바일 최적화 3원칙]
- 한 문단은 스마트폰 기준 3~4줄 이내로 끊어서 작성
- 본문 중간중간 핵심 요약 박스와 인용구로 지루함 해소
- {primary_keyword}는 문맥에 맞게 자연스럽게 4~5회 배치

이렇게 글의 구조를 바꾸는 것만으로도
독자의 체류 시간은 평균 40초에서 2분 30초로 급증합니다!

---

[이미지: 모바일 가독성 최적화 예시 화면]

## ■ 독자를 끝까지 읽게 만드는 PAS 황금 공식

상위 1% 인플루언서들이 글을 시작할 때
무의식적으로 사용하는 마법의 공식이 있습니다.
바로 **P - A - S 공식**입니다.

1. **Problem (문제 제기)**: 독자가 지금 겪고 있는 답답한 현실을 짚어줍니다.
2. **Agitation (문제 자극)**: 이 문제를 방치했을 때 생길 손해를 상기시킵니다.
3. **Solution (해결책 제시)**: "이 글에서 속 시원한 해답을 드리겠습니다"라는 확신을 줍니다.

이 3단계 도입부를 적용하면,
글을 누르자마자 뒤로 가기를 누르던 이탈률이 획기적으로 줄어듭니다.

---

[이미지: 실전 글쓰기 체크리스트 인포그래픽]

## ■ 자주 묻는 질문 (FAQ) & 주의사항

많은 이웃님들이 질문해주신 핵심 2가지입니다.

**Q. 하루에 몇 개씩 글을 올려야 효과가 있나요?**
A. 양보다 질입니다. 의미 없는 1일 1포스팅보다, 독자에게 진정한 가치를 주는 고품질 글 1편이 블로그 지수를 훨씬 빠르게 올립니다.

**Q. 본문에 이미지는 몇 장이 적당한가요?**
A. 본문 길이에 따라 다르지만, 소주제(H2)마다 1장씩 총 3~4장이 모바일 가독성에 가장 이상적입니다.

---

## ■ 마치며: 오늘부터 바로 시작해보세요!

오늘 알아본 핵심 내용을 3줄로 정리해볼까요?

1. 키워드 억지 반복 대신 **독자의 체류 시간**에 집중하기
2. 모바일 가독성을 위해 **3~4줄 단위로 문단 끊기**
3. 도입부에 **PAS 공식**으로 독자의 시선 사로잡기

글쓰기는 연습할수록 반드시 성장합니다.
오늘 소개해 드린 팁을 바탕으로 당장 오늘 저녁 멋진 글을 발행해보세요!

혹시 여러분의 블로그를 운영하시면서 가장 고민되는 점이 있으신가요?
댓글로 남겨주시면 정성껏 답변해 드리겠습니다.

오늘 글이 도움이 되셨다면 **공감(하트)**과 **이웃 추가** 부탁드립니다! 감사합니다.
"""
    return {
        "title_candidates": titles,
        "selected_title": selected_title,
        "content_markdown": md,
        "seo_score_analysis": {
            "keyword_density": "적정 (4회 자연스럽게 노출)",
            "readability": "모바일 가독성 최상 (3~4줄 단락 분리 완벽)",
            "engagement_points": "PAS 도입부, Q&A, 댓글 유도 완료"
        }
    }

def generate_mock_images(title: str, primary_keyword: str) -> List[Dict[str, Any]]:
    return [
        {
            "role": "thumbnail",
            "ratio": "1:1",
            "section_label": "대표 썸네일 (메인 피드용)",
            "description_ko": f"'{primary_keyword}'를 주제로 호기심을 자극하는 세련된 3D 아이콘과 화사한 네온 그린 컬러의 1:1 대표 썸네일",
            "prompt_en": f"Eye-catching modern 3D illustration representing {primary_keyword}, bright emerald green and soft white lighting, clean minimal background, professional social media cover art, octane render, 8k --ar 1:1",
            "negative_prompt_en": "ugly, low quality, distorted text, cluttered, watermark",
            "style_recommendation": "클린 3D 미니멀리즘",
            "preview_url": "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600&auto=format&fit=crop&q=80"
        },
        {
            "role": "content_1",
            "ratio": "16:9",
            "section_label": "본문 1섹션 - 핵심 문제 공감",
            "description_ko": "모니터 앞에서 깊은 고민에 빠진 현대적인 직장인과 커피 한 잔이 놓인 감성적인 데스크 환경",
            "prompt_en": "Cozy and realistic photograph of a person typing on a laptop in a modern cafe workspace, warm cinematic lighting, shallow depth of field, natural candid shot --ar 16:9",
            "negative_prompt_en": "oversaturated, artificial, cartoon, blurry",
            "style_recommendation": "자연광 실사 포토",
            "preview_url": "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80"
        },
        {
            "role": "content_2",
            "ratio": "16:9",
            "section_label": "본문 2섹션 - 스마트폰 모바일 최적화",
            "description_ko": "스마트폰을 손에 쥐고 편리하게 블로그 피드를 스크롤하는 깨끗하고 밝은 일상 컷",
            "prompt_en": "Clean and bright lifestyle photo showing a person holding a modern smartphone reading clean blog layout, minimalist aesthetic, soft daylight --ar 16:9",
            "negative_prompt_en": "dark, grainy, lowres, distorted fingers",
            "style_recommendation": "밝은 라이프스타일 샷",
            "preview_url": "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=800&auto=format&fit=crop&q=80"
        },
        {
            "role": "content_3",
            "ratio": "16:9",
            "section_label": "본문 3섹션 - 성공적인 피날레 및 소통",
            "description_ko": "상승하는 성과 그래프와 목표 달성을 축하하는 따뜻하고 긍정적인 데스크탑 비주얼",
            "prompt_en": "Inspirational and uplifting workspace scene with bright growth chart analytics on tablet, glowing natural sunshine, cheerful productive vibe --ar 16:9",
            "negative_prompt_en": "depressing, dark, messy",
            "style_recommendation": "따뜻한 성과/희망 톤",
            "preview_url": "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80"
        }
    ]
