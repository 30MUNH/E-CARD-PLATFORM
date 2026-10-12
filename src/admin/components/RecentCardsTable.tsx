import React from 'react';
import { Archive, Edit3, Eye, Lock, Send, Unlock } from 'lucide-react';
import { CardSummary, EcardStatus } from '../../types/ecard';

interface RecentCardsTableProps {
  cards: CardSummary[];
  onEdit: (cardId: string) => void;
  onPreview: (cardId: string) => void;
  onPublish: (cardId: string) => void;
  onArchive: (cardId: string) => void;
}

const STATUS_BADGE: Record<EcardStatus, { label: string; className: string }> = {
  published: {
    label: 'Đã xuất bản',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  draft: {
    label: 'Bản nháp',
    className: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  archived: {
    label: 'Đã lưu trữ',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  },
};

export const RecentCardsTable: React.FC<RecentCardsTableProps> = ({
  cards,
  onEdit,
  onPreview,
  onPublish,
  onArchive,
}) => {
  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <p className="text-slate-600 font-medium">Không tìm thấy thiệp E-Card nào phù hợp.</p>
        <p className="text-sm text-slate-400 mt-1">
          Hãy thử thay đổi bộ lọc tìm kiếm hoặc tạo một thiệp E-Card mới.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="hidden md:table-header-group">
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Tên Thiệp &amp; Cặp Đôi</th>
              <th className="py-3.5 px-4">Giao Diện (Template)</th>
              <th className="py-3.5 px-4">Ngày Tạo</th>
              <th className="py-3.5 px-4">Bảo Mật</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {cards.map((card) => {
              const badge = STATUS_BADGE[card.status];
              return (
                <tr
                  key={card.id}
                  className="flex flex-col md:table-row p-4 md:p-0 hover:bg-slate-50/80 transition"
                >
                  <td className="py-1 md:py-4 md:px-5">
                    <div className="font-semibold text-slate-900">{card.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {card.senderName} → {card.recipientName} • {card.photoCount} ảnh
                    </div>
                  </td>
                  <td className="py-1 md:py-4 md:px-4 text-xs md:text-sm text-slate-700 font-medium">
                    {card.templateName}
                  </td>
                  <td className="py-1 md:py-4 md:px-4 text-xs md:text-sm text-slate-600">
                    {new Date(card.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-1 md:py-4 md:px-4">
                    {card.hasPin ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700">
                        <Lock className="w-3.5 h-3.5" />
                        PIN 4 số
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                        <Unlock className="w-3.5 h-3.5" />
                        Công khai
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 md:py-4 md:px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  </td>
                  <td className="pt-2 md:py-4 md:px-5">
                    <div className="flex flex-wrap items-center md:justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(card.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
                        title="Chỉnh sửa thiệp"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onPreview(card.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#A33149] hover:bg-rose-50 border border-rose-200 transition"
                        title="Xem trước trực tiếp"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem trước</span>
                      </button>
                      {card.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => onPublish(card.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 hover:bg-emerald-50 border border-emerald-200 transition"
                          title="Xuất bản thiệp"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Xuất bản</span>
                        </button>
                      )}
                      {card.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => onArchive(card.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
                          title="Lưu trữ thiệp"
                        >
                          <Archive className="w-3.5 h-3.5" />
                          <span>Lưu trữ</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
