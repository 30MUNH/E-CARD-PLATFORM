import React from 'react';
import { CalendarHeart, MessageSquareHeart, Plus, Sparkles, Trash2 } from 'lucide-react';
import { resolveImageUrl } from '../../data/ecardData';
import { useEditor } from '../context/EditorContext';

export const ContentEditorSection: React.FC = () => {
  const { draft, updateDraft } = useEditor();

  const addLetterParagraph = () => {
    updateDraft((prev) => ({
      ...prev,
      letterData: {
        ...prev.letterData,
        love_letters: [...prev.letterData.love_letters, ''],
      },
    }));
  };

  const updateLetterParagraph = (idx: number, text: string) => {
    updateDraft((prev) => ({
      ...prev,
      letterData: {
        ...prev.letterData,
        love_letters: prev.letterData.love_letters.map((p, i) => (i === idx ? text : p)),
      },
    }));
  };

  const removeLetterParagraph = (idx: number) => {
    updateDraft((prev) => ({
      ...prev,
      letterData: {
        ...prev.letterData,
        love_letters: prev.letterData.love_letters.filter((_, i) => i !== idx),
      },
    }));
  };

  const addMilestone = () => {
    updateDraft((prev) => ({
      ...prev,
      specialDates: [
        ...prev.specialDates,
        {
          id: `ms-${Date.now().toString(36)}`,
          date: new Date().toISOString().slice(0, 10),
          title: 'Cột mốc kỷ niệm mới',
          description: 'Mô tả khoảnh khắc đáng nhớ của hai bạn...',
          badge: 'Kỷ niệm',
        },
      ],
    }));
  };

  const removeMilestone = (idx: number) => {
    updateDraft((prev) => ({
      ...prev,
      specialDates: prev.specialDates.filter((_, i) => i !== idx),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Intro Message */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#A33149]" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Lời chào mở đầu (Welcome Screen)</h2>
            <p className="text-xs text-slate-500">
              Tùy chỉnh tiêu đề lời mời và nút bắt đầu hiển thị khi người nhận mở thiệp.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề lời chào
            </label>
            <input
              type="text"
              value={draft.welcomeConfig.heading || ''}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  welcomeConfig: { ...prev.welcomeConfig, heading: e.target.value },
                }))
              }
              placeholder="Món quà bí mật"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lời dẫn phụ
            </label>
            <input
              type="text"
              value={draft.welcomeConfig.subheading || ''}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  welcomeConfig: { ...prev.welcomeConfig, subheading: e.target.value },
                }))
              }
              placeholder="Dành tặng người đặc biệt nhất"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nhãn nút bấm
            </label>
            <input
              type="text"
              value={draft.welcomeConfig.buttonLabel || 'Bắt đầu'}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  welcomeConfig: { ...prev.welcomeConfig, buttonLabel: e.target.value },
                }))
              }
              placeholder="Bắt đầu"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Love Letter Content Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquareHeart className="w-5 h-5 text-[#A33149]" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Nội dung Lá Thư Tình ({draft.letterData.love_letters.length} đoạn)
              </h2>
              <p className="text-xs text-slate-500">
                Mỗi đoạn văn sẽ được hiển thị lần lượt bằng hiệu ứng máy đánh chữ (Typewriter).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addLetterParagraph}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#A33149] text-xs font-semibold transition self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm đoạn thư</span>
          </button>
        </div>

        <div className="space-y-3">
          {draft.letterData.love_letters.map((paragraph, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <span className="mt-2.5 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <textarea
                rows={2}
                value={paragraph}
                onChange={(e) => updateLetterParagraph(idx, e.target.value)}
                placeholder={`Nhập đoạn thư #${idx + 1}...`}
                aria-label={`Đoạn thư ${idx + 1}`}
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#A33149]"
              />
              <button
                type="button"
                onClick={() => removeLetterParagraph(idx)}
                aria-label={`Xóa đoạn thư ${idx + 1}`}
                className="mt-2 p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Photo Captions Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Chú thích từng bức ảnh trong Album ({draft.albumData.length} ảnh)
          </h2>
          <p className="text-xs text-slate-500">
            Chú thích hiển thị dưới ảnh khi người nhận chạm để phóng to ảnh trong Lightbox.
          </p>
        </div>

        <div className="divide-y divide-slate-100">
          {draft.albumData.map((item, idx) => (
            <div key={item.id || idx} className="py-3 flex items-center gap-3">
              <img
                src={resolveImageUrl(item.image_url)}
                alt={`Thumb ${idx + 1}`}
                className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0"
              />
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Ảnh #{idx + 1}
                </label>
                <input
                  type="text"
                  value={item.caption}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      albumData: prev.albumData.map((a, i) =>
                        i === idx ? { ...a, caption: e.target.value } : a
                      ),
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-[#A33149]"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Special Dates / Timeline Milestones Editor */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarHeart className="w-5 h-5 text-[#A33149]" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Cột mốc &amp; Ngày đặc biệt ({draft.specialDates.length})
              </h2>
              <p className="text-xs text-slate-500">
                Hiển thị trên trang Dòng thời gian (Cột mốc) của thiệp.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={addMilestone}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-[#A33149] text-xs font-semibold transition self-start"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm cột mốc</span>
          </button>
        </div>

        <div className="space-y-3">
          {draft.specialDates.map((ms, idx) => (
            <div
              key={ms.id || idx}
              className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 grid grid-cols-1 md:grid-cols-12 gap-3 items-start"
            >
              <div className="md:col-span-3">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Ngày kỷ niệm
                </label>
                <input
                  type="date"
                  value={ms.date}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      specialDates: prev.specialDates.map((item, i) =>
                        i === idx ? { ...item, date: e.target.value } : item
                      ),
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Tiêu đề cột mốc
                </label>
                <input
                  type="text"
                  value={ms.title}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      specialDates: prev.specialDates.map((item, i) =>
                        i === idx ? { ...item, title: e.target.value } : item
                      ),
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Nội dung kỷ niệm
                </label>
                <input
                  type="text"
                  value={ms.description}
                  onChange={(e) =>
                    updateDraft((prev) => ({
                      ...prev,
                      specialDates: prev.specialDates.map((item, i) =>
                        i === idx ? { ...item, description: e.target.value } : item
                      ),
                    }))
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
                />
              </div>
              <div className="md:col-span-1 flex justify-end pt-5">
                <button
                  type="button"
                  onClick={() => removeMilestone(idx)}
                  aria-label={`Xóa cột mốc ${idx + 1}`}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
