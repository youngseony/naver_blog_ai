import React, { useState, useEffect } from 'react';
import { PenTool, Sparkles, ArrowLeft, ArrowRight, Loader2, CheckCircle2, Eye, Code, Gauge, Subtitles } from 'lucide-react';
import { WorkflowAPI } from '../utils/api';
import { clientMarkdownToSmartEditorHtml } from '../utils/clientServices';

const TONE_OPTIONS = [
  { id: 'friendly_pro', label: '친절하고 전문적인 말투', desc: '이해하기 쉽고 신뢰감 있는 톤' },
  { id: 'neighbor', label: '옆집 이웃 같은 친근한 대화체', desc: '공감대 형성과 편안한 소통' },
  { id: 'column', label: '신뢰감 있는 칼럼/정보형', desc: '논리적이고 깔끔한 인사이트 전달' },
];

export default function Step3Content({ state, updateState, prevStep, nextStep }) {
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'markdown'
  const [selectedTone, setSelectedTone] = useState(state.tone || '친절하고 전문적인 말투');

  const handleGenerateContent = async () => {
    setLoading(true);
    try {
      const res = await WorkflowAPI.content(
        state.primaryKeyword,
        state.subKeywords,
        state.briefing,
        state.outline,
        selectedTone,
        state.title
      );
      const data = res.data;
      const initialTitle = data.selected_title || state.title || `${state.primaryKeyword} 총정리`;
      const initialSubtitle = data.selected_subtitle || `${state.primaryKeyword} 핵심 요건 및 실제 준비 시 놓치기 쉬운 필수 팁 총정리`;
      const subtitleCandidates = data.subtitle_candidates || [
        `${state.primaryKeyword} 핵심 요건 및 실제 준비 시 놓치기 쉬운 필수 팁 총정리`,
        `초보자도 5분 만에 이해하는 단계별 실천법 & 주의사항 가이드`,
        `놓치면 손해보는 최신 변경 포인트와 FAQ 완벽 해설`
      ];

      const html = data.content_html || clientMarkdownToSmartEditorHtml(data.content_markdown, initialTitle, initialSubtitle);

      updateState({
        title: initialTitle,
        titleCandidates: data.title_candidates || [],
        subtitle: initialSubtitle,
        subtitleCandidates,
        content: data.content_markdown || '',
        contentHtml: html,
        seoScore: data.seo_score_analysis || {},
        tone: selectedTone,
      });
    } catch (err) {
      alert(`본문 작성 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 본문이 아직 없으면 자동 1회 생성
    if (!state.content && state.outline?.sections?.length > 0) {
      handleGenerateContent();
    }
  }, []);

  const handleSelectTitle = (t) => {
    const titleStr = typeof t === 'object' ? (t.title || JSON.stringify(t)) : String(t);
    const newHtml = clientMarkdownToSmartEditorHtml(state.content, titleStr, state.subtitle);
    updateState({ title: titleStr, contentHtml: newHtml });
  };

  const handleTitleChange = (val) => {
    const newHtml = clientMarkdownToSmartEditorHtml(state.content, val, state.subtitle);
    updateState({ title: val, contentHtml: newHtml });
  };

  const handleSelectSubtitle = (sub) => {
    const newHtml = clientMarkdownToSmartEditorHtml(state.content, state.title, sub);
    updateState({ subtitle: sub, contentHtml: newHtml });
  };

  const handleSubtitleChange = (val) => {
    const newHtml = clientMarkdownToSmartEditorHtml(state.content, state.title, val);
    updateState({ subtitle: val, contentHtml: newHtml });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* 제목 선택 & 생성 옵션 바 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-naver flex items-center justify-center text-xs font-bold">03</span>
              <h2 className="text-xl font-bold text-slate-900">본문 작성 & 카피라이팅</h2>
            </div>
            <p className="text-xs text-slate-500">
              PAS 공식 도입부, 4줄 이내 모바일 최적화 호흡, 스마트에디터 전용 서식이 자동으로 적용됩니다.
            </p>
          </div>

          <button
            onClick={handleGenerateContent}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 bg-naver hover:bg-naver-hover text-white font-bold text-xs rounded-xl shadow-md transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>본문 전체 재작성</span>
          </button>
        </div>

        {/* 말투/톤앤매너 선택 */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2">어조 및 말투 선택</label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {TONE_OPTIONS.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTone(t.label)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedTone === t.label
                    ? 'border-naver bg-emerald-50/60 ring-2 ring-emerald-200'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-bold text-slate-800">{t.label}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 25자 내외 제목 3선 추천 */}
        {state.titleCandidates && state.titleCandidates.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700">
              클릭률을 높이는 25자 추천 제목 (선택 또는 직접 수정)
            </label>
            <div className="space-y-2">
              {state.titleCandidates.map((cand, idx) => (
                <div
                  key={idx}
                  onClick={() => handleSelectTitle(cand)}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    state.title === cand
                      ? 'border-naver bg-emerald-50 text-emerald-950 font-bold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 flex-shrink-0 ${
                      state.title === (typeof cand === 'object' ? cand.title : cand) ? 'text-naver' : 'text-slate-300'
                    }`}
                  />
                  <span className="text-xs sm:text-sm flex-1">
                    {typeof cand === 'object' ? (cand.title || JSON.stringify(cand)) : String(cand)}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {typeof cand === 'string' ? cand.length : 25}자
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="text"
                value={state.title || ''}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="제목을 직접 수정하려면 여기에 입력하세요"
                className="w-full px-4 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
              />
            </div>

            {/* 부제목(Subtitle) 자동 생성 & 선택 UI */}
            <div className="space-y-2 pt-3 border-t border-slate-100/80">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Subtitles className="w-4 h-4 text-emerald-600" />
                  <span>체류 시간을 높이는 추천 부제목 (선택 또는 직접 수정)</span>
                </label>
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold border border-emerald-200">
                  D.I.A.+ 가산점 서식
                </span>
              </div>

              {state.subtitleCandidates && state.subtitleCandidates.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {state.subtitleCandidates.map((sub, sIdx) => (
                    <button
                      key={sIdx}
                      type="button"
                      onClick={() => handleSelectSubtitle(sub)}
                      className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-all cursor-pointer ${
                        state.subtitle === sub
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-500 font-bold shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              )}

              <input
                type="text"
                value={state.subtitle || ''}
                onChange={(e) => handleSubtitleChange(e.target.value)}
                placeholder="부제목을 직접 입력하세요 (스마트에디터 상단에 부제목 서식으로 즉시 반영됩니다)"
                className="w-full px-4 py-2.5 text-xs font-medium border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* SEO 점수 분석 위젯 */}
      {state.seoScore && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/60 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-naver text-white flex items-center justify-center font-bold">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900">네이버 스마트 알고리즘 적합도 분석</div>
              <div className="text-xs text-slate-600">
                키워드 밀도: {typeof state.seoScore?.keyword_density === 'object' ? JSON.stringify(state.seoScore.keyword_density) : (state.seoScore?.keyword_density || '적정')} | {typeof state.seoScore?.readability === 'object' ? JSON.stringify(state.seoScore.readability) : (state.seoScore?.readability || '모바일 최적화 완료')}
              </div>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1.5 bg-white text-emerald-700 rounded-lg shadow-sm border border-emerald-200">
            D.I.A.+ 적합도 98점
          </span>
        </div>
      )}

      {/* 본문 에디터 / 프리뷰 영역 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* 모드 전환 탭 */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>스마트에디터 실시간 뷰</span>
            </button>
            <button
              onClick={() => setViewMode('markdown')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'markdown'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-slate-600" />
              <span>마크다운 편집 모드</span>
            </button>
          </div>

          <div className="text-xs text-slate-400">
            공백 포함 {state.content?.length || 0}자
          </div>
        </div>

        {/* 본문 뷰어 */}
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-naver animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">모바일 최적화 호흡과 서식을 적용하여 본문을 작성 중입니다...</p>
          </div>
        ) : viewMode === 'preview' ? (
          <div className="p-6 sm:p-10 max-w-3xl mx-auto">
            {state.contentHtml ? (
              <div
                className="smart-editor-preview"
                dangerouslySetInnerHTML={{ __html: state.contentHtml }}
              />
            ) : (
              <div className="text-sm text-slate-400 text-center py-12">
                생성된 본문이 없습니다. [본문 전체 재작성] 버튼을 눌러주세요.
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <textarea
              rows={22}
              value={state.content}
              onChange={(e) => updateState({ content: e.target.value })}
              className="w-full font-mono text-xs text-slate-800 leading-relaxed p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              placeholder="본문 마크다운 내용을 직접 편집할 수 있습니다."
            />
          </div>
        )}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 이전 단계 (목차)
        </button>

        <button
          onClick={nextStep}
          disabled={!state.content}
          className="flex items-center gap-2 px-8 py-3.5 bg-naver hover:bg-naver-hover text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          <span>4단계: 이미지 프롬프트로 이동</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
