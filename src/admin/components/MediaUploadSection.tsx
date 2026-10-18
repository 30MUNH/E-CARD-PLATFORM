import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  ImagePlus,
  Music,
  Trash2,
  UploadCloud,
  Video,
} from 'lucide-react';
import { resolveImageUrl } from '../../data/ecardData';
import { getMediaService } from '../../services';
import { PdfAssetDescriptor } from '../../types/ecard';

const PdfFlipbook = React.lazy(() =>
  import('../../components/PdfFlipbook').then((module) => ({ default: module.PdfFlipbook }))
);
import { useEditor } from '../context/EditorContext';

export const MediaUploadSection: React.FC = () => {
  const { draft, updateDraft, editingCardId } = useEditor();
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isPdfUploading, setIsPdfUploading] = useState(false);

  const handlePdfFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    const mediaService = getMediaService();
    const validation = mediaService.validateFile(file, 'pdf');
    if (!validation.valid) {
      const message = validation.error || 'Vui lòng chọn tệp PDF hợp lệ.';
      setUploadError(message);
      toast.error(message);
      return;
    }

    if (!mediaService.isMockMode && (!editingCardId || editingCardId === 'new')) {
      const message = 'Hãy lưu bản nháp trước khi tải ảnh, ghi âm hoặc PDF lên.';
      setUploadError(message);
      toast.error(message);
      return;
    }

    setIsPdfUploading(true);
    setUploadFeedback(null);
    try {
      const uploaded = await mediaService.uploadMedia(file, 'pdf', editingCardId || undefined);
      const descriptor: PdfAssetDescriptor = {
        id: uploaded.id,
        url: uploaded.url,
        filename: uploaded.filename,
        mimeType: 'application/pdf',
        sizeBytes: uploaded.sizeBytes,
        isLocalPreview: uploaded.isLocalPreview,
      };
      const replacedAsset = draft.albumPdf;
      updateDraft((prev) => ({ ...prev, albumPdf: descriptor }));
      if (replacedAsset?.isLocalPreview) {
        await mediaService.deleteMedia(replacedAsset.id);
      }
      const sizeMb = (uploaded.sizeBytes / (1024 * 1024)).toFixed(1);
      const message = uploaded.isLocalPreview
        ? `Đã tải ${uploaded.filename} (${sizeMb} MB). Bản xem trước cục bộ; link khách hàng cần kho lưu trữ backend.`
        : `Đã tải ${uploaded.filename} (${sizeMb} MB).`;
      setUploadFeedback(message);
      toast.success('Đã cập nhật sách PDF');
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Không thể tải PDF lên.';
      setUploadError(message);
      toast.error(message);
    } finally {
      setIsPdfUploading(false);
    }
  };

  const removePdf = async () => {
    const currentAsset = draft.albumPdf;
    updateDraft((prev) => ({ ...prev, albumPdf: null }));
    setUploadFeedback(null);
    if (currentAsset?.isLocalPreview) {
      await getMediaService().deleteMedia(currentAsset.id);
    }
  };

  const handleSingleImageUpload = async (
    file: File | undefined,
    target: 'homepage_image' | 'avatar_female' | 'avatar_male' | 'music_cover'
  ) => {
    if (!file) return;
    const mediaService = getMediaService();
    const check = mediaService.validateFile(file, 'image');
    if (!check.valid) {
      setUploadError(check.error || 'Tệp ảnh không hợp lệ');
      toast.error(check.error || 'Tệp ảnh không hợp lệ');
      return;
    }
    if (!mediaService.isMockMode && (!editingCardId || editingCardId === 'new')) {
      const message = 'Hãy lưu bản nháp trước khi tải ảnh lên.';
      setUploadError(message);
      toast.error(message);
      return;
    }
    try {
      const asset = await mediaService.uploadMedia(file, 'image', editingCardId || undefined);
      updateDraft((prev) => {
        if (target === 'music_cover') {
          const currentMusic = prev.musicData[0] || {
            id: 'music-1',
            ecard_id: 'draft',
            youtube_id: 'JgTZvDbaTtg',
            title: 'Một Đời',
            artist: 'SONG HÀNH KÝ',
            quote: 'Love you to the saturn and back',
            created_at: new Date().toISOString(),
            updated_at: null,
            image_url: asset.url,
            caption: null,
            is_deleted: false,
            deleted_at: null,
          };
          return { ...prev, musicData: [{ ...currentMusic, image_url: asset.url }] };
        }
        return { ...prev, homepageData: { ...prev.homepageData, [target]: asset.url } };
      });
      toast.success(`Đã cập nhật ảnh (${file.name})`);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Không thể tải ảnh lên.';
      setUploadError(message);
      toast.error(message);
    }
  };

  const handleAudioFileUpload = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    const mediaService = getMediaService();
    const check = mediaService.validateFile(file, 'audio');
    if (!check.valid) {
      setUploadError(check.error || 'Tệp âm thanh không hợp lệ');
      toast.error(check.error || 'Tệp âm thanh không hợp lệ');
      return;
    }
    if (!mediaService.isMockMode && (!editingCardId || editingCardId === 'new')) {
      const message = 'Hãy lưu bản nháp trước khi tải ghi âm lên.';
      setUploadError(message);
      toast.error(message);
      return;
    }
    try {
      const asset = await mediaService.uploadMedia(file, 'audio', editingCardId || undefined);
      updateDraft((prev) => {
      const firstMusic = prev.musicData[0] || {
        id: 'music-1',
        ecard_id: 'draft',
        youtube_id: '',
        title: file.name.replace(/\.[^.]+$/, ''),
        artist: prev.senderName,
        quote: 'Love you to the saturn and back',
        created_at: new Date().toISOString(),
        updated_at: null,
        image_url: prev.homepageData.homepage_image,
        caption: null,
        is_deleted: false,
        deleted_at: null,
      };
      return {
        ...prev,
        hasVoice: true,
        musicData: [
          {
            ...firstMusic,
            audio_url: asset.url,
            title: firstMusic.title || file.name.replace(/\.[^.]+$/, ''),
          },
        ],
        letterData: {
          ...prev.letterData,
          audio_url: asset.url,
        },
      };
      });
      setUploadFeedback(`Đã đính kèm bản thu âm "${file.name}" (${Math.round(file.size / 1024)} KB).`);
      toast.success('Đã tải lên bản thu âm');
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Không thể tải ghi âm lên.';
      setUploadError(message);
      toast.error(message);
    }
  };

  const musicItem = draft.musicData[0];

  return (
    <div className="space-y-6">
      {/* Feedback Banners */}
      {uploadFeedback && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-medium text-emerald-800">
          {uploadFeedback}
        </div>
      )}
      {uploadError && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-xs font-medium text-rose-700">
          {uploadError}
        </div>
      )}

      {/* Couple Avatars & Hero Image */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ảnh đại diện &amp; Ảnh bìa Trang chủ</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Tải lên ảnh đại diện của hai người và bức ảnh chính hiển thị trên khung Polaroid trang chủ.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <img
              src={resolveImageUrl(draft.homepageData.avatar_female)}
              alt="Avatar người gửi"
              className="w-20 h-20 rounded-full object-cover border-2 border-rose-200"
            />
            <div className="text-xs font-semibold text-slate-700">
              Avatar {draft.senderName || 'Người gửi'}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition">
              <ImagePlus className="w-3.5 h-3.5" />
              <span>Đổi ảnh</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  void handleSingleImageUpload(e.target.files?.[0], 'avatar_female')
                }
              />
            </label>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <img
              src={resolveImageUrl(draft.homepageData.avatar_male)}
              alt="Avatar người nhận"
              className="w-20 h-20 rounded-full object-cover border-2 border-rose-200"
            />
            <div className="text-xs font-semibold text-slate-700">
              Avatar {draft.recipientName || 'Người nhận'}
            </div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition">
              <ImagePlus className="w-3.5 h-3.5" />
              <span>Đổi ảnh</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  void handleSingleImageUpload(e.target.files?.[0], 'avatar_male')
                }
              />
            </label>
          </div>

          <div className="border border-slate-200 rounded-xl p-4 flex flex-col items-center text-center gap-2">
            <img
              src={resolveImageUrl(draft.homepageData.homepage_image)}
              alt="Ảnh chính trang chủ"
              className="w-20 h-20 rounded-xl object-cover border border-slate-200"
            />
            <div className="text-xs font-semibold text-slate-700">Ảnh lớn Trang chủ</div>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition">
              <ImagePlus className="w-3.5 h-3.5" />
              <span>Đổi ảnh</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  void handleSingleImageUpload(e.target.files?.[0], 'homepage_image')
                }
              />
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Sách lật PDF</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Tải một tệp PDF tối đa 50 MB. Tệp được lưu trên kho riêng tư và khách hàng xem dưới dạng sách lật.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A33149] hover:bg-[#8e283e] text-white text-sm font-semibold shadow-sm transition self-start">
              <UploadCloud className="w-4 h-4" />
              <span>{isPdfUploading ? 'Đang tải PDF…' : draft.albumPdf ? 'Thay PDF' : 'Tải PDF lên'}</span>
              <input
                type="file"
                accept="application/pdf,.pdf"
                aria-label="Tải sách PDF lên"
                className="hidden"
                disabled={isPdfUploading}
                onChange={(event) => {
                  void handlePdfFileSelected(event.target.files?.[0]);
                  event.target.value = '';
                }}
              />
            </label>
            {draft.albumPdf && (
              <button
                type="button"
                onClick={() => void removePdf()}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-rose-200 text-rose-700 text-sm font-semibold hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>

        {draft.albumPdf && (
          <div className="flex items-center gap-3 rounded-xl border border-rose-100 bg-rose-50/60 px-4 py-3">
            <FileText className="w-5 h-5 shrink-0 text-[#8c5261]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{draft.albumPdf.filename}</p>
              <p className="text-xs text-slate-500">{(draft.albumPdf.sizeBytes / (1024 * 1024)).toFixed(1)} MB</p>
            </div>
            {draft.albumPdf.isLocalPreview && (
              <span className="shrink-0 rounded-md bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-800">
                Xem trước cục bộ
              </span>
            )}
          </div>
        )}

        <React.Suspense
          fallback={<div className="h-[25rem] rounded-xl bg-rose-50/60 animate-pulse" aria-label="Đang tải trình xem PDF" />}
        >
          <PdfFlipbook asset={draft.albumPdf} mode="preview" />
        </React.Suspense>
      </div>

      {/* Audio / Voice Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-[#A33149]" />
          <h2 className="text-lg font-bold text-slate-900">Voice — Đoạn ghi âm từ khách hàng</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề Voice / Bản thu âm
            </label>
            <input
              type="text"
              value={musicItem?.title || ''}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  musicData: prev.musicData.map((m, i) =>
                    i === 0 ? { ...m, title: e.target.value } : m
                  ),
                }))
              }
              placeholder="Ví dụ: Lời nhắn yêu thương / Một Đời"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã YouTube Video ID (Tùy chọn nếu không tải MP3)
            </label>
            <input
              type="text"
              value={musicItem?.youtube_id || ''}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  musicData: prev.musicData.map((m, i) =>
                    i === 0 ? { ...m, youtube_id: e.target.value } : m
                  ),
                }))
              }
              placeholder="Ví dụ: JgTZvDbaTtg"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-slate-800">
                Tải tệp ghi âm của khách hàng (MP3 / WAV / M4A)
              </div>
              <p className="text-xs text-slate-500">
                Đoạn ghi âm sẽ hiển thị và phát trực tiếp trên tab Voice và biểu tượng loa ở Lá thư.
              </p>
              {musicItem?.audio_url && (
                <audio controls src={musicItem.audio_url} className="mt-2 h-9 w-full max-w-md" />
              )}
            </div>

            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 shrink-0">
              <UploadCloud className="w-4 h-4 text-[#A33149]" />
              <span>Chọn tệp âm thanh</span>
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => void handleAudioFileUpload(e.target.files?.[0])}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Optional Video Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Video className="w-5 h-5 text-[#A33149]" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">Video Kỷ Niệm (Tùy chọn)</h2>
              <p className="text-xs text-slate-500">
                Bật mục này nếu khách hàng cung cấp thêm video kỷ niệm.
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={draft.hasVideo}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  hasVideo: e.target.checked,
                  slideVisibility: {
                    ...prev.slideVisibility,
                    video: e.target.checked,
                  },
                }))
              }
              className="w-4 h-4 rounded text-[#A33149]"
            />
            <span>Hiển thị trang Video</span>
          </label>
        </div>

        {draft.hasVideo && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Đường dẫn Video (MP4 URL)
            </label>
            <input
              type="url"
              value={draft.videoData.video_url || ''}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  videoData: { video_url: e.target.value || null },
                }))
              }
              placeholder="https://example.com/memory-video.mp4"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};
