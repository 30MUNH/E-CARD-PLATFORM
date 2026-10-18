import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { Archive, CalendarDays, CheckCircle2, Copy, ExternalLink, FileText, Image, LockKeyhole, Music2, Play, Send, X } from 'lucide-react';
import { EcardConfig, SlideId } from '../../types/ecard';

interface CardDetailsDialogProps {
  card: EcardConfig;
  onClose: () => void;
  onEdit: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onArchive: () => void;
}

const SLIDE_LABELS: Record<SlideId, string> = {
  homepage: 'Trang chủ', album: 'Album ảnh', music: 'Âm nhạc', voice: 'Ghi âm',
  letter: 'Thư', timeline: 'Dòng thời gian', game: 'Trò chơi', video: 'Video', setting: 'Cài đặt',
};

const dateTime = (value?: string) => {
  if (!value) return 'Chưa cập nhật';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Chưa cập nhật' : date.toLocaleString('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });
};

export const CardDetailsDialog: React.FC<CardDetailsDialogProps> = ({ card, onClose, onEdit, onPreview, onPublish, onArchive }) => {
  const publicPath = card.publicUrl || (card.publicSlug ? `/ecd/game/${card.publicSlug}` : `/ecd/game/${card.ecardData.id}`);
  const publicUrl = new URL(publicPath, window.location.origin).href;
  const enabledSlides = Object.entries(card.slideVisibility ?? {})
    .filter(([, visible]) => visible)
    .map(([id]) => SLIDE_LABELS[id as SlideId] ?? id);
  const assets = [
    { label: 'Ảnh trong album', value: `${card.albumData?.length ?? 0} ảnh`, icon: Image },
    { label: 'Sách ảnh PDF', value: card.albumPdf ? `${card.albumPdf.filename} · ${formatBytes(card.albumPdf.sizeBytes)}` : 'Chưa tải lên', icon: FileText },
    { label: 'Nhạc', value: `${card.musicData?.length ?? 0} bài`, icon: Music2 },
    { label: 'Ghi âm', value: card.hasVoice || card.letterData?.audio_url ? 'Đã có ghi âm' : 'Chưa có ghi âm', icon: Play },
    { label: 'Video', value: card.hasVideo || card.videoData?.video_url ? 'Đã thêm video' : 'Chưa có video', icon: Play },
  ];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast.success('Đã sao chép đường dẫn thiệp');
    } catch {
      toast.error('Không thể sao chép đường dẫn');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-[2px] sm:items-center sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="card-details-title" className="flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${card.status === 'published' ? 'bg-emerald-50 text-emerald-700' : card.status === 'draft' ? 'bg-amber-50 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
                {card.status === 'published' ? 'Đã xuất bản' : card.status === 'draft' ? 'Bản nháp' : 'Đã lưu trữ'}
              </span>
              {card.ecardData.has_pin && <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-[#8e283e]"><LockKeyhole className="h-3.5 w-3.5" aria-hidden="true" />Có mã PIN</span>}
            </div>
            <h2 id="card-details-title" className="truncate text-xl font-bold text-slate-900">{card.title || 'Chi tiết thiệp'}</h2>
            <p className="mt-1 text-sm text-slate-500">{card.ecardData.male_name} &amp; {card.ecardData.female_name}</p>
          </div>
          <button type="button" onClick={onClose} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A33149]/40" aria-label="Đóng chi tiết thiệp">
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
          <section aria-labelledby="public-link-heading">
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 id="public-link-heading" className="text-sm font-semibold text-slate-800">Đường dẫn khách hàng</h3>
              <a href={publicUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-[#A33149] hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A33149]/40">
                Mở thiệp <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2">
              <code className="min-w-0 flex-1 break-all px-2 text-xs leading-5 text-slate-700">{publicUrl}</code>
              <button type="button" onClick={() => void copyLink()} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A33149]/40">
                <Copy className="h-3.5 w-3.5" aria-hidden="true" /> Sao chép
              </button>
            </div>
          </section>

          <div className="grid gap-6 sm:grid-cols-2">
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Thông tin thiệp</h3>
              <dl className="space-y-3 rounded-xl border border-slate-100 bg-white p-4">
                <Detail label="Mẫu giao diện" value={card.ecardData.template_id} />
                <Detail label="Ngày kỷ niệm" value={card.ecardData.love_start_date || 'Chưa thiết lập'} />
                <Detail label="Ngày tạo" value={dateTime(card.createdAt)} />
                <Detail label="Cập nhật gần nhất" value={dateTime(card.updatedAt)} />
                {card.description && <Detail label="Mô tả" value={card.description} />}
                {card.ecardData.owner_name && <Detail label="Tên chủ thiệp" value={card.ecardData.owner_name} />}
                {card.ecardData.owner_phone && <Detail label="Điện thoại" value={card.ecardData.owner_phone} />}
                {card.ecardData.owner_addr && <Detail label="Địa chỉ" value={card.ecardData.owner_addr} />}
                {card.ecardData.owner_maps && <Detail label="Bản đồ" value={card.ecardData.owner_maps} />}
              </dl>
            </section>
            <section>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">Nội dung &amp; tài nguyên</h3>
              <ul className="space-y-2">
                {assets.map(({ label, value, icon: Icon }) => (
                  <li key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-500"><Icon className="h-4 w-4" aria-hidden="true" /></span>
                    <div className="min-w-0"><p className="text-xs text-slate-500">{label}</p><p className="truncate text-sm font-medium text-slate-800">{value}</p></div>
                  </li>
                ))}
              </ul>
              <div className="mt-2 rounded-xl border border-slate-100 px-3.5 py-3">
                <p className="text-xs text-slate-500">Nội dung bổ sung</p>
                <p className="mt-1 text-sm text-slate-800">{card.letterData?.love_letters?.length ?? 0} đoạn thư · {card.specialDates?.length ?? 0} mốc kỷ niệm · {card.wishboxData?.length ?? 0} lời chúc</p>
              </div>
            </section>
          </div>

          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Các trang trong thiệp</h3>
            <div className="flex flex-wrap gap-2">
              {(enabledSlides.length ? enabledSlides : ['Chưa thiết lập']).map((slide) => (
                <span key={slide} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">{slide}</span>
              ))}
            </div>
          </section>
          <section>
            <h3 className="mb-3 text-sm font-semibold text-slate-800">Thiết kế &amp; nội dung</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Màn hình mở đầu</p>
                <dl className="space-y-2">
                  <Detail label="Tiêu đề" value={card.welcomeConfig?.heading || 'Mặc định'} />
                  <Detail label="Lời chào" value={card.welcomeConfig?.subheading || 'Mặc định'} />
                  <Detail label="Nút mở thiệp" value={card.welcomeConfig?.buttonLabel || 'Mặc định'} />
                  <Detail label="Dòng giới thiệu" value={card.homepageData?.tagline || 'Chưa thêm'} />
                  <Detail label="Ảnh nền mở đầu" value={card.welcomeConfig?.backgroundImage ? 'Đã thiết lập' : 'Chưa thiết lập'} />
                  <Detail label="Ảnh bìa trang chủ" value={card.homepageData?.homepage_image ? 'Đã tải lên' : 'Chưa tải lên'} />
                </dl>
              </div>
              <div className="rounded-xl border border-slate-100 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Cài đặt &amp; bảo mật</p>
                <dl className="space-y-2">
                  <Detail label="Màn hình nhập PIN" value={card.pinScreenConfig?.heading || (card.ecardData.has_pin ? 'Đã bật' : 'Không sử dụng')} />
                  <Detail label="Hiệu ứng trái tim" value={card.themeCustomization?.enableFloatingHearts ? 'Bật' : 'Tắt'} />
                  <Detail label="Hiệu ứng âm thanh" value={card.themeCustomization?.enableSoundEffects ? 'Bật' : 'Tắt'} />
                  <Detail label="Màu chủ đạo" value={card.themeCustomization?.primaryColor || 'Mặc định'} />
                  <Detail label="Màu nhấn" value={card.themeCustomization?.accentColor || 'Mặc định'} />
                  <Detail label="Màu nền" value={card.themeCustomization?.backgroundTint || 'Mặc định'} />
                </dl>
              </div>
            </div>
          </section>
          {(card.albumData?.length > 0 || card.musicData?.length > 0 || card.specialDates?.length) ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {card.albumData?.length > 0 && (
                <section className="rounded-xl border border-slate-100 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-800">Ảnh trong album</h3>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {card.albumData.map((photo, index) => <li key={photo.id} className="truncate">{index + 1}. {photo.caption || 'Ảnh không có chú thích'}</li>)}
                  </ul>
                </section>
              )}
              {card.musicData?.length > 0 && (
                <section className="rounded-xl border border-slate-100 p-4">
                  <h3 className="mb-2 text-sm font-semibold text-slate-800">Danh sách nhạc</h3>
                  <ul className="space-y-1.5 text-sm text-slate-600">
                    {card.musicData.map((track) => <li key={track.id} className="truncate">{track.title}{track.artist ? ` — ${track.artist}` : ''}</li>)}
                  </ul>
                </section>
              )}
              {card.specialDates?.length ? (
                <section className="rounded-xl border border-slate-100 p-4 sm:col-span-2">
                  <h3 className="mb-2 text-sm font-semibold text-slate-800">Các mốc kỷ niệm</h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {card.specialDates.map((milestone) => <li key={milestone.id} className="rounded-lg bg-slate-50 px-3 py-2 text-sm"><span className="font-medium text-slate-800">{milestone.title}</span><span className="ml-2 text-slate-500">{milestone.date}</span>{milestone.description && <p className="mt-1 text-xs text-slate-500">{milestone.description}</p>}</li>)}
                  </ul>
                </section>
              ) : null}
            </div>
          ) : null}
          <p className="flex items-start gap-2 text-xs leading-5 text-slate-500"><CalendarDays className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" /> PIN chỉ hiển thị trạng thái bảo vệ; mã PIN không được hiển thị trong khu vực quản trị này.</p>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7">
          <div className="flex flex-wrap gap-2">
            {card.status !== 'published' && <button type="button" onClick={onPublish} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3.5 text-xs font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"><Send className="h-3.5 w-3.5" aria-hidden="true" />Xuất bản</button>}
            {card.status !== 'archived' && <button type="button" onClick={onArchive} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"><Archive className="h-3.5 w-3.5" aria-hidden="true" />Lưu trữ</button>}
          </div>
          <div className="ml-auto flex gap-2">
            <button type="button" onClick={onPreview} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A33149]/40"><Play className="h-3.5 w-3.5" aria-hidden="true" />Xem trước</button>
            <button type="button" onClick={onEdit} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#A33149] px-3.5 text-xs font-semibold text-white hover:bg-[#8e283e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A33149]/50 focus-visible:ring-offset-2"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />Chỉnh sửa</button>
          </div>
        </footer>
      </section>
    </div>
  );
};

const Detail: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-3 text-sm">
    <dt className="shrink-0 text-slate-500">{label}</dt>
    <dd className="min-w-0 break-words text-right font-medium text-slate-800">{value}</dd>
  </div>
);

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return 'Dung lượng chưa rõ';
  return bytes < 1024 * 1024 ? `${Math.ceil(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
