import React, { useState } from 'react';
import { Search, Sparkles, Plus, X, Globe, Lightbulb, ArrowRight, Loader2, RotateCw } from 'lucide-react';
import { WorkflowAPI } from '../utils/api';

const CURRENT_YEAR = new Date().getFullYear(); // 2026

export const CATEGORY_TABS = [
  { id: 'all', label: '🔥 전체 추천' },
  { id: 'economy', label: '💰 재테크·부업' },
  { id: 'tech', label: '💻 IT·AI·생산성' },
  { id: 'travel', label: '✈️ 여행·맛집' },
  { id: 'health', label: '🏃 건강·다이어트' },
  { id: 'realestate', label: '🏠 부동산·절세' },
];

export const TOPIC_CATEGORIES = {
  economy: [
    `${CURRENT_YEAR}년 청년 도약계좌 vs 청년 주택드림 통장 금리 & 환승 혜택 비교`,
    `스마트스토어 초보 위탁판매자가 반드시 알아야 할 마진 계산 공식`,
    `${CURRENT_YEAR} 직장인 주말 N잡 부업 추천 TOP 5 (시간 대비 고수익)`,
    `초기 비용 없이 시작하는 디지털 파일(PDF 전자책) 크몽 판매 부업 노하우`,
    `${CURRENT_YEAR}년 연말정산 환급금 극대화 절세 꿀팁 & 소득공제 체크리스트`,
    `미국 배당 ETF 월 50만원 제2의 월급 만드는 분기별 포트폴리오`,
    `소액 투자자를 위한 공모주 청약 일정 확인법 & 균등 배정 확률 높이기`,
    `인스타그램 릴스 조회수 떡상으로 월 100만원 부수입 만드는 제휴마케팅 팁`,
  ],
  tech: [
    `AI 챗GPT 업무 활용법: 보고서 작성 시간을 반으로 줄이는 프롬프트 10선`,
    `노션(Notion) 생산성 200% 올리는 일정 & 프로젝트 관리 템플릿 추천`,
    `${CURRENT_YEAR}년 최신 스마트폰 가성비 자급제 + 알뜰폰 무제한 요금제 조합`,
    `미드저니 & DALL-E로 블로그 썸네일 고화질 이미지 3분 만에 만드는 법`,
    `초보자를 위한 파이썬 업무 자동화: 매일 반복되는 엑셀 1초 컷 스크립트`,
    `아이폰 vs 갤럭시 ${CURRENT_YEAR} 최신 플래그십 카메라 및 AI 기능 실사용 비교`,
    `Claude 3.5 Sonnet과 ChatGPT 4o 실무 코딩·문서 작성 성능 비교 분석`,
    `유튜브 쇼츠 자동화 제작 AI 툴 3가지 추천 및 수익화 주의사항`,
  ],
  travel: [
    `제주도 3박 4일 렌터카 여행 힐링 코스 및 숨은 현지인 로컬 맛집`,
    `일본 도쿄 자유여행 가성비 호텔 & 지하철 패스 3일권 총정리`,
    `강릉 1박 2일 바다 여행 필수 드라이브 코스 및 오션뷰 신상 카페 투어`,
    `베트남 다낭 3박 5일 가족 여행 총경비 예산 및 필수 관광지 추천`,
    `${CURRENT_YEAR} 성수동 주말 팝업스토어 & 신상 베이커리 디저트 카페 지도`,
    `부산 해운대 & 광안리 현지인 추천 가성비 횟집 및 일몰 명소 코스`,
    `해외여행 필수 트래블로그 vs 트래블월렛 환전 수수료 및 ATM 혜택 비교`,
    `유럽 배낭여행 준비물 완벽 체크리스트 & 소매치기 방지 꿀팁`,
  ],
  health: [
    `다이어트 정체기 극복하는 직장인 간헐적 단식 16:8 식단 가이드`,
    `혈당 스파이크 막는 식사 순서와 연속혈당측정기(CGM) 2주 실사용 후기`,
    `거북목 & 라운드숄더 교정 사무실에서 매일 5분 스트레칭 루틴`,
    `수면의 질 높이는 마그네슘 영양제 복용 시간 및 킬레이트 부작용 비교`,
    `달리기 초보자를 위한 런데이 8주 완성 코스 및 입문용 러닝화 추천`,
    `${CURRENT_YEAR} 직장인 번아웃 증후군 자가진단 및 일상 마음 챙김 회복법`,
    `단백질 보충제(프로틴) 종류별 WPC vs WPI 차이 및 속 편한 추천`,
    `제로 칼로리 음료 인공감미료 논란: 다이어트 시 매일 마셔도 될까?`,
  ],
  realestate: [
    `${CURRENT_YEAR}년 청년 주택드림 청약 통장 가입 조건 및 1순위 신청 가이드`,
    `${CURRENT_YEAR} 하반기 수도권 아파트 청약 시장 전망 및 무주택자 당첨 전략`,
    `전세사기 완벽 예방: 확정일자 부여현황 및 HUG 전세보증보험 가입 요건`,
    `생애최초 주택구입 디딤돌 대출 자격 조건 및 신생아 특례 금리 총정리`,
    `자동차 취등록세 감면 대상 및 다자녀·친환경차 혜택 계산법`,
    `월세 세액공제 vs 현금영수증 소득공제 신청 방법 및 환급액 비교`,
    `이사 갈 때 꼭 챙겨야 할 폐가전 무료 수거 및 전입신고 체크리스트`,
    `신혼부부 특별공급 소득 기준 완화 및 생애최초 가점 올리는 팁`,
  ],
};

