import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, ExternalLink, ArrowLeft, Sparkles, CheckCircle, Save, FileArchive } from 'lucide-react';
import confetti from 'canvas-confetti';
import JSZip from 'jszip';
import { copySmartEditorContent, copyPlainText } from '../utils/clipboard';
import { WorkflowAPI } from '../utils/api';

export default function Step5Export({ state, updateState, prevStep, onNewPost }) {
  const [copiedType, setCopiedType] = useState(null); // 'html' | 'text' | 'title'
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);

  useEffect(() => {
    // 5단계 진입 시 축하 컨페티 팡파레 1회
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#03c75a', '#22c55e', '#10b981', '#34d399']
      });
    } catch (e) {
      console.log('Confetti not available:', e);
    }

    // 자동 DB 저장
    handleAutoSave();
  }, []);

  const handleAutoSave = async () => {
    try {
      setSaving(true);
      const res = await WorkflowAPI.savePost({
        post_id: state.postId,
        topic: state.topic,
        primary_keyword: state.primaryKeyword,
        sub_keywords: state.subKeywords,
        briefing: state.briefing,
        outline: state.outline,
        title: state.title,
        content: state.content,
        images: state.images,
      });
      if (res.post_id) {
        updateState({ postId: res.post_id });
        setSavedSuccess(true);
      }
    } catch (e) {
      console.error('Auto save failed:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleCopySmartEditor = async () => {
    const result = await copySmartEditorContent(state.contentHtml, state.content);
    if (result.success) {
      setCopiedType('html');
      setTimeout(() => setCopiedType(null), 3000);
      try {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
      } catch (e) {}
    } else {
      alert(`복사 실패: ${result.error}`);
    }
  };

  const handleCopyTitle = async () => {
    await copyPlainText(state.title);
    setCopiedType('title');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCopyText = async () => {
    await copyPlainText(state.content);
    setCopiedType('text');
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleDownloadZip = async () => {
    setZipLoading(true);
    try {
      const zip = new JSZip();
      
      // 1. 본문 텍스트 및 HTML 추가
      zip.file("포스팅_제목.txt", state.title || "");
      if (state.subtitle) {
        zip.file("포스팅_부제목.txt", state.subtitle);
      }
      zip.file("본문_마크다운.md", state.content || "");
      zip.file("본문_스마트에디터.html", state.contentHtml || "");

      // 2. 이미지 프롬프트 정보
      const imgInfo = (state.images || []).map((img, i) => 
        `[${i === 0 ? '대표 썸네일 (1:1)' : '본문 이미지 ' + i + ' (16:9)'}]\n비율: ${img.ratio}\n설명: ${img.description_ko}\n프롬프트: ${img.prompt_en}\n네거티브: ${img.negative_prompt_en || 'None'}\n`
      ).join('\n---\n\n');
      zip.file("이미지_프롬프트_가이드.txt", imgInfo);

      // 3. 실제 이미지 파일들을 images/ 폴더에 온전히 번들링
      const imgFolder = zip.folder("images");
      for (let i = 0; i < (state.images || []).length; i++) {
        const img = state.images[i];
        const fileName = `${i === 0 ? '00_thumbnail' : '0' + i + '_content'}.jpg`;
        const targetUrl = img.userUploadedUrl || img.preview_url;
        
        if (targetUrl) {
          if (targetUrl.startsWith('data:image')) {
            const base64Data = targetUrl.split(',')[1];
            imgFolder.file(fileName, base64Data, { base64: true });
          } else {
            try {
              const res = await fetch(targetUrl, { mode: 'cors' });
              if (res.ok) {
                const blob = await res.blob();
                imgFolder.file(fileName, blob);
              }
            } catch (fetchErr) {
              console.warn(`이미지 다운로드 건너뜀 (${fileName}):`, fetchErr.message);
            }
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const safeTitle = (state.title || "네이버블로그포스팅").replace(/[/\\?%*:|"<>]/g, '_').slice(0, 30);
      const url = URL.createObjectURL(content);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeTitle}_포스팅패키지.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert(`ZIP 생성 실패: ${e.message}`);
    } finally {
      setZipLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* 축하 및 완성 헤더 배너 */}
      <div className="bg-gradient-to-r from-emerald-600 via-naver to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-600/20 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            포스팅 제작 완료 & 저장 완료!
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            네이버 블로그 상위 노출 원클릭 패키지가 완성되었습니다!
          </h2>

          <p className="text-sm text-emerald-50 max-w-2xl leading-relaxed">
            아래 **[스마트에디터 서식 원클릭 복사]** 버튼을 누른 후, 네이버 블로그 스마트에디터 ONE 본문 작성 창에서 **Ctrl + V**를 누르시면 인용구와 소제목 스타일이 그대로 적용됩니다.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleCopySmartEditor}
              className="flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-emerald-950 font-black text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-100 transition-all"
            >
              {copiedType === 'html' ? (
                <>
                  <CheckCircle className="w-5 h-5 text-naver" />
                  <span className="text-naver">스마트에디터 서식 복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 text-emerald-700" />
                  <span>스마트에디터 서식 원클릭 복사 (강력 추천)</span>
                </>
              )}
            </button>

            <a
              href="https://blog.naver.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-3.5 bg-emerald-950/40 hover:bg-emerald-950/60 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all"
            >
              <span>네이버 블로그 에디터 열기</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* 포스팅 정보 및 개별 액션 카드 */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-5 bg-naver rounded-full"></span>
            최종 산출물 검토 및 개별 복사
          </span>
          {savedSuccess && (
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> 로컬 DB 저장 완료
            </span>
          )}
        </h3>

        {/* 제목 섹션 */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs font-bold text-slate-400 block mb-1">확정된 블로그 제목</span>
            <div className="text-base font-extrabold text-slate-900">{state.title}</div>
          </div>
          <button
            onClick={handleCopyTitle}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 transition-colors flex-shrink-0"
          >
            {copiedType === 'title' ? <Check className="w-3.5 h-3.5 text-naver" /> : <Copy className="w-3.5 h-3.5" />}
            <span>제목 복사</span>
          </button>
        </div>

        {/* 압축 패키지 다운로드 & 텍스트 복사 버튼 바 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleDownloadZip}
            disabled={zipLoading}
            className="flex items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 font-bold text-xs transition-colors"
          >
            <FileArchive className="w-4 h-4 text-emerald-600" />
            <span>{zipLoading ? 'ZIP 생성 중...' : '포스팅 전체 파일 ZIP 다운로드 (본문+프롬프트)'}</span>
          </button>

          <button
            onClick={handleCopyText}
            className="flex items-center justify-center gap-2 p-4 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded-xl border border-slate-200 font-bold text-xs transition-colors"
          >
            <Copy className="w-4 h-4 text-slate-600" />
            <span>{copiedType === 'text' ? '마크다운 텍스트 복사 완료!' : '마크다운 순수 텍스트만 복사'}</span>
          </button>
        </div>

        {/* 본문 최종 프리뷰 */}
        <div className="border-t border-slate-100 pt-6">
          <span className="text-xs font-bold text-slate-400 block mb-3">스마트에디터 출력 화면 미리보기</span>
          <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-200 max-h-[450px] overflow-y-auto">
            <div
              className="smart-editor-preview bg-white p-6 sm:p-8 rounded-xl border border-slate-100 shadow-sm"
              dangerouslySetInnerHTML={{ __html: state.contentHtml }}
            />
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between pt-4">
        <button
          onClick={prevStep}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> 이전 단계 (이미지)
        </button>

        <button
          onClick={onNewPost}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl transition-all shadow-md"
        >
          <span>새 포스팅 작성하기</span>
        </button>
      </div>
    </div>
  );
}
