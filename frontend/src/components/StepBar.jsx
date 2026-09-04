import React from 'react';
import { Search, ListTree, PenTool, Image, CopyCheck } from 'lucide-react';

const STEPS = [
  { id: 1, name: '자료 검색 & 기획', icon: Search, desc: '키워드 및 6단계 브리핑' },
  { id: 2, name: '목차 설계', icon: ListTree, desc: '3계층 목차 & 시각요소' },
  { id: 3, name: '본문 작성', icon: PenTool, desc: 'PAS 공식 & 모바일 최적화' },
  { id: 4, name: '이미지 프롬프트', icon: Image, desc: '썸네일 1 + 본문 3컷' },
  { id: 5, name: '스마트에디터 복사', icon: CopyCheck, desc: '서식 완벽 복사 & ZIP' },
];

export default function StepBar({ currentStep, setStep, maxStepReached }) {
  return (
    <div className="bg-white border-b border-slate-200 py-4 px-4 sm:px-6 shadow-sm">
      <div className="max-w-5xl mx-auto">
        <nav aria-label="Progress">
          <ol className="grid grid-cols-5 gap-2 sm:gap-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPassed = currentStep > step.id;
              const isAccessible = step.id <= maxStepReached;

              return (
                <li key={step.id} className="relative">
                  <button
                    onClick={() => isAccessible && setStep(step.id)}
                    disabled={!isAccessible}
                    className={`w-full flex flex-col items-center text-center p-2 rounded-xl transition-all ${
                      isActive
                        ? 'bg-emerald-50 border border-emerald-500/40 shadow-sm'
                        : isPassed
                        ? 'hover:bg-slate-50 cursor-pointer'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm mb-1.5 transition-colors ${
                        isActive
                          ? 'bg-naver text-white ring-4 ring-emerald-100'
                          : isPassed
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-xs font-bold leading-tight line-clamp-1 ${
                        isActive ? 'text-emerald-950' : isPassed ? 'text-slate-700' : 'text-slate-400'
                      }`}
                    >
                      {step.id}단계. {step.name}
                    </span>
                    <span className="hidden md:block text-[11px] text-slate-400 mt-0.5">
                      {step.desc}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}
