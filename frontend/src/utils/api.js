import { 
  getClientMockResearch, 
  getClientMockOutline, 
  getClientMockContent, 
  getClientMockImages,
  clientMarkdownToSmartEditorHtml 
} from './clientServices';

const BASE_URL = '';

// 브라우저 로컬 스토리지 키
const STORAGE_SETTINGS_KEY = 'naver_blog_ai_settings';
const STORAGE_POSTS_KEY = 'naver_blog_ai_posts';

// 로컬 설정 헬퍼
function getLocalSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : { gemini_api_key: '', gemini_model: 'gemini-2.5-flash' };
  } catch (e) {
    return { gemini_api_key: '', gemini_model: 'gemini-2.5-flash' };
  }
}

function saveLocalSettings(newSettings) {
  try {
    const current = getLocalSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return newSettings;
  }
}

// 로컬 포스트 헬퍼
function getLocalPosts() {
  try {
    const raw = localStorage.getItem(STORAGE_POSTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLocalPost(post) {
  try {
    const posts = getLocalPosts();
    const now = new Date().toISOString();
    if (post.post_id || post.id) {
      const id = post.post_id || post.id;
      const index = posts.findIndex((p) => p.id === id);
      if (index !== -1) {
        posts[index] = { ...posts[index], ...post, id, updated_at: now };
      } else {
        posts.unshift({ ...post, id, created_at: now, updated_at: now });
      }
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
      return id;
    } else {
      const newId = Date.now();
      posts.unshift({ ...post, id: newId, created_at: now, updated_at: now });
      localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(posts));
      return newId;
    }
  } catch (e) {
    console.error('Local post save error:', e);
    return Date.now();
  }
}

// 무료 권장 안정화 모델 목록 (실패 시 자동 폴백 우선순위)
export const FREE_FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];

// Google API 실시간 사용 가능 모델 목록 조회
export async function fetchAvailableGeminiModels(apiKey = null) {
  const settings = getLocalSettings();
  const key = (apiKey || settings.gemini_api_key || '').trim();
  if (!key) throw new Error('Google AI Studio API 키를 먼저 입력해 주세요.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'x-goog-api-key': key
    }
  });

  if (!res.ok) {
    let msg = `HTTP ${res.status} 오류`;
    try {
      const j = await res.json();
      if (j.error?.message) msg = j.error.message;
    } catch (e) {}
    throw new Error(msg);
  }

  const data = await res.json();
  // generateContent를 지원하는 gemini 모델만 추출
  const models = (data.models || [])
    .filter(m => m.supportedGenerationMethods?.includes('generateContent') && m.name.includes('gemini'))
    .map(m => {
      const cleanName = m.name.replace('models/', '');
      const isPaidTier = cleanName.includes('pro') || cleanName.includes('3.6') || cleanName.includes('ultra');
      return {
        id: cleanName,
        name: cleanName,
        displayName: m.displayName || cleanName,
        description: m.description || '',
        tier: isPaidTier ? 'paid' : 'free',
        tierLabel: isPaidTier ? '유료(종량제 권장)' : '무료(Free Tier 추천)'
      };
    });

  return models;
}

// 브라우저 직접 Gemini API 호출 (자동 폴백 지원)
async function callGeminiDirectClient(prompt, systemInstruction = '', overrideApiKey = null, overrideModel = null) {
  const settings = getLocalSettings();
  const apiKey = (overrideApiKey || settings.gemini_api_key || '').trim();
  let model = (overrideModel || settings.gemini_model || 'gemini-2.5-flash').trim();

  if (!apiKey) return null;

  const tryCall = async (targetModel) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
    };
    if (systemInstruction) {
      body.system_instruction = { parts: [{ text: systemInstruction }] };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      let errDetail = `${res.status} ${res.statusText || 'Error'}`;
      try {
        const errJson = await res.json();
        if (errJson.error?.message) errDetail = errJson.error.message;
      } catch (e) {}
      throw new Error(errDetail);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  };

  try {
    return await tryCall(model);
  } catch (primaryErr) {
    console.warn(`선택된 모델(${model}) 호출 실패 (${primaryErr.message}). 무료 안정화 모델로 자동 폴백을 시도합니다...`);
    // 사용자가 선택한 모델이 실패한 경우, 무료 안정화 모델로 자동 전환 재시도
    for (const fallbackModel of FREE_FALLBACK_MODELS) {
      if (fallbackModel === model) continue;
      try {
        console.log(`무료 안정화 모델 [${fallbackModel}]로 자동 폴백 재시도 중...`);
        const fallbackText = await tryCall(fallbackModel);
        if (fallbackText) {
          console.log(`무료 모델 [${fallbackModel}] 자동 폴백 성공!`);
          return fallbackText;
        }
      } catch (fbErr) {
        console.warn(`[${fallbackModel}] 폴백 실패:`, fbErr.message);
      }
    }
    throw primaryErr;
  }
}

