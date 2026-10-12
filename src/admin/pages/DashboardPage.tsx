import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Archive,
  CheckCircle2,
  FileEdit,
  FolderHeart,
  Layers,
  PlusCircle,
} from 'lucide-react';
import { getCardRepository } from '../../services';
import { CardSummary } from '../../types/ecard';
import { useEditor } from '../context/EditorContext';
import { StatCard } from '../components/StatCard';
import { RecentCardsTable } from '../components/RecentCardsTable';

export const DashboardPage: React.FC = () => {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { initializeFromCard } = useEditor();

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getCardRepository().listCards();
      setCards(list);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Không thể tải danh sách thiệp');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  const totalCount = cards.length;
  const publishedCount = cards.filter((c) => c.status === 'published').length;
  const draftCount = cards.filter((c) => c.status === 'draft').length;
  const archivedCount = cards.filter((c) => c.status === 'archived').length;

  const handleEdit = (cardId: string) => {
    navigate(`/admin/cards/${cardId}/edit`);
  };

  const handlePreview = async (cardId: string) => {
    try {
      const fullCard = await getCardRepository().getCard(cardId);
      initializeFromCard(fullCard);
      navigate(`/admin/cards/${cardId}/preview`);
    } catch {
      toast.error('Không thể tải dữ liệu thiệp để xem trước');
    }
  };

  const handlePublish = async (cardId: string) => {
    try {
      const res = await getCardRepository().publishCard(cardId);
      toast.success(res.message, { duration: 4500 });
      await loadCards();
    } catch {
      toast.error('Không thể xuất bản thiệp');
    }
  };

  const handleArchive = async (cardId: string) => {
    try {
      await getCardRepository().archiveCard(cardId);
      toast.success('Đã chuyển thiệp vào mục Lưu trữ (Chế độ Demo)');
      await loadCards();
    } catch {
      toast.error('Không thể lưu trữ thiệp');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Tổng quan Hệ thống E-Card
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Quản lý, thiết kế và xem trước các thiệp kỹ thuật số cá nhân hóa cho khách hàng By.Duni.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/cards"
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-700 transition"
          >
            Xem tất cả thiệp
          </Link>
          <Link
            to="/admin/cards/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A33149] hover:bg-[#8e283e] text-white text-sm font-semibold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tạo Thiệp E-Card Mới</span>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Tổng số thiệp"
          value={totalCount}
          subtitle="Tất cả thiệp trong hệ thống"
          icon={<FolderHeart className="w-5 h-5 text-[#A33149]" />}
          accentClassName="bg-rose-50"
        />
        <StatCard
          label="Đã xuất bản"
          value={publishedCount}
          subtitle="Sẵn sàng chia sẻ qua NFC / QR"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          accentClassName="bg-emerald-50"
        />
        <StatCard
          label="Bản nháp"
          value={draftCount}
          subtitle="Đang biên tập nội dung"
          icon={<FileEdit className="w-5 h-5 text-amber-600" />}
          accentClassName="bg-amber-50"
        />
        <StatCard
          label="Đã lưu trữ"
          value={archivedCount}
          subtitle="Đã ẩn khỏi truy cập công khai"
          icon={<Archive className="w-5 h-5 text-slate-600" />}
          accentClassName="bg-slate-100"
        />
      </div>

      {/* Quick Action Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#A33149] uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Quy trình chuẩn hóa</span>
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Tạo trải nghiệm E-Card cá nhân hóa cho khách hàng mới
          </h2>
          <p className="text-sm text-slate-600">
            Nhập thông tin cặp đôi, tải lên bộ ảnh kỷ niệm, biên tập bức thư tay, thiết lập mã PIN 4 số và kiểm tra trực tiếp trên Mobile, Tablet, Desktop.
          </p>
        </div>
        <Link
          to="/admin/cards/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#A33149] hover:bg-[#8e283e] text-white text-sm font-semibold shrink-0 transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Bắt đầu tạo thiệp</span>
        </Link>
      </div>

      {/* Recently Created Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Thiệp tạo &amp; cập nhật gần đây</h2>
          <Link
            to="/admin/cards"
            className="text-sm font-semibold text-[#A33149] hover:underline"
          >
            Quản lý toàn bộ →
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            Đang tải dữ liệu thiệp...
          </div>
        ) : (
          <RecentCardsTable
            cards={cards.slice(0, 5)}
            onEdit={handleEdit}
            onPreview={handlePreview}
            onPublish={handlePublish}
            onArchive={handleArchive}
          />
        )}
      </div>
    </div>
  );
};
