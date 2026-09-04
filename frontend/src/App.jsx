import React, { useState } from 'react';
import Header from './components/Header';
import StepBar from './components/StepBar';
import Step1Research from './components/Step1Research';
import Step2Outline from './components/Step2Outline';
import Step3Content from './components/Step3Content';
import Step4Images from './components/Step4Images';
import Step5Export from './components/Step5Export';
import HistoryDrawer from './components/HistoryDrawer';
import SettingsModal from './components/SettingsModal';
import BlogdexWidget from './components/BlogdexWidget';

const INITIAL_STATE = {
  postId: null,
  topic: '',
  additionalContext: '',
  primaryKeyword: '',
  subKeywords: [],
  briefing: {
    purpose: '',
    target_audience: '',
    core_problem: '',
    solution: '',
    differentiation: '',
    call_to_action: '',
  },
  marketInsight: '',
  outline: {
    sections: [],
  },
  title: '',
  titleCandidates: [],
  tone: '친절하고 전문적인 말투',
  content: '',
  contentHtml: '',
  seoScore: null,
  images: [],
};

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1);
  const [state, setState] = useState(INITIAL_STATE);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const updateState = (updates) => {
    setState((prev) => ({ ...prev, ...updates }));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    if (step > maxStepReached) {
      setMaxStepReached(step);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextStep = () => {
    goToStep(Math.min(currentStep + 1, 5));
  };

  const handlePrevStep = () => {
    goToStep(Math.max(currentStep - 1, 1));
  };

  const handleNewPost = () => {
    if (confirm('새 글을 작성하시겠습니까? 현재 작성 중인 글은 히스토리에 보관됩니다.')) {
      setState(INITIAL_STATE);
      setCurrentStep(1);
      setMaxStepReached(1);
    }
  };

  const handleLoadPost = (loadedData) => {
    setState({
      postId: loadedData.id,
      topic: loadedData.topic || '',
      additionalContext: '',
      primaryKeyword: loadedData.primary_keyword || '',
      subKeywords: loadedData.sub_keywords || [],
      briefing: loadedData.briefing || {},
      marketInsight: '',
      outline: loadedData.outline || { sections: [] },
      title: loadedData.title || '',
      titleCandidates: [loadedData.title || ''],
      tone: '친절하고 전문적인 말투',
      content: loadedData.content || '',
      contentHtml: '', // Step 3/5 진입 시 자동 보완
      seoScore: null,
      images: loadedData.images || [],
    });
    // 데이터 내용에 따라 적절한 스텝으로 이동
    if (loadedData.content) {
      setCurrentStep(5);
      setMaxStepReached(5);
    } else if (loadedData.outline?.sections?.length > 0) {
      setCurrentStep(3);
      setMaxStepReached(3);
    } else {
      setCurrentStep(2);
      setMaxStepReached(2);
    }
  };

  const handleScrollToBlogdex = () => {
    const el = document.getElementById('blogdex-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 헤더 */}
      <Header
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onNewPost={handleNewPost}
        onScrollToBlogdex={handleScrollToBlogdex}
      />

      {/* 5단계 스텝 인디케이터 바 */}
      <StepBar
        currentStep={currentStep}
        setStep={goToStep}
        maxStepReached={maxStepReached}
      />

      {/* 메인 단계별 작업 뷰 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        {currentStep === 1 && (
          <Step1Research
            state={state}
            updateState={updateState}
            nextStep={handleNextStep}
          />
        )}
        {currentStep === 2 && (
          <Step2Outline
            state={state}
            updateState={updateState}
            prevStep={handlePrevStep}
            nextStep={handleNextStep}
          />
        )}
        {currentStep === 3 && (
          <Step3Content
            state={state}
            updateState={updateState}
            prevStep={handlePrevStep}
            nextStep={handleNextStep}
          />
        )}
        {currentStep === 4 && (
          <Step4Images
            state={state}
            updateState={updateState}
            prevStep={handlePrevStep}
            nextStep={handleNextStep}
          />
        )}
        {currentStep === 5 && (
          <Step5Export
            state={state}
            updateState={updateState}
            prevStep={handlePrevStep}
            onNewPost={handleNewPost}
          />
        )}

        {/* 블덱스(Blogdex) 블로그 지수 분석 센터 위젯 */}
        <BlogdexWidget />
      </main>

      {/* 히스토리 슬라이드 드로어 */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onLoadPost={handleLoadPost}
      />

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
