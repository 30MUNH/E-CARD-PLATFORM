import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Eye,
  FileText,
  Image,
  Lock,
  Palette,
  Save,
  Send,
  UserCheck,
} from 'lucide-react';
import { getCardRepository } from '../../services';
import { PublishCardResult } from '../../types/ecard';
import { EditorTabId, useEditor } from '../context/EditorContext';
import { BasicInfoSection } from '../components/BasicInfoSection';
import { MediaUploadSection } from '../components/MediaUploadSection';
import { ContentEditorSection } from '../components/ContentEditorSection';
import { TemplateSettingsSection } from '../components/TemplateSettingsSection';
import { AccessSettingsSection } from '../components/AccessSettingsSection';
import { PublishingControls } from '../components/PublishingControls';

const EDITOR_TABS: Array<{ id: EditorTabId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: 'basic', label: '1. Thông tin cơ bản', icon: UserCheck },
  { id: 'media', label: '2. Đa phương tiện', icon: Image },
  { id: 'content', label: '3. Nội dung & Thư', icon: FileText },
  { id: 'template', label: '4. Giao diện & Trang', icon: Palette },
  { id: 'access', label: '5. Mã PIN 4 số', icon: Lock },
  { id: 'publish', label: '6. Xuất bản', icon: Send },
];

export const CardEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    editingCardId,
    draft,
    activeTab,
    isDirty,
    lastSavedAt,
    setActiveTab,
    initializeNewCard,
    initializeFromCard,
    markSaved,
  } = useEditor();
  const [isLoadingCard, setIsLoadingCard] = useState(false);

  useEffect(() => {
    const targetId = id || 'new';
    // Preserve unsaved form state if returning from Live Preview for the same card
    if (editingCardId === targetId) {
      return;
    }

    if (targetId === 'new') {
      initializeNewCard();
      return;
    }

    let cancelled = false;
    setIsLoadingCard(true);
    void getCardRepository()
      .getCard(targetId)
      .then((card) => {
        if (!cancelled) {
          initializeFromCard(card);
        }
      })
      .catch(() => {
        if (!cancelled) {
          toast.error('Không tìm thấy thiệp yêu cầu, đã mở trình tạo mới');
          initializeNewCard();
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingCard(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, editingCardId, initializeNewCard, initializeFromCard]);

  const handleSaveDraft = async () => {
    if (!draft.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề thiệp trước khi lưu');
      setActiveTab('basic');
      return;
    }
    const repo = getCardRepository();
    if (!editingCardId || editingCardId === 'new') {
      const created = await repo.createCard(draft);
      markSaved(created.ecardData.id);
      toast.success('Đã lưu bản nháp mới (Chế độ Demo)');
      navigate(`/admin/cards/${created.ecardData.id}/edit`, { replace: true });
    } else {
      const saved = await repo.saveDraft(editingCardId, draft);
      markSaved(saved.ecardData.id);
      toast.success('Đã cập nhật bản nháp');
    }
  };

  const handleOpenPreview = () => {
    const targetId = editingCardId && editingCardId !== 'new' ? editingCardId : 'new';
    navigate(`/admin/cards/${targetId}/preview`);
  };

  const handlePublish = async (): Promise<PublishCardResult | null> => {
    if (!draft.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề thiệp trước khi xuất bản');
      setActiveTab('basic');
      return null;
    }
    const repo = getCardRepository();
    let targetId = editingCardId;
    if (!targetId || targetId === 'new') {
      const created = await repo.createCard(draft);
      targetId = created.ecardData.id;
      markSaved(targetId);
    } else {
      await repo.saveDraft(targetId, draft);
      markSaved(targetId);
    }
    const res = await repo.publishCard(targetId);
    toast.success('Đã cập nhật trạng thái Xuất bản (Demo Mode)');
    return res;
  };

  const handleArchive = async () => {
    if (!editingCardId || editingCardId === 'new') return;
    await getCardRepository().archiveCard(editingCardId);
    toast.success('Đã chuyển thiệp sang trạng thái Lưu trữ');
    navigate('/admin/cards');
  };

  if (isLoadingCard) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
        Đang tải cấu hình thiệp...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div>
          <div className="text-xs font-semibold text-[#A33149] uppercase tracking-wider">
            {editingCardId && editingCardId !== 'new'
              ? `Chỉnh sửa Thiệp (${editingCardId})`
              : 'Khởi tạo Thiệp E-Card Mới'}
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-0.5">
            {draft.title || 'Thiệp chưa đặt tên'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {draft.senderName} → {draft.recipientName} • {draft.albumData.length} ảnh •{' '}
            {draft.letterData.love_letters.length} đoạn thư
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => void handleSaveDraft()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition"
          >
            <Save className="w-4 h-4" />
            <span>Lưu nháp</span>
          </button>

          <button
            type="button"
            onClick={handleOpenPreview}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#A33149] hover:bg-[#8e283e] text-white text-xs font-semibold shadow-sm transition"
          >
            <Eye className="w-4 h-4" />
            <span>Xem trước trực tiếp</span>
          </button>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div
        className="flex items-center gap-2 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Các bước biên tập thiệp"
      >
        {EDITOR_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                active
                  ? 'bg-[#A33149] text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Section Body */}
      <div>
        {activeTab === 'basic' && <BasicInfoSection />}
        {activeTab === 'media' && <MediaUploadSection />}
        {activeTab === 'content' && <ContentEditorSection />}
        {activeTab === 'template' && <TemplateSettingsSection />}
        {activeTab === 'access' && <AccessSettingsSection />}
        {activeTab === 'publish' && (
          <PublishingControls
            cardId={editingCardId}
            isDirty={isDirty}
            lastSavedAt={lastSavedAt}
            onSaveDraft={handleSaveDraft}
            onOpenPreview={handleOpenPreview}
            onPublish={handlePublish}
            onArchive={handleArchive}
          />
        )}
      </div>
    </div>
  );
};
