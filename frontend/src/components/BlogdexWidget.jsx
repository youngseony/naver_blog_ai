import React, { useState } from 'react';
import { Search, TrendingUp, ExternalLink } from 'lucide-react';

export default function BlogdexWidget() {
  const [blogId, setBlogId] = useState('');

  const handleOpenBlogdex = (e) => {
    e.preventDefault();
    const cleanId = blogId.trim().replace(/^https?:\/\/blog\.naver\.com\//, '').replace(/\/$/, '');
    if (cleanId) {
      window.open(`https://blogdex.space/blog/${cleanId}`, '_blank', 'noopener,noreferrer');
    } else {
      window.open('https://blogdex.space/', '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section id="blogdex-section" className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 my-10 max-w-4xl mx-auto scroll-mt-24">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">블덱스(Blogdex) 블로그 지수 조회</h3>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              네이버 상위 노출 필수 점검
            </span>
          </div>
          <p className="text-xs text-slate-400">
            내 블로그의 현재 지수(일반 ➡️ 준최 1~7 ➡️ 최적 1~4+)를 확인하고 포스팅 키워드 난이도를 정밀하게 매칭하세요.
          </p>
        </div>
      </div>

      {/* 내 블로그 즉시 조회 바 */}
      <div className="py-6">
        <form onSubmit={handleOpenBlogdex} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <span className="text-xs font-mono font-bold">blog.naver.com/</span>
            </div>
            <input
              type="text"
              value={blogId}
              onChange={(e) => setBlogId(e.target.value)}
              placeholder="네이버 아이디 입력 (예: myblogid)"
              className="w-full pl-36 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
            />
          </div>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-naver hover:bg-naver-hover text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex-shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>조회하기</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* 블덱스 등급별 키워드 공략 가이드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-300">일반 ~ 준최 1·2</span>
            <span className="text-[10px] font-bold bg-slate-700 text-slate-300 px-2 py-0.5 rounded">시작/초기</span>
          </div>
          <div className="text-xs font-bold text-emerald-400">세부 롱테일 키워드 집중</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            월간 검색수 500~2,000 수준의 구체적인 질문형 키워드와 지역 세부 정보를 타깃하여 C-Rank 점수를 쌓으세요.
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800 hover:border-emerald-500/40 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-400">준최 3 ~ 준최 7</span>
            <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded">성장기</span>
          </div>
          <div className="text-xs font-bold text-white">서브 메인 키워드 공략</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            검색수 3,000~10,000의 인기 키워드 노출이 가능합니다. 모바일 가독성과 고화질 이미지로 체류 시간을 3분 이상 확보하세요.
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800 hover:border-amber-500/40 transition-colors space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400">최적 1 ~ 최적 4+</span>
            <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded">상위 0.1%</span>
          </div>
          <div className="text-xs font-bold text-amber-300">메인 & 스마트블록 장악</div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            핵심 키워드 뷰탭 1페이지 랭킹에 도전하세요. 본 스튜디오의 D.I.A.+ 적합도 분석과 스마트에디터 서식이 큰 힘이 됩니다.
          </p>
        </div>
      </div>

      {/* 하단 출처 표기 */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-end text-[11px]">
        <a
          href="https://blogdex.space/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-500 hover:text-slate-400 font-mono transition-colors"
        >
          출처: blogdex.space
        </a>
      </div>
    </section>
  );
}