function pickRandomTopics(category = 'all', count = 4) {
  let pool = [];
  if (category === 'all') {
    Object.values(TOPIC_CATEGORIES).forEach((arr) => {
      pool.push(...arr);
    });
  } else {
    pool = TOPIC_CATEGORIES[category] || TOPIC_CATEGORIES.economy;
  }
  const shuffled = [...pool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

export default function Step1Research({ state, updateState, nextStep }) {
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(true);
  const [newSubKeyword, setNewSubKeyword] = useState('');
  
  // 카테고리 선택 및 접속 시 랜덤 주제 초기화
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentTopics, setCurrentTopics] = useState(() => pickRandomTopics('all', 4));
  const [aiGenerating, setAiGenerating] = useState(false);

  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    setCurrentTopics(pickRandomTopics(catId, 4));
  };

  const handleShuffleTopics = () => {
    setCurrentTopics(pickRandomTopics(selectedCategory, 4));
  };

  const handleAIGenerateTrends = async () => {
    setAiGenerating(true);
    try {
      const aiTopics = await WorkflowAPI.generateTrendingTopics(selectedCategory);
      if (aiTopics && aiTopics.length > 0) {
        setCurrentTopics(aiTopics);
      } else {
        setCurrentTopics(pickRandomTopics(selectedCategory, 4));
      }
    } catch (e) {
      setCurrentTopics(pickRandomTopics(selectedCategory, 4));
    } finally {
      setAiGenerating(false);
    }
  };

  const handleRunResearch = async (forcedTopic = null) => {
    const rawTopic = (forcedTopic !== null ? forcedTopic : (state.topic || '')).trim();
    const rawContext = (state.additionalContext || '').trim();

    // 둘 중 하나도 입력되지 않았을 경우 경고 팝업
    if (!rawTopic && !rawContext) {
      alert('포스팅 주제 또는 참고 내용(원문 텍스트) 중 최소 하나는 입력해 주셔야 AI 기획이 가능합니다.');
      return;
    }

    // 주제가 없고 참고 내용만 있는 경우 첫 줄 또는 핵심 요약을 주제로 채택
    let topicToUse = rawTopic;
    if (!topicToUse && rawContext) {
      topicToUse = rawContext.split('\n')[0].replace(/^[#\-\*\d\.\s]+/, '').slice(0, 45).trim();
      if (!topicToUse) topicToUse = `${CURRENT_YEAR} 핵심 가이드`;
      updateState({ topic: topicToUse });
    }

    setLoading(true);
    try {
      const res = await WorkflowAPI.research(topicToUse, rawContext, useSearch);
      const data = res.data || {};

      // 객체로 반환된 경우 문자열로 안전하게 정규화
      const normalizeString = (val) => {
        if (!val) return '';
        if (typeof val === 'string') return val;
        if (Array.isArray(val)) {
          return val.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
        }
        if (typeof val === 'object') {
          return Object.entries(val)
            .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join(' | ');
        }
        return String(val);
      };

      const findKey = (obj, ...candidates) => {
        if (!obj || typeof obj !== 'object') return '';
        for (const c of candidates) {
          if (obj[c] !== undefined && obj[c] !== null) return normalizeString(obj[c]);
          const found = Object.keys(obj).find(k => k.toLowerCase().replace(/_/g, '') === c.toLowerCase().replace(/_/g, ''));
          if (found && obj[found] !== undefined && obj[found] !== null) return normalizeString(obj[found]);
        }
        return '';
      };

      const rawBriefing = data.briefing || {};
      const normalizedBriefing = {
        purpose: findKey(rawBriefing, 'purpose', '목적', '글의목적', 'goal') || '독자에게 명확한 해결책과 가치 전달',
        target_audience: findKey(rawBriefing, 'target_audience', 'targetAudience', 'target', '타깃', '독자') || '관련 정보와 실용적인 도움이 필요한 현대인',
        core_problem: findKey(rawBriefing, 'core_problem', 'coreProblem', 'problem', '핵심문제', '문제점') || '정보 부족 및 복잡한 절차로 인한 답답함',
        solution: findKey(rawBriefing, 'solution', '해결책', '솔루션') || '검증된 핵심 요건 정리 및 알기 쉬운 단계별 실천법',
        differentiation: findKey(rawBriefing, 'differentiation', '차별화', '차별점') || '실제 겪어본 현장 실전 팁과 실수 방지 체크리스트',
        call_to_action: findKey(rawBriefing, 'call_to_action', 'callToAction', 'cta', '행동유도') || '댓글 문의 및 유익한 정보 이웃 추가',
      };

      let subKeywords = [];
      if (Array.isArray(data.sub_keywords)) {
        subKeywords = data.sub_keywords.map(normalizeString).filter(Boolean);
      } else if (typeof data.sub_keywords === 'string') {
        subKeywords = data.sub_keywords.split(',').map(s => s.trim()).filter(Boolean);
      } else if (data.sub_keywords && typeof data.sub_keywords === 'object') {
        subKeywords = Object.values(data.sub_keywords).map(normalizeString).filter(Boolean);
      }
      if (subKeywords.length === 0) {
        subKeywords = [`${topicToUse} 팁`, `${topicToUse} 방법`, `${topicToUse} 정리`];
      }

      let primaryKeyword = normalizeString(data.primary_keyword);
      if (!primaryKeyword) primaryKeyword = topicToUse;

      let marketInsight = normalizeString(data.market_insight);
      if (!marketInsight) {
        marketInsight = `${CURRENT_YEAR} 실시간 검색 트렌드 분석을 기반으로 체류 시간과 공유율을 극대화하도록 기획되었습니다.`;
      }

      updateState({
        topic: topicToUse,
        primaryKeyword,
        subKeywords,
        briefing: normalizedBriefing,
        marketInsight,
      });
    } catch (err) {
      alert(`기획 분석 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubKeyword = () => {
    if (!newSubKeyword.trim()) return;
    if (!state.subKeywords.includes(newSubKeyword.trim())) {
      updateState({ subKeywords: [...state.subKeywords, newSubKeyword.trim()] });
    }
    setNewSubKeyword('');
  };

  const handleRemoveSubKeyword = (idx) => {
    updateState({
      subKeywords: state.subKeywords.filter((_, i) => i !== idx),
    });
  };

  const handleBriefingChange = (field, value) => {
    updateState({
      briefing: {
        ...state.briefing,
        [field]: value,
      },
    });
  };

  const isResearched = Boolean(state.primaryKeyword);

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* 주제 입력 카드 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-naver flex items-center justify-center text-xs font-bold">01</span>
            <h2 className="text-xl font-bold text-slate-900">어떤 주제로 포스팅을 작성할까요?</h2>
          </div>
          <p className="text-sm text-slate-500">
            주제나 참고 내용(원문)을 입력하면 AI가 {CURRENT_YEAR} 실시간 검색 트렌드를 분석하여 상위 노출 키워드와 6단계 기획안을 도출합니다.
          </p>
        </div>

        {/* 텍스트 인풋 & 추가 정보 (둘 중 하나 필수) */}
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-xs text-emerald-900 font-medium flex items-center gap-2">
            <span className="font-bold bg-emerald-600 text-white px-2 py-0.5 rounded text-[10px]">입력 가이드</span>
            <span>아래의 <strong>'포스팅 주제'</strong> 또는 <strong>'참고 내용(원문)'</strong> 중 <strong>하나만 입력하셔도</strong> AI 기획이 즉시 시작됩니다.</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                포스팅 주제 / 핵심 아이디어 <span className="text-emerald-600 text-[11px] font-semibold">(둘 중 하나 필수)</span>
              </label>
              {state.topic && (
                <button
                  onClick={() => updateState({ topic: '' })}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  지우기
                </button>
              )}
            </div>
            <input
              type="text"
              value={state.topic || ''}
              onChange={(e) => updateState({ topic: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleRunResearch()}
              placeholder={`예: ${CURRENT_YEAR} 청년 주택드림 청약 조건 및 1순위 신청 가이드`}
              className="w-full px-4 py-3 text-base border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400 bg-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                참고 내용 / 강조하고 싶은 포인트 또는 원문 텍스트 <span className="text-emerald-600 text-[11px] font-semibold">(둘 중 하나 필수)</span>
              </label>
              {state.additionalContext && (
                <button
                  onClick={() => updateState({ additionalContext: '' })}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  지우기
                </button>
              )}
            </div>
            <textarea
              rows={3}
              value={state.additionalContext || ''}
              onChange={(e) => updateState({ additionalContext: e.target.value })}
              placeholder="예: 보도자료나 참고하고 싶은 원문 기사, 연소득 3,600만원 이하 기준, 실제 서류 준비 시 놓치기 쉬운 필수 서류 목록 등"
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* 빠른 주제 추천 칩 & 카테고리 탭 & AI 생성 */}
        <div className="bg-slate-50/90 p-4 rounded-xl border border-slate-200/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{CURRENT_YEAR} 추천 트렌드 주제 (클릭 시 자동 입력)</span>
            </span>

            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleAIGenerateTrends}
                disabled={aiGenerating}
                className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 hover:bg-emerald-200/80 border border-emerald-300 px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                title="AI가 네이버 최신 핫토픽을 직접 생성합니다"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin text-emerald-700" />
                    <span>AI 실시간 분석 중...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3 h-3 text-emerald-700" />
                    <span>AI 실시간 트렌드 뽑기</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleShuffleTopics}
                disabled={aiGenerating}
                className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                title="다른 주제로 셔플합니다"
              >
                <RotateCw className="w-3 h-3 text-slate-500" />
                <span>새로고침</span>
              </button>
            </div>
          </div>

          {/* 카테고리 탭 바 */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleCategoryChange(tab.id)}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === tab.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 주제 칩 목록 */}
          <div className="flex items-center flex-wrap gap-2 pt-0.5">
            {currentTopics.map((t, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => updateState({ topic: t })}
                className={`text-xs px-3 py-1.5 rounded-full transition-all border cursor-pointer text-left leading-relaxed ${
                  state.topic === t
                    ? 'bg-naver text-white border-emerald-600 font-bold shadow-sm'
                    : 'bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border-slate-200 hover:border-emerald-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* 옵션 & 실행 버튼 */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={useSearch}
              onChange={(e) => setUseSearch(e.target.checked)}
              className="w-4 h-4 text-naver rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" />
              Google {CURRENT_YEAR} 실시간 검색 트렌드 반영 (권장)
            </span>
          </label>

          <button
            onClick={() => handleRunResearch()}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-naver hover:bg-naver-hover text-white font-bold rounded-xl shadow-md shadow-emerald-500/25 transition-all disabled:opacity-50 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>실시간 트렌드 & 키워드 분석 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>기획 브리핑 & 키워드 도출</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 분석 결과 섹션 */}
      {isResearched && (
        <div className="space-y-6 animate-fadeIn">
          {/* 키워드 도출 카드 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-5 bg-naver rounded-full"></span>
              상위 노출 타겟 키워드 설정
            </h3>

            {/* 메인 키워드 */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                메인 1차 키워드 (제목 및 첫 단락에 필수 노출)
              </label>
              <input
                type="text"
                value={state.primaryKeyword}
                onChange={(e) => updateState({ primaryKeyword: e.target.value })}
                className="w-full px-4 py-2.5 bg-emerald-50/50 border border-emerald-300 font-bold text-emerald-900 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* 서브 롱테일 키워드 */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                연관 2차 서브 키워드 (본문 소제목 및 자연스러운 배치용)
              </label>
              <div className="flex flex-wrap gap-2 items-center mb-3">
                {state.subKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-800 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    #{kw}
                    <button
                      onClick={() => handleRemoveSubKeyword(idx)}
                      className="text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSubKeyword}
                  onChange={(e) => setNewSubKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSubKeyword()}
                  placeholder="추가할 서브 키워드 입력"
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  onClick={handleAddSubKeyword}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> 추가
                </button>
              </div>
            </div>

            {state.marketInsight && (
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                💡 <span className="font-bold">검색 트렌드 인사이트:</span> {typeof state.marketInsight === 'object' ? JSON.stringify(state.marketInsight) : state.marketInsight}
              </div>
            )}
          </div>

          {/* 블로그 기획 6단계 브리핑 카드 */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2 h-5 bg-naver rounded-full"></span>
                블로그 기획 6단계 브리핑 (GEO & 체류시간 최적화)
              </h3>
              <span className="text-xs text-slate-400">각 항목을 직접 수정할 수 있습니다</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'purpose', label: '1. 포스팅의 궁극적 목적', icon: '🎯' },
                { key: 'target_audience', label: '2. 타겟 독자 페르소나', icon: '👥' },
                { key: 'core_problem', label: '3. 독자의 뼈아픈 핵심 고민', icon: '⚡' },
                { key: 'solution', label: '4. 제시할 차별화된 해결책', icon: '💡' },
                { key: 'differentiation', label: '5. 경쟁 글 대비 차별점', icon: '🏆' },
                { key: 'call_to_action', label: '6. 유도할 독자 행동(CTA)', icon: '🚀' },
              ].map((item) => (
                <div key={item.key} className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>{item.icon}</span> {item.label}
                  </span>
                  <textarea
                    rows={2}
                    value={typeof state.briefing[item.key] === 'object' ? JSON.stringify(state.briefing[item.key]) : (state.briefing[item.key] || '')}
                    onChange={(e) => handleBriefingChange(item.key, e.target.value)}
                    className="w-full text-xs text-slate-800 bg-white border border-slate-200 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* 2단계 진행 버튼 */}
          <div className="flex justify-end pt-4">
            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-8 py-3.5 bg-naver hover:bg-naver-hover text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              <span>2단계: 목차 설계로 이동</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
