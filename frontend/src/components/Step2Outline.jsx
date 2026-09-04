import React, { useState, useEffect } from 'react';
import { ListTree, Sparkles, ArrowLeft, ArrowRight, Loader2, Plus, Trash2, LayoutList } from 'lucide-react';
import { WorkflowAPI } from '../utils/api';

export default function Step2Outline({ state, updateState, prevStep, nextStep }) {
  const [loading, setLoading] = useState(false);

  const sections = state.outline?.sections || [];

  const handleGenerateOutline = async () => {
    setLoading(true);
    try {
      const res = await WorkflowAPI.outline(
        state.primaryKeyword,
        state.subKeywords,
        state.briefing
      );
      updateState({ outline: res.data });
    } catch (err) {
      alert(`목차 생성 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 목차가 아직 없으면 자동 1회 생성
    if (sections.length === 0 && state.primaryKeyword) {
      handleGenerateOutline();
    }
  }, []);

  const handleSectionTitleChange = (idx, newTitle) => {
    const newSections = [...sections];
    newSections[idx].title = newTitle;
    updateState({ outline: { ...state.outline, sections: newSections } });
  };

  const handleAddSubSection = (sectionIdx) => {
    const newSections = [...sections];
    if (!newSections[sectionIdx].sub_sections) {
      newSections[sectionIdx].sub_sections = [];
    }
    newSections[sectionIdx].sub_sections.push({
      level: 'H3',
      title: '새로운 세부 소제목',
      point: '내용 요약 입력'
    });
    updateState({ outline: { ...state.outline, sections: newSections } });
  };

  const handleRemoveSection = (idx) => {
    const newSections = sections.filter((_, i) => i !== idx);
    updateState({ outline: { ...state.outline, sections: newSections } });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* 상단 안내 & 재생성 바 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-naver flex items-center justify-center text-xs font-bold">02</span>
            <h2 className="text-xl font-bold text-slate-900">3계층 목차 설계 (H1-H2-H3)</h2>
          </div>
          <p className="text-xs text-slate-500">
            독자의 체류 시간을 극대화하고 이탈을 방지하는 스마트에디터 구조입니다. 소제목을 자유롭게 편집하세요.
          </p>
        </div>

        <button
          onClick={handleGenerateOutline}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-600" />}
          <span>목차 재설계</span>
        </button>
      </div>

      {/* 목차 카드 리스트 */}
      <div className="space-y-4">
        {loading && sections.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-naver animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">체류 시간 최적화 3계층 목차를 설계하고 있습니다...</p>
          </div>
        ) : (
          sections.map((section, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm transition-all hover:border-emerald-300 space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-1">
                  <span className="text-xs font-black px-2.5 py-1 bg-emerald-100 text-emerald-900 rounded-lg">
                    {section.level || 'H2'}
                  </span>
                  <input
                    type="text"
                    value={section.title}
                    onChange={(e) => handleSectionTitleChange(idx, e.target.value)}
                    className="flex-1 font-bold text-base text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 px-1 py-0.5 focus:outline-none"
                  />
                </div>

                {section.visual_element && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                    <LayoutList className="w-3 h-3 text-emerald-600" />
                    {typeof section.visual_element === 'object' ? JSON.stringify(section.visual_element) : section.visual_element}
                  </span>
                )}

                <button
                  onClick={() => handleRemoveSection(idx)}
                  className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                  title="섹션 삭제"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* 세부 H3 소제목 목록 */}
              {section.sub_sections && section.sub_sections.length > 0 && (
                <div className="pl-6 space-y-2 border-l-2 border-emerald-100 ml-3">
                  {section.sub_sections.map((sub, sIdx) => (
                    <div key={sIdx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">H3</span>
                        <input
                          type="text"
                          value={typeof sub.title === 'object' ? JSON.stringify(sub.title) : (sub.title || '')}
                          onChange={(e) => {
                            const newSections = [...sections];
                            newSections[idx].sub_sections[sIdx].title = e.target.value;
                            updateState({ outline: { ...state.outline, sections: newSections } });
                          }}
                          className="font-semibold text-slate-800 bg-transparent flex-1 focus:outline-none"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 max-w-[200px] truncate">
                        {typeof sub.point === 'object' ? JSON.stringify(sub.point) : sub.point}
                      </span>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAddSubSection(idx)}
                    className="text-[11px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 pt-1"
                  >
                    <Plus className="w-3 h-3" /> H3 소단락 추가
                  </button>
                </div>
              )}

              {/* 주요 요점 표시 */}
              {section.key_points && section.key_points.length > 0 && (
                <div className="bg-slate-50/70 rounded-xl p-3 text-xs text-slate-600 flex flex-wrap gap-2">
                  <span className="font-bold text-slate-500">핵심 체크:</span>
                  {section.key_points.map((pt, pIdx) => (
                    <span key={pIdx} className="inline-block bg-white px-2 py-0.5 rounded border border-slate-200">
                      ✔ {typeof pt === 'object' ? JSON.stringify(pt) : pt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* 이전/다음 네비게이션 버튼 */}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 이전 단계 (기획)
        </button>

        <button
          onClick={nextStep}
          disabled={sections.length === 0}
          className="flex items-center gap-2 px-8 py-3.5 bg-naver hover:bg-naver-hover text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          <span>3단계: 본문 작성으로 이동</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
