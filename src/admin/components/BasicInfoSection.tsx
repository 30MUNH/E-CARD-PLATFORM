import React, { useState } from 'react';
import { Calendar, Heart, Info, User } from 'lucide-react';
import { useEditor } from '../context/EditorContext';

export const BasicInfoSection: React.FC = () => {
  const { draft, updateDraft } = useEditor();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const markTouched = (field: string) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const titleError = touched.title && !draft.title.trim() ? 'Vui lòng nhập tiêu đề thiệp' : '';
  const senderError =
    touched.senderName && !draft.senderName.trim() ? 'Vui lòng nhập tên người gửi' : '';
  const recipientError =
    touched.recipientName && !draft.recipientName.trim() ? 'Vui lòng nhập tên người nhận' : '';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Thông tin cơ bản</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Thiết lập tiêu đề thiệp, tên cặp đôi và ngày bắt đầu yêu hoặc ngày kỷ niệm đặc biệt.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2">
          <label
            htmlFor="ecard-title-input"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Tiêu đề Thiệp E-Card <span className="text-rose-600">*</span>
          </label>
          <input
            id="ecard-title-input"
            type="text"
            value={draft.title}
            onBlur={() => markTouched('title')}
            onChange={(e) =>
              updateDraft((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            placeholder="Ví dụ: Kỷ niệm 1 năm ngày yêu — Ngọc Khánh & Hoàng Anh"
            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
              titleError
                ? 'border-rose-400 focus:ring-rose-200'
                : 'border-slate-200 focus:ring-[#A33149]/25 focus:border-[#A33149]'
            }`}
          />
          {titleError && <p className="text-xs text-rose-600 mt-1">{titleError}</p>}
        </div>

        <div>
          <label
            htmlFor="ecard-sender-input"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Tên Người gửi (Nữ / Đối tác 1) <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="ecard-sender-input"
              type="text"
              value={draft.senderName}
              onBlur={() => markTouched('senderName')}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  senderName: e.target.value,
                }))
              }
              placeholder="Ví dụ: Ngọc Khánh"
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                senderError
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-[#A33149]/25 focus:border-[#A33149]'
              }`}
            />
          </div>
          {senderError && <p className="text-xs text-rose-600 mt-1">{senderError}</p>}
        </div>

        <div>
          <label
            htmlFor="ecard-recipient-input"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Tên Người nhận (Nam / Đối tác 2) <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Heart className="w-4 h-4 text-rose-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="ecard-recipient-input"
              type="text"
              value={draft.recipientName}
              onBlur={() => markTouched('recipientName')}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  recipientName: e.target.value,
                }))
              }
              placeholder="Ví dụ: Lê Hoàng Anh"
              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                recipientError
                  ? 'border-rose-400 focus:ring-rose-200'
                  : 'border-slate-200 focus:ring-[#A33149]/25 focus:border-[#A33149]'
              }`}
            />
          </div>
          {recipientError && <p className="text-xs text-rose-600 mt-1">{recipientError}</p>}
        </div>

        <div>
          <label
            htmlFor="ecard-date-input"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Ngày bắt đầu yêu / Ngày đặc biệt <span className="text-rose-600">*</span>
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="ecard-date-input"
              type="date"
              value={draft.loveStartDate.slice(0, 10)}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  loveStartDate: e.target.value,
                }))
              }
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A33149]/25 focus:border-[#A33149]"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bộ đếm số ngày yêu trên trang chủ sẽ tự động tính từ ngày này.
          </p>
        </div>

        <div>
          <label
            htmlFor="ecard-tagline-input"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Thông điệp phụ trên Trang chủ (Tùy chọn)
          </label>
          <input
            id="ecard-tagline-input"
            type="text"
            value={draft.homepageData.tagline || ''}
            onChange={(e) =>
              updateDraft((prev) => ({
                ...prev,
                homepageData: {
                  ...prev.homepageData,
                  tagline: e.target.value,
                },
              }))
            }
            placeholder="Lưu giữ từng khoảnh khắc bên nhau"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A33149]/25 focus:border-[#A33149]"
          />
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="ecard-desc-input"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Ghi chú nội bộ / Mô tả đơn hàng (Tùy chọn)
          </label>
          <div className="relative">
            <Info className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <textarea
              id="ecard-desc-input"
              rows={3}
              value={draft.description || ''}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Ghi chú yêu cầu riêng của khách hàng, gói quà NFC hoặc thời gian giao thiệp..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A33149]/25 focus:border-[#A33149]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