export async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn(`Backend fetch failed for ${endpoint}, using client fallback.`);
  }

  // 백엔드가 없거나 에러일 경우 클라이언트 폴백 수행
  return null;
}

export const WorkflowAPI = {
  research: async (topic, additionalContext, useSearch = true) => {
    const serverRes = await apiRequest('/api/workflow/research', 'POST', {
      topic,
      additional_context: additionalContext,
      use_search: useSearch,
    });
    if (serverRes) return serverRes;

    // 클라이언트 모드
    try {
      const prompt = `당신은 네이버 블로그 SEO 수석 기획자입니다.
주제: '${topic}'
참고 내용 및 포인트: '${additionalContext || ''}'

반드시 다음 JSON 규격으로만 응답하세요:
{
  "primary_keyword": "상위 노출 메인 1차 키워드",
  "sub_keywords": ["연관 키워드 1", "연관 키워드 2", "연관 키워드 3", "연관 키워드 4"],
  "briefing": {
    "purpose": "글의 목적",
    "target_audience": "타깃 독자층",
    "core_problem": "핵심 고통점(Problem)",
    "solution": "제시할 솔루션",
    "differentiation": "차별화 요소",
    "call_to_action": "전환 유도(CTA)"
  },
  "market_insight": "실시간 검색 트렌드 및 유입 인사이트 요약"
}`;
      const directText = await callGeminiDirectClient(prompt);
      if (directText) {
        const jsonMatch = directText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, directText];
        const parsed = JSON.parse(jsonMatch[1]);
        return { source: 'gemini_client', data: parsed };
      }
    } catch (e) {
      console.warn('Gemini client call failed, using mock:', e);
    }
    return { source: 'mock_client', data: getClientMockResearch(topic) };
  },

  outline: async (primaryKeyword, subKeywords, briefing) => {
    const serverRes = await apiRequest('/api/workflow/outline', 'POST', {
      primary_keyword: primaryKeyword,
      sub_keywords: subKeywords,
      briefing,
    });
    if (serverRes) return serverRes;

    try {
      const prompt = `당신은 네이버 블로그 스마트에디터 ONE 전문 콘텐츠 기획자입니다.
메인 키워드: ${primaryKeyword}
서브 키워드: ${(subKeywords || []).join(', ')}
기획 브리핑: ${JSON.stringify(briefing)}

반드시 다음 JSON 규격으로만 3단계 목차(sections)를 반환하세요 (마크다운 코드블록 안에 json):
{
  "sections": [
    {
      "section_number": 1,
      "title": "소제목 (H2)",
      "visual_element": "추천 시각요소 (예: 인포그래픽, 카드뉴스 등)",
      "sub_sections": [
        { "title": "세부항목 (H3)", "point": "설명" }
      ],
      "key_points": ["체크포인트 1", "체크포인트 2"]
    }
  ]
}`;
      const directText = await callGeminiDirectClient(prompt);
      if (directText) {
        const jsonMatch = directText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, directText];
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.sections && Array.isArray(parsed.sections)) {
          return { source: 'gemini_client', data: parsed };
        }
      }
    } catch (e) {
      console.warn('Gemini client outline call failed, using mock:', e);
    }

    return { source: 'mock_client', data: getClientMockOutline(primaryKeyword) };
  },

  content: async (primaryKeyword, subKeywords, briefing, outline, tone, titleHint) => {
    const serverRes = await apiRequest('/api/workflow/content', 'POST', {
      primary_keyword: primaryKeyword,
      sub_keywords: subKeywords,
      briefing,
      outline,
      tone,
      title_hint: titleHint,
    });
    if (serverRes) return serverRes;

    try {
      const prompt = `당신은 네이버 상위 0.1% 블로그 전문 작가입니다.
메인 키워드: ${primaryKeyword}
서브 키워드: ${(subKeywords || []).join(', ')}
말투/톤: ${tone || '친절하고 전문적인 말투'}
희망 제목 또는 힌트: ${titleHint || ''}
기획 브리핑: ${JSON.stringify(briefing)}
목차: ${JSON.stringify(outline)}

★ 핵심 작성 및 서식 규칙:
1. 제목: 클릭률을 극대화하는 25자 내외 추천 제목 후보 3개
2. 부제목(Subtitle): 제목 하단에 배치되어 첫 화면 스크롤 체류 시간을 높이는 매력적인 1~2줄 요약/인용구 서브타이틀 후보 3개
3. PAS 공식 도입부 (Problem-Agitation-Solution)
4. 모바일 가독성: 3~4줄 이내 줄바꿈 및 문단 분리
5. ★ 절대 규칙: AI로 작성한 느낌을 주는 별표 볼드 기호(**)를 본문, 인용구, 요약 박스 내에 일절 삽입하지 마십시오. 강조가 필요한 부분도 기호 없이 자연스럽게 문장으로 표현하세요.
6. 스마트에디터 서식 마커([인용구: ...], [요약: ...], ## 소제목 등) 활용

반드시 다음 JSON 형식으로만 응답하세요:
{
  "selected_title": "가장 매력적인 25자 내외 추천 제목",
  "title_candidates": ["제목 후보 1", "제목 후보 2", "제목 후보 3"],
  "selected_subtitle": "독자의 호기심과 체류 시간을 높이는 매력적인 부제목",
  "subtitle_candidates": ["부제목 후보 1", "부제목 후보 2", "부제목 후보 3"],
  "content_markdown": "작성된 전체 마크다운 본문 (** 기호 일절 배제)",
  "seo_score_analysis": {
    "keyword_density": "1.8% (최적 범위)",
    "readability": "모바일 최적화 A+",
    "score": 98
  }
}`;
      const directText = await callGeminiDirectClient(prompt);
      if (directText) {
        const jsonMatch = directText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, directText];
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.content_markdown) {
          const contentHtml = clientMarkdownToSmartEditorHtml(
            parsed.content_markdown, 
            parsed.selected_title,
            parsed.selected_subtitle
          );
          return { 
            source: 'gemini_client', 
            data: { 
              ...parsed, 
              content_html: contentHtml 
            } 
          };
        }
      }
    } catch (e) {
      console.warn('Gemini client content call failed, using mock:', e);
    }

    const mock = getClientMockContent(titleHint, primaryKeyword);
    return { source: 'mock_client', data: mock };
  },

  images: async (title, primaryKeyword, contentSummary) => {
    const serverRes = await apiRequest('/api/workflow/images', 'POST', {
      title,
      primary_keyword: primaryKeyword,
      content_summary: contentSummary,
    });
    if (serverRes) return serverRes;

    try {
      const prompt = `네이버 블로그 포스팅에 사용할 이미지 프롬프트 4개를 기획하세요. (대표 썸네일 1:1 1장, 본문 이미지 16:9 3장).
포스팅 제목: ${title}
메인 키워드: ${primaryKeyword}

★ 엄격한 인물 및 스타일 규격 원칙:
1. 대표 썸네일은 네이버 블로그 공식 피드 및 모바일 검색 규격인 **1:1 정방형(Square)**으로 설정할 것.
2. 인물이 등장하는 모든 이미지는 **단정한 현대 한국인(authentic modern South Korean, East Asian appearance)**으로 기획할 것.
3. 서양인(caucasian, westerner), 흑인(african), 비동양인 인물은 절대 생성되지 않도록 네거티브 프롬프트에 엄격히 명시할 것.

반드시 다음 JSON 규격으로만 응답하세요:
{
  "images": [
    {
      "role": "thumbnail",
      "ratio": "1:1",
      "section_label": "대표 썸네일 (네이버 1:1 표준)",
      "description_ko": "한국어 이미지 설명",
      "prompt_en": "photorealistic or 3d, authentic modern South Korean aesthetic, bright cinematic lighting, 8k --ar 1:1",
      "negative_prompt_en": "caucasian, westerner, european, african, non-Korean ethnicity, foreign facial features, watermark, blurry, low quality",
      "style_recommendation": "클린 3D 또는 한국인 실사",
      "preview_url": "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600&auto=format&fit=crop&q=80"
    }
  ]
}`;
      const directText = await callGeminiDirectClient(prompt);
      if (directText) {
        const jsonMatch = directText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || [null, directText];
        const parsed = JSON.parse(jsonMatch[1]);
        if (parsed.images && Array.isArray(parsed.images) && parsed.images.length > 0) {
          return { source: 'gemini_client', data: parsed };
        }
      }
    } catch (e) {
      console.warn('Gemini client images call failed, using mock:', e);
    }

    return { source: 'mock_client', data: { images: getClientMockImages(title, primaryKeyword) } };
  },

  savePost: async (postData) => {
    const serverRes = await apiRequest('/api/workflow/save', 'POST', postData);
    if (serverRes) return serverRes;

    const savedId = saveLocalPost(postData);
    return { status: 'success', post_id: savedId, source: 'localStorage' };
  },
};

