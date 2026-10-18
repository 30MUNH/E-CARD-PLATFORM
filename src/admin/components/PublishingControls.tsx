import React, { useState } from 'react';
import { Archive, CheckCircle2, Eye, Save, Send, Wrench } from 'lucide-react';
import { PublishCardResult } from '../../types/ecard';

interface PublishingControlsProps {
  cardId: string | null;
  isMockMode: boolean;
  isDirty: boolean;
  lastSavedAt: string | null;
  onSaveDraft: () => Promise<void>;
  onOpenPreview: () => void;
  onPublish: () => Promise<PublishCardResult | null>;
  onArchive: () => Promise<void>;
}

export const PublishingControls: React.FC<PublishingControlsProps> = ({
  cardId,
  isMockMode,
  isDirty,
  lastSavedAt,
  onSaveDraft,
  onOpenPreview,
  onPublish,
  onArchive,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [publishNotice, setPublishNotice] = useState<PublishCardResult | null>(null);

  const handleSaveClick = async () => {
    setIsSaving(true);
    try {
      await onSaveDraft();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublishClick = async () => {
    setIsSaving(true);
    try {
      const res = await onPublish();
      if (res) {
        setPublishNotice(res);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Kiểm tra, Lưu nháp &amp; Xuất bản Thiệp
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Xem trước toàn bộ trải nghiệm người nhận trước khi lưu bản nháp hoặc yêu cầu xuất bản.
          </p>
        </div>

        {/* Status Summary */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-slate-800">
              Mã định danh thiệp:{' '}
              <span className="font-mono text-[#A33149]">
                {cardId && cardId !== 'new' ? cardId : '(Chưa lưu — Thiệp mới)'}
              </span>
            </div>
            <div className="text-slate-500">
              {isDirty
                ? 'Có thay đổi chưa lưu trên biểu mẫu.'
                : lastSavedAt
                ? `Đã lưu lần cuối lúc ${new Date(lastSavedAt).toLocaleTimeString('vi-VN')}`
                : 'Sẵn sàng lưu bản nháp.'}
            </div>
          </div>

          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold self-start sm:self-center ${isMockMode ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {isMockMode ? <Wrench className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
            <span>{isMockMode ? 'Chế độ xem thử' : 'Dữ liệu thật · Supabase'}</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handleSaveClick()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Bản Nháp (Save Draft)</span>
          </button>

          <button
            type="button"
            onClick={onOpenPreview}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#A33149] border border-rose-200 text-sm font-semibold transition"
          >
            <Eye className="w-4 h-4" />
            <span>Xem Trước Trực Tiếp (Live Preview)</span>
          </button>

          <button
            type="button"
            disabled={isSaving}
            onClick={() => void handlePublishClick()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#A33149] hover:bg-[#8e283e] text-white text-sm font-semibold shadow-sm transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Xuất Bản Thiệp (Publish)</span>
          </button>

          {cardId && cardId !== 'new' && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => void onArchive()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-sm font-semibold transition"
            >
              <Archive className="w-4 h-4" />
              <span>Lưu Trữ (Archive)</span>
            </button>
          )}
        </div>

        {/* Explicit Integration Pending Feedback on Publish */}
        {publishNotice && (
          <div className={`rounded-2xl border p-5 space-y-2 ${publishNotice.integrationPending ? 'bg-amber-50 border-amber-300' : 'bg-emerald-50 border-emerald-300'}`}>
            <div className={`flex items-center gap-2 text-sm font-bold ${publishNotice.integrationPending ? 'text-amber-900' : 'text-emerald-900'}`}>
              <CheckCircle2 className={`w-5 h-5 ${publishNotice.integrationPending ? 'text-amber-700' : 'text-emerald-700'}`} />
              <span>{publishNotice.integrationPending ? 'Đã xuất bản bản xem thử' : 'Thiệp đã được xuất bản'}</span>
            </div>
            <p className={`text-xs leading-relaxed ${publishNotice.integrationPending ? 'text-amber-800' : 'text-emerald-800'}`}>{publishNotice.message}</p>
            {publishNotice.publicUrl && (
              <div className={`pt-1 text-xs font-mono ${publishNotice.integrationPending ? 'text-amber-900' : 'text-emerald-900'}`}>
                {publishNotice.integrationPending ? 'Đường dẫn xem thử:' : 'Link công khai:'}{' '}
                <a
                  href={publishNotice.publicUrl}
                  className="underline font-semibold text-[#A33149]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {publishNotice.publicUrl}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
