import React from 'react';
import { Archive, CheckCircle2, Eye, FileEdit } from 'lucide-react';
import { CardSummary, EcardStatus } from '../../types/ecard';

interface RecentCardsTableProps {
  cards: CardSummary[];
  onEdit: (cardId: string) => void;
  onPreview: (cardId: string) => void;
  onViewDetails?: (cardId: string) => void;
}

const STATUS_CONFIG: Record<EcardStatus, { label: string; className: string; icon: React.ComponentType<{ className?: string }> }> = {
  published: { label: 'Đã xuất bản', className: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  draft: { label: 'Bản nháp', className: 'bg-amber-50 text-amber-800 border-amber-200', icon: FileEdit },
  archived: { label: 'Đã lưu trữ', className: 'bg-slate-100 text-slate-600 border-slate-200', icon: Archive },
};

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const RecentCardsTable: React.FC<RecentCardsTableProps> = ({
  cards,
  onEdit,
  onPreview,
  onViewDetails,
}) => {
  if (cards.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center">
        <div className="mx-auto mb-3 grid h-11 w-11 place-items-center rounded-full bg-rose-50 text-[#A33149]">
          <FileEdit className="h-5 w-5" aria-hidden="true" />
        </div>
        <p className="font-semibold text-slate-800">Chưa có thiệp phù hợp</p>
        <p className="mt-1 text-sm text-slate-500">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
        <p className="text-sm font-semibold text-slate-800">Danh sách thiệp</p>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-600">{cards.length} thiệp</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 text-xs font-semibold text-slate-500">
              <th scope="col" className="px-5 py-3">Thiệp</th>
              <th scope="col" className="px-4 py-3">Người gửi / nhận</th>
              <th scope="col" className="px-4 py-3">Trạng thái</th>
              <th scope="col" className="px-4 py-3">Cập nhật</th>
              <th scope="col" className="px-5 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {cards.map((card) => {
              const status = STATUS_CONFIG[card.status];
              const StatusIcon = status.icon;
              return (
                <tr key={card.id} className="transition-colors hover:bg-slate-50/80">
                  <td className="max-w-64 px-5 py-4">
                    <p className="truncate text-sm font-semibold text-slate-900" title={card.title}>{card.title || 'Thiệp chưa đặt tên'}</p>
                    <p className="mt-1 truncate text-xs text-slate-500" title={card.templateName}>{card.templateName}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700">
                    <span className="font-medium">{card.senderName || 'Chưa có tên'}</span>
                    <span className="mx-1.5 text-slate-300" aria-hidden="true">→</span>
                    <span>{card.recipientName || 'Chưa có tên'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}>
                      <StatusIcon className="h-3.5 w-3.5" aria-hidden="true" />{status.label}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-4 text-sm tabular-nums text-slate-500">{formatDate(card.updatedAt || card.createdAt)}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {onViewDetails && (
                        <button type="button" onClick={() => onViewDetails(card.id)} className="min-h-10 rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2">
                          Chi tiết
                        </button>
                      )}
                      <button type="button" onClick={() => onEdit(card.id)} className="min-h-10 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A33149]/40" aria-label={`Sửa thiệp ${card.title}`}>
                        Sửa
                      </button>
                      <button type="button" onClick={() => onPreview(card.id)} className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-rose-50 hover:text-[#A33149] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A33149]/40" title="Xem trước thiệp" aria-label={`Xem trước thiệp ${card.title}`}>
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      </button>
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
