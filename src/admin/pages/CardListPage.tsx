import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PlusCircle, Search } from 'lucide-react';
import { getCardRepository } from '../../services';
import { CardSummary, EcardStatus } from '../../types/ecard';
import { useEditor } from '../context/EditorContext';
import { RecentCardsTable } from '../components/RecentCardsTable';

const STATUS_TABS: Array<{ id: EcardStatus | 'all'; label: string }> = [
  { id: 'all', label: 'Tất cả' },
  { id: 'published', label: 'Đã xuất bản' },
  { id: 'draft', label: 'Bản nháp' },
  { id: 'archived', label: 'Đã lưu trữ' },
];

export const CardListPage: React.FC = () => {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [statusFilter, setStatusFilter] = useState<EcardStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { initializeFromCard } = useEditor();

  const fetchCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getCardRepository().listCards({
        status: statusFilter,
        search: searchQuery,
      });
      setCards(list);
    } catch {
      toast.error('Không thể tải danh sách thiệp');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    void fetchCards();
  }, [fetchCards]);

  const handleEdit = (cardId: string) => {
    navigate(`/admin/cards/${cardId}/edit`);
  };

  const handlePreview = async (cardId: string) => {
    try {
      const fullCard = await getCardRepository().getCard(cardId);
      initializeFromCard(fullCard);
      navigate(`/admin/cards/${cardId}/preview`);
    } catch {
      toast.error('Không thể mở bản xem trước');
    }
  };

  const handlePublish = async (cardId: string) => {
    try {
      const res = await getCardRepository().publishCard(cardId);
      toast.success(res.message, { duration: 4500 });
      await fetchCards();
    } catch {
      toast.error('Không thể xuất bản thiệp');
    }
  };

  const handleArchive = async (cardId: string) => {
    try {
      await getCardRepository().archiveCard(cardId);
      toast.success('Đã chuyển thiệp sang trạng thái Lưu trữ');
      await fetchCards();
    } catch {
      toast.error('Không thể lưu trữ thiệp');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Quản lý Thiệp E-Card</h1>
          <p className="text-sm text-slate-500 mt-1">
            Tìm kiếm, lọc theo trạng thái, chỉnh sửa nội dung và xem trước các thiệp của khách hàng.
          </p>
        </div>

        <Link
          to="/admin/cards/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A33149] hover:bg-[#8e283e] text-white text-sm font-semibold shadow-sm transition self-start"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo Thiệp Mới</span>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Bộ lọc trạng thái">
          {STATUS_TABS.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                  active
                    ? 'bg-[#A33149] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên thiệp, người nhận, người gửi..."
            aria-label="Tìm kiếm thiệp"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#A33149]/30 focus:border-[#A33149]"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          Đang tải danh sách thiệp...
        </div>
      ) : (
        <RecentCardsTable
          cards={cards}
          onEdit={handleEdit}
          onPreview={handlePreview}
          onPublish={handlePublish}
          onArchive={handleArchive}
        />
      )}
    </div>
  );
};
