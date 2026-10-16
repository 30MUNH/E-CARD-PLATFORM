import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  Archive,
  Check,
  CheckCircle2,
  Copy,
  Edit3,
  ExternalLink,
  Eye,
  FileEdit,
  Lock,
  Send,
  Unlock,
} from 'lucide-react';
import { CardSummary, EcardStatus } from '../../types/ecard';

interface RecentCardsTableProps {
  cards: CardSummary[];
  onEdit: (cardId: string) => void;
  onPreview: (cardId: string) => void;
  onPublish: (cardId: string) => void;
  onArchive: (cardId: string) => void;
}

const STATUS_CONFIG: Record<
  EcardStatus,
  {
    label: string;
    subtitle: string;
    className: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  published: {
    label: 'Đã xuất bản',
    subtitle: 'Công khai',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: CheckCircle2,
  },
  draft: {
    label: 'Bản nháp',
    subtitle: 'Đang sửa',
    className: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: FileEdit,
  },
  archived: {
    label: 'Đã lưu trữ',
    subtitle: 'Đã ẩn',
    className: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: Archive,
  },
};

export const RecentCardsTable: React.FC<RecentCardsTableProps> = ({
  cards,
  onEdit,
  onPreview,
  onPublish,
  onArchive,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyLink = async (cardId: string, url: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedId(cardId);
      toast.success('Đã sao chép liên kết thiệp công khai!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Không thể sao chép liên kết');
    }
  };

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
          <thead className="hidden lg:table-header-group">
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Tên Thiệp &amp; Cặp Đôi</th>
              <th className="py-3.5 px-4">Đường Dẫn Công Khai</th>
              <th className="py-3.5 px-4">Giao Diện</th>
              <th className="py-3.5 px-4">Bảo Mật</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {cards.map((card) => {
              const statusCfg = STATUS_CONFIG[card.status];
              const StatusIcon = statusCfg.icon;
              const publicPath = card.publicUrl || `/ecd/game/${card.id}`;
              const fullPublicUrl =
                typeof window !== 'undefined'
                  ? `${window.location.origin}${publicPath}`
                  : publicPath;
              const isCopied = copiedId === card.id;

              return (
                <tr
                  key={card.id}
                  className="flex flex-col lg:table-row p-4 lg:p-0 hover:bg-slate-50/80 transition"
                >
                  {/* Card Title & Couple Names */}
                  <td className="py-1 lg:py-4 lg:px-5">
                    <div className="font-semibold text-slate-900">{card.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#A33149]">
                        {card.senderName} ❤️ {card.recipientName}
                      </span>
                      <span>•</span>
                      <span>{card.photoCount} ảnh</span>
                      <span className="lg:hidden">•</span>
                      <span className="lg:hidden">
                        {new Date(card.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </td>

                  {/* Public URL with Copy and Open Button */}
                  <td className="py-2 lg:py-4 lg:px-4">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="font-mono text-xs text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-200 truncate max-w-[200px]"
                        title={fullPublicUrl}
                      >
                        {publicPath}
                      </span>
                      <button
                        type="button"
                        onClick={() => void handleCopyLink(card.id, fullPublicUrl)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#A33149] hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition shrink-0"
                        title="Sao chép link công khai"
                        aria-label="Sao chép link công khai"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Chép link</span>
                          </>
                        )}
                      </button>
                      <a
                        href={publicPath}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#A33149] hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition shrink-0"
                        title="Mở thiệp công khai trong tab mới"
                        aria-label="Mở thiệp trong tab mới"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </td>

                  {/* Template Info */}
                  <td className="py-1 lg:py-4 lg:px-4 text-xs lg:text-sm text-slate-700 font-medium">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                      {card.templateName}
                    </span>
                  </td>

                  {/* Security PIN Indicator */}
                  <td className="py-1 lg:py-4 lg:px-4">
                    {card.hasPin ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        <Lock className="w-3 h-3" />
                        PIN 4 số
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        <Unlock className="w-3 h-3" />
                        Công khai
                      </span>
                    )}
                  </td>

                  {/* Status Indicator */}
                  <td className="py-1.5 lg:py-4 lg:px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border shadow-xs ${statusCfg.className}`}
                    >
                      <StatusIcon className="w-3.5 h-3.5" />
                      <span>{statusCfg.label}</span>
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="pt-3 lg:py-4 lg:px-5">
                    <div className="flex flex-wrap items-center lg:justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onPreview(card.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#A33149] bg-rose-50 hover:bg-rose-100 border border-rose-200 shadow-xs transition"
                        title="Xem trước trực tiếp trên các kích thước"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem trước</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onEdit(card.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition"
                        title="Chỉnh sửa thiệp"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Sửa</span>
                      </button>

                      {card.status !== 'published' && (
                        <button
                          type="button"
                          onClick={() => onPublish(card.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-xs transition"
                          title="Xuất bản thiệp công khai"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Xuất bản</span>
                        </button>
                      )}

                      {card.status !== 'archived' && (
                        <button
                          type="button"
                          onClick={() => onArchive(card.id)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition"
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
