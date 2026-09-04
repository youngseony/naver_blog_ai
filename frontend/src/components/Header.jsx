import React from 'react';
import { Sparkles, History, Settings, FileText, TrendingUp } from 'lucide-react';

export default function Header({ onOpenHistory, onOpenSettings, onNewPost, onScrollToBlogdex }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* 브랜드 로고 */}
        <div 
          onClick={onNewPost} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-naver flex items-center justify-center text-white font-black text-xl shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            N
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-slate-900 text-lg tracking-tight">네이버 블로그 AI</span>
              <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">스튜디오</span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">상위 0.1% 노출 전략 & 스마트에디터 서식 완벽 호환</p>
          </div>
        </div>

        {/* 상단 우측 버튼군: AI 설정 -> 새 글 작성 -> 작성 기록 -> 블로그 지수 조회 */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* 1. AI 설정 */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>AI 설정</span>
          </button>

          {/* 2. 새 글 작성 */}
          <button
            onClick={onNewPost}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>새 글 작성</span>
          </button>
          
          {/* 3. 작성 기록 */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-slate-600" />
            <span>작성 기록</span>
          </button>

          {/* 4. 블로그 지수 조회 (추가) */}
          <button
            onClick={onScrollToBlogdex}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors cursor-pointer"
            title="하단 블덱스 블로그 지수 조회로 이동"
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>블로그 지수 조회</span>
          </button>
        </div>
      </div>
    </header>
  );
}
