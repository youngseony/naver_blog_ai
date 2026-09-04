import React, { useState, useEffect } from 'react';
import { X, Trash2, Clock, ChevronRight, FileText, Loader2, AlertCircle } from 'lucide-react';
import { HistoryAPI } from '../utils/api';

export default function HistoryDrawer({ isOpen, onClose, onLoadPost }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const res = await HistoryAPI.list();
      setPosts(res.posts || []);
    } catch (e) {
      console.error('History load failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!confirm('정말 이 작성 기록을 삭제하시겠습니까?')) return;
    setDeletingId(id);
    try {
      await HistoryAPI.delete(id);
      setPosts(posts.filter((p) => p.id !== id));
    } catch (err) {
      alert(`삭제 실패: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSelectPost = async (id) => {
    try {
      const postDetail = await HistoryAPI.get(id);
      onLoadPost(postDetail);
      onClose();
    } catch (err) {
      alert(`불러오기 실패: ${err.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideLeft">
        {/* 헤더 */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-600" />
            <h2 className="font-bold text-base text-slate-900">작성 히스토리</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 리스트 본문 */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <div className="py-20 text-center space-y-2">
              <Loader2 className="w-6 h-6 animate-spin text-naver mx-auto" />
              <p className="text-xs text-slate-500">기록을 불러오고 있습니다...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="py-24 text-center space-y-2 text-slate-400">
              <FileText className="w-10 h-10 mx-auto stroke-1" />
              <p className="text-sm font-medium">아직 저장된 포스팅 기록이 없습니다.</p>
              <p className="text-xs text-slate-400">글을 작성하면 자동으로 안전하게 보관됩니다.</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                onClick={() => handleSelectPost(post.id)}
                className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer bg-white group space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md">
                    #{post.primary_keyword || '키워드'}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, post.id)}
                    disabled={deletingId === post.id}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 transition-opacity"
                    title="기록 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 line-clamp-2 leading-snug">
                  {post.title || post.topic}
                </h3>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>{new Date(post.created_at || post.updated_at).toLocaleDateString('ko-KR')}</span>
                  <span className="flex items-center text-emerald-600 font-bold group-hover:translate-x-0.5 transition-transform">
                    열기 <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