export const HistoryAPI = {
  list: async (limit = 50, offset = 0) => {
    const serverRes = await apiRequest(`/api/history?limit=${limit}&offset=${offset}`);
    if (serverRes) return serverRes;

    const localList = getLocalPosts().slice(offset, offset + limit);
    return { posts: localList, source: 'localStorage' };
  },
  get: async (id) => {
    const serverRes = await apiRequest(`/api/history/${id}`);
    if (serverRes) return serverRes;

    const found = getLocalPosts().find((p) => p.id === Number(id));
    if (!found) throw new Error('포스트를 찾을 수 없습니다.');
    return found;
  },
  delete: async (id) => {
    const serverRes = await apiRequest(`/api/history/${id}`, 'DELETE');
    if (serverRes) return serverRes;

    const filtered = getLocalPosts().filter((p) => p.id !== Number(id));
    localStorage.setItem(STORAGE_POSTS_KEY, JSON.stringify(filtered));
    return { status: 'success', message: '삭제 완료' };
  },
};

export const SettingsAPI = {
  get: async () => {
    const serverRes = await apiRequest('/api/settings');
    if (serverRes) return serverRes;

    const local = getLocalSettings();
    const hasKey = Boolean(local.gemini_api_key);
    const masked = hasKey ? local.gemini_api_key.slice(0, 4) + '****' + local.gemini_api_key.slice(-4) : '';
    let currentModel = local.gemini_model || 'gemini-3.6-flash';
    if (['gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-2.0-flash', ''].includes(currentModel)) {
      currentModel = 'gemini-3.6-flash';
    }

    return {
      has_api_key: hasKey,
      masked_api_key: masked,
      model: currentModel,
      available_models: [
        { id: 'gemini-3.6-flash', name: 'Gemini 3.6 Flash (최신 초고속, 추천)' },
        { id: 'gemini-flash-latest', name: 'Gemini Flash Latest (최신 자동 갱신)' },
        { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (고지능 심층 분석)' },
        { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (차세대 프리뷰)' },
      ],
    };
  },
  save: async (settings) => {
    const serverRes = await apiRequest('/api/settings', 'POST', settings);
    saveLocalSettings(settings);
    if (serverRes) return serverRes;
    return { status: 'success', message: '설정이 로컬 브라우저에 저장되었습니다.' };
  },
  testConnection: async (overrideKey = null, overrideModel = null) => {
    const serverRes = await apiRequest('/api/settings/test-connection', 'POST');
    if (serverRes && serverRes.success) return serverRes;

    const local = getLocalSettings();
    const effectiveKey = (overrideKey || local.gemini_api_key || '').trim();
    const effectiveModel = (overrideModel || local.gemini_model || 'gemini-1.5-flash').trim();

    if (!effectiveKey) {
      return { success: false, message: '등록된 API 키가 없습니다. API 키를 입력해주세요.' };
    }
    try {
      const text = await callGeminiDirectClient(
        '연결 테스트입니다. 한 단어로 "연결 성공"이라고만 답변해주세요.',
        '',
        effectiveKey,
        effectiveModel
      );
      return { success: true, message: `정상 연결되었습니다! (응답: ${text?.trim() || '연결 성공'})` };
    } catch (err) {
      return { success: false, message: `연결 실패: ${err.message}` };
    }
  },
};
