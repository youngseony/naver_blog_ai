import React, { useState, useEffect } from 'react';
import { X, Key, Cpu, CheckCircle2, AlertCircle, Loader2, ExternalLink, Eye, EyeOff, RotateCw, Sparkles, ShieldCheck } from 'lucide-react';
import { SettingsAPI, fetchAvailableGeminiModels } from '../utils/api';

const DEFAULT_MODELS = [
  { id: 'gemini-2.5-flash', name: 'gemini-2.5-flash', tier: 'free', tierLabel: '무료(Free Tier 강력 권장)', desc: '가장 빠르고 안정적인 무료 기본 모델' },
  { id: 'gemini-1.5-flash', name: 'gemini-1.5-flash', tier: 'free', tierLabel: '무료(Free Tier 호환)', desc: '검증된 가성비 모델' },
  { id: 'gemini-3.6-flash', name: 'gemini-3.6-flash', tier: 'paid', tierLabel: '유료/신규(최신 Flash)', desc: '최신 Gemini 3.6 아키텍처 지원' },
  { id: 'gemini-2.5-pro', name: 'gemini-2.5-pro', tier: 'paid', tierLabel: '유료(심층 추론 Pro)', desc: '복잡한 브리핑과 고품질 카피라이팅' },
  { id: 'gemini-1.5-pro', name: 'gemini-1.5-pro', tier: 'paid', tierLabel: '유료(심층 추론)', desc: '대용량 컨텍스트 윈도우 지원' },
];

export default function SettingsModal({ isOpen, onClose }) {
  const [activeProvider, setActiveProvider] = useState('gemini'); // 'gemini' | 'openai' | 'anthropic'
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState('gemini-2.5-flash');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [availableModels, setAvailableModels] = useState(DEFAULT_MODELS);
  const [updatingModels, setUpdatingModels] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
      setTestResult(null);
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const data = await SettingsAPI.get();
      setHasApiKey(data.has_api_key);
      setMaskedKey(data.masked_api_key);
      if (data.model) setModel(data.model);
    } catch (e) {
      console.error('Settings load failed:', e);
    }
  };

  const handleUpdateModels = async () => {
    setUpdatingModels(true);
    try {
      const models = await fetchAvailableGeminiModels(apiKey);
      if (models && models.length > 0) {
        setAvailableModels(models);
        alert(`Google API로부터 최신 사용 가능 모델 ${models.length}개를 성공적으로 동기화했습니다.`);
      } else {
        alert('조회된 모델이 없습니다. 기본 모델 목록을 유지합니다.');
      }
    } catch (err) {
      alert(`모델 목록 업데이트 실패: ${err.message}`);
    } finally {
      setUpdatingModels(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      if (apiKey.trim()) {
        await SettingsAPI.save({ gemini_api_key: apiKey.trim(), gemini_model: model });
      }
      const res = await SettingsAPI.testConnection(apiKey.trim(), model);
      setTestResult(res);
      if (res.success) {
        await loadSettings();
      }
    } catch (err) {
      setTestResult({ success: false, message: `테스트 실패: ${err.message}` });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { gemini_model: model };
      if (apiKey.trim()) {
        payload.gemini_api_key = apiKey.trim();
      }
      await SettingsAPI.save(payload);
      alert('설정이 안전하게 저장되었습니다.');
      onClose();
    } catch (err) {
      alert(`저장 실패: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* 모달 헤더 */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-naver flex items-center justify-center font-bold">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-slate-900">AI 엔진 & API 모델 설정</h2>
              <p className="text-xs text-slate-500">Google Gemini 연결 및 최신 모델 관리</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AI Provider 선택 탭 (확장성 대비) */}
        <div className="flex border-b border-slate-200 bg-slate-100/70 px-6 pt-2">
          <button
            onClick={() => setActiveProvider('gemini')}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeProvider === 'gemini'
                ? 'border-naver text-naver bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">활성</span>
          </button>

          <button
            onClick={() => alert('OpenAI ChatGPT API 연동 모듈은 다음 업데이트에서 정식 지원될 예정입니다.')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 border-b-2 border-transparent"
          >
            <span>OpenAI (GPT-4o)</span>
            <span className="text-[9px] bg-slate-200 text-slate-500 px-1 rounded">예정</span>
          </button>

          <button
            onClick={() => alert('Anthropic Claude API 연동 모듈은 다음 업데이트에서 정식 지원될 예정입니다.')}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-slate-600 border-b-2 border-transparent"
          >
            <span>Anthropic (Claude 3.5)</span>
            <span className="text-[9px] bg-slate-200 text-slate-500 px-1 rounded">예정</span>
          </button>
        </div>

        {/* 폼 내용 */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-600 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>무료 키 발급 (Google AI Studio)</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value.trim())}
                placeholder={hasApiKey ? `등록됨 (${maskedKey}) - 변경 시 새로 입력` : "AIzaSy... 또는 AQ...."}
                className="w-full pl-4 pr-11 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showKey ? "키 숨기기" : "키 보기"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {apiKey && !apiKey.startsWith('AIzaSy') && !apiKey.startsWith('AQ.') && (
              <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 leading-relaxed">
                <span className="font-bold">⚠️ 키 형식 안내:</span> Google AI Studio의 Gemini API 키(AIzaSy... 또는 신규 Auth Key AQ....)를 입력해 주세요.
              </div>
            )}
          </div>

          {/* 모델 선택 & 실시간 업데이트 버튼 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-600" /> 사용할 Gemini 모델
              </label>

              <button
                type="button"
                onClick={handleUpdateModels}
                disabled={updatingModels}
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                <RotateCw className={`w-3 h-3 ${updatingModels ? 'animate-spin' : ''}`} />
                <span>{updatingModels ? '업데이트 중...' : 'Google 최신 모델 업데이트'}</span>
              </button>
            </div>

            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <optgroup label="[무료 계정 권장 (Free Tier)]">
                {availableModels
                  .filter((m) => m.tier === 'free' || m.id.includes('flash'))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      🟢 [무료 권장] {m.displayName || m.name}
                    </option>
                  ))}
              </optgroup>
              <optgroup label="[유료 종량제 계정 권장 (Paid Tier)]">
                {availableModels
                  .filter((m) => m.tier === 'paid' && !m.id.includes('flash'))
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      💎 [유료 고성능] {m.displayName || m.name}
                    </option>
                  ))}
              </optgroup>
            </select>

            {/* 자동 폴백 안내 */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800">무료 모델 자동 폴백(Auto-Fallback) 보호:</strong> 선택하신 모델이 할당량 초과(Quota)나 계정 등급 제한으로 호출 실패하더라도, 시스템이 즉시 <strong>무료 안정화 모델(gemini-2.5-flash)</strong>로 자동 전환하여 글 작성이 중단되지 않습니다.
              </div>
            </div>
          </div>

          {/* 테스트 결과 창 */}
          {testResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2 ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              )}
              <div>{testResult.message}</div>
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            <span>API 연결 테스트</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-naver hover:bg-naver-hover text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
