import React from 'react';
import { ArrowDown, ArrowUp, Check, Palette, Sliders } from 'lucide-react';
import { AVAILABLE_TEMPLATES, SLIDES } from '../../data/ecardData';
import { SlideId } from '../../types/ecard';
import { useEditor } from '../context/EditorContext';

const CONFIGURABLE_SLIDES: Array<{ id: SlideId; label: string; description: string }> = [
  {
    id: 'homepage',
    label: 'Trang chủ (Homepage)',
    description: 'Ảnh bìa cặp đôi, bộ đếm ngày yêu và các lối tắt.',
  },
  {
    id: 'album',
    label: 'Sách lật PDF',
    description: 'Tải một file PDF để người nhận xem như sách lật trang.',
  },
  {
    id: 'music',
    label: 'Voice (Bản thu âm Voice)',
    description: 'Đoạn ghi âm lời nhắn từ khách hàng hoặc bài hát kỷ niệm.',
  },
  {
    id: 'letter',
    label: 'Lá thư (Love Letter)',
    description: 'Bức thư tay với hiệu ứng máy đánh chữ và khung avatar trái tim.',
  },
  {
    id: 'timeline',
    label: 'Cột mốc (Special Dates / Timeline)',
    description: 'Dòng thời gian ghi dấu các ngày kỷ niệm quan trọng.',
  },
  {
    id: 'game',
    label: 'Trò chơi (Love Drunk Card Game)',
    description: 'Bộ bài 55 lá tương tác gắn kết cặp đôi.',
  },
  {
    id: 'video',
    label: 'Video Kỷ niệm (Video)',
    description: 'Trình phát video kỷ niệm tùy chọn.',
  },
];

export const TemplateSettingsSection: React.FC = () => {
  const { draft, updateDraft } = useEditor();

  const orderedConfigurableIds: SlideId[] = draft.slideOrder.filter(
    (id) => id !== 'setting'
  );

  const moveSlide = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= orderedConfigurableIds.length) return;
    updateDraft((prev) => {
      const list: SlideId[] = prev.slideOrder.filter((id) => id !== 'setting');
      const [moved] = list.splice(idx, 1);
      list.splice(targetIdx, 0, moved);
      return {
        ...prev,
        slideOrder: list,
      };
    });
  };

  const toggleSlideVisibility = (slideId: SlideId, checked: boolean) => {
    updateDraft((prev) => {
      const cleanOrder: SlideId[] = prev.slideOrder.filter((s) => s !== 'setting');
      const nextOrder: SlideId[] = cleanOrder.includes(slideId)
        ? cleanOrder
        : [...cleanOrder, slideId];
      return {
        ...prev,
        hasVideo: slideId === 'video' ? checked : prev.hasVideo,
        slideOrder: nextOrder,
        slideVisibility: {
          ...prev.slideVisibility,
          [slideId]: checked,
        },
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Template Picker */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#A33149]" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">Lựa chọn Giao diện (Template)</h2>
            <p className="text-xs text-slate-500">
              Chọn mẫu thiết kế chủ đạo cho thiệp SONG HÀNH KÝ.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {AVAILABLE_TEMPLATES.map((tpl) => {
            const selected = draft.templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() =>
                  updateDraft((prev) => ({
                    ...prev,
                    templateId: tpl.id,
                  }))
                }
                className={`text-left rounded-2xl border p-4 transition flex flex-col justify-between ${
                  selected
                    ? 'border-[#A33149] ring-2 ring-[#A33149]/20 bg-rose-50/40'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div>
                  <div className="h-32 rounded-xl overflow-hidden mb-3 relative bg-slate-100">
                    <img
                      src={tpl.previewImageUrl}
                      alt={tpl.name}
                      className="w-full h-full object-cover"
                    />
                    {selected && (
                      <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#A33149] text-white flex items-center justify-center shadow">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="font-bold text-slate-900 text-sm">{tpl.name}</div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {tpl.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#A33149]">
                    {selected ? 'Đang sử dụng' : 'Chọn mẫu này'}
                  </span>
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: tpl.accentColor }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Page Ordering & Visibility */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-[#A33149]" />
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Hiển thị &amp; Thứ tự các trang trong Thiệp
            </h2>
            <p className="text-xs text-slate-500">
              Bật/tắt các trang tùy chọn và sắp xếp thứ tự điều hướng Tiến / Lùi cho thiệp.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {CONFIGURABLE_SLIDES.map((item) => {
            const orderIdx = orderedConfigurableIds.indexOf(item.id);
            const isEnabled =
              item.id === 'timeline'
                ? Boolean(draft.slideVisibility.timeline)
                : item.id === 'video'
                ? Boolean(draft.hasVideo && draft.slideVisibility.video !== false)
                : draft.slideVisibility[item.id] !== false;

            const slideDef = SLIDES.find((s) => s.id === item.id);

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border ${
                  isEnabled
                    ? 'bg-white border-slate-200'
                    : 'bg-slate-50 border-slate-200/60 opacity-70'
                }`}
              >
                <label className="flex items-start gap-3 cursor-pointer flex-1">
                  <input
                    type="checkbox"
                    checked={isEnabled}
                    onChange={(e) => toggleSlideVisibility(item.id, e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#A33149]"
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-900">
                      {item.label}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        ({slideDef?.title || item.id})
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                </label>

                {orderIdx !== -1 && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={orderIdx <= 0}
                      onClick={() => moveSlide(orderIdx, -1)}
                      aria-label={`Đưa trang ${item.label} lên`}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={orderIdx === orderedConfigurableIds.length - 1}
                      onClick={() => moveSlide(orderIdx, 1)}
                      aria-label={`Đưa trang ${item.label} xuống`}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Effects Options */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Tuỳ chỉnh Hiệu ứng Hình ảnh &amp; Âm thanh</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer">
            <div>
              <div className="text-sm font-semibold text-slate-800">
                Hiệu ứng trái tim bay (Floating Hearts)
              </div>
              <p className="text-xs text-slate-500">
                Hiển thị các hạt trái tim lãng mạn trên màn hình lớn (Tự động tắt nếu thiết bị bật Reduced Motion).
              </p>
            </div>
            <input
              type="checkbox"
              checked={draft.themeCustomization.enableFloatingHearts}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  themeCustomization: {
                    ...prev.themeCustomization,
                    enableFloatingHearts: e.target.checked,
                  },
                }))
              }
              className="w-4 h-4 rounded text-[#A33149]"
            />
          </label>

          <label className="flex items-center justify-between p-4 rounded-xl border border-slate-200 cursor-pointer">
            <div>
              <div className="text-sm font-semibold text-slate-800">
                Hiệu ứng âm thanh chạm (Tap Sound)
              </div>
              <p className="text-xs text-slate-500">
                Phát âm thanh nhẹ nhàng khi người nhận chạm vào các nút điều hướng và rút bài.
              </p>
            </div>
            <input
              type="checkbox"
              checked={draft.themeCustomization.enableSoundEffects}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  themeCustomization: {
                    ...prev.themeCustomization,
                    enableSoundEffects: e.target.checked,
                  },
                }))
              }
              className="w-4 h-4 rounded text-[#A33149]"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
