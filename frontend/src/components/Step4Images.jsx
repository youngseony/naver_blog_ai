import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, Sparkles, Copy, Check, ArrowLeft, ArrowRight, Loader2, Upload, ExternalLink } from 'lucide-react';
import { WorkflowAPI } from '../utils/api';
import { copyPlainText } from '../utils/clipboard';

export default function Step4Images({ state, updateState, prevStep, nextStep }) {
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const images = state.images || [];

  const handleGenerateImages = async () => {
    setLoading(true);
    try {
      const res = await WorkflowAPI.images(
        state.title,
        state.primaryKeyword,
        state.content
      );
      updateState({ images: res.data.images || [] });
    } catch (err) {
      alert(`이미지 프롬프트 생성 중 오류가 발생했습니다: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (images.length === 0 && state.content) {
      handleGenerateImages();
    }
  }, []);

  const handleCopyPrompt = async (idx, promptText) => {
    await copyPlainText(promptText);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleImageFileChange = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const newImages = [...images];
      newImages[idx].userUploadedUrl = reader.result;
      newImages[idx].fileName = file.name;
      updateState({ images: newImages });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* 상단 안내 바 */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-lg bg-emerald-100 text-naver flex items-center justify-center text-xs font-bold">04</span>
            <h2 className="text-xl font-bold text-slate-900">맞춤형 이미지 프롬프트 기획</h2>
            <span className="text-[11px] bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              한국인 인물 & 1:1 네이버 표준 규격
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            • <strong>대표 썸네일(1:1)</strong>: 네이버 모바일 검색 및 피드 목록의 공식 정방형 크롭 규격에 100% 부합하도록 최적화되었습니다.<br />
            • <strong>본문 이미지(16:9)</strong>: 가로형 와이드 뷰로 시각적 체류 시간을 극대화하며, 인물 프롬프트는 <strong>한국인(Korean)</strong>으로 고정됩니다.
          </p>
        </div>

        <button
          onClick={handleGenerateImages}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-emerald-600" />}
          <span>프롬프트 재생성</span>
        </button>
      </div>

      {/* 이미지 카드 그리드 */}
      <div className="space-y-6">
        {loading && images.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 border border-slate-200 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-naver animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-700">시각적 체류 시간을 높일 맞춤형 이미지 프롬프트를 기획 중입니다...</p>
          </div>
        ) : (
          images.map((img, idx) => {
            const isThumbnail = img.role === 'thumbnail';
            const displayImage = img.userUploadedUrl || img.preview_url;

            return (
              <div
                key={idx}
                className={`bg-white rounded-2xl border transition-all p-5 sm:p-6 shadow-sm ${
                  isThumbnail
                    ? 'border-emerald-300 ring-2 ring-emerald-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* 왼쪽: 이미지 프리뷰 / 업로드 영역 */}
                  <div className="w-full md:w-64 flex-shrink-0 flex flex-col items-center">
                    <div
                      className={`w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 relative group flex items-center justify-center ${
                        isThumbnail ? 'aspect-square' : 'aspect-video'
                      }`}
                    >
                      {displayImage ? (
                        <img
                          src={displayImage}
                          alt={img.section_label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1" />
                          <span className="text-[11px] text-slate-400 font-medium">이미지 미등록</span>
                        </div>
                      )}

                      {/* 호버 시 파일 업로드 오버레이 */}
                      <label className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer p-3 text-center">
                        <Upload className="w-5 h-5 mb-1" />
                        <span className="text-xs font-bold">내 생성 이미지 교체</span>
                        <span className="text-[10px] text-slate-300">클릭하여 이미지 파일 업로드</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleImageFileChange(idx, e)}
                        />
                      </label>
                    </div>

                    <div className="mt-2 text-center">
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                        비율: {img.ratio}
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽: 프롬프트 정보 및 복사 버튼 */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                            isThumbnail
                              ? 'bg-naver text-white'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {isThumbnail ? '★ 대표 썸네일' : `본문 이미지 ${idx}`}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {img.section_label}
                        </h3>
                      </div>

                      {img.style_recommendation && (
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                          {img.style_recommendation}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {img.description_ko}
                    </p>

                    {/* 영문 프롬프트 박스 */}
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/80 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                        <span>AI 프롬프트 (Midjourney / DALL-E 3)</span>
                        <button
                          onClick={() => handleCopyPrompt(idx, img.prompt_en)}
                          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                        >
                          {copiedIdx === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-naver" />
                              <span className="text-naver">복사 완료!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>프롬프트 복사</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs font-mono text-slate-800 leading-relaxed break-all bg-white p-2.5 rounded-lg border border-slate-200">
                        {img.prompt_en}
                      </p>
                    </div>

                    {img.negative_prompt_en && (
                      <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <span className="font-semibold text-slate-500">Negative:</span>
                        <span className="font-mono truncate">{img.negative_prompt_en}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 네비게이션 버튼 */}
      <div className="flex items-center justify-between pt-6">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 이전 단계 (본문)
        </button>

        <button
          onClick={nextStep}
          className="flex items-center gap-2 px-8 py-3.5 bg-naver hover:bg-naver-hover text-white font-extrabold text-base rounded-xl shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          <span>5단계: 스마트에디터 복사 & 배포로 이동</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
