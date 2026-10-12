import React, { useState } from 'react';
import toast from 'react-hot-toast';
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  Music,
  Trash2,
  UploadCloud,
  Video,
} from 'lucide-react';
import { resolveImageUrl } from '../../data/ecardData';
import { getMediaService } from '../../services';
import { useEditor } from '../context/EditorContext';

export const MediaUploadSection: React.FC = () => {
  const { draft, updateDraft } = useEditor();
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAlbumFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    const mediaService = getMediaService();
    const uploadedItems: Array<{ id: string; url: string; name: string; sizeBytes: number }> = [];

    for (const file of Array.from(files)) {
      const check = mediaService.validateFile(file, 'image');
      if (!check.valid) {
        setUploadError(check.error || 'Tệp ảnh không hợp lệ');
        toast.error(check.error || 'Tệp ảnh không hợp lệ');
        continue;
      }
      const asset = await mediaService.uploadMedia(file, 'image');
      uploadedItems.push({
        id: asset.id,
        url: asset.url,
        name: asset.filename,
        sizeBytes: asset.sizeBytes,
      });
    }

    if (uploadedItems.length > 0) {
      updateDraft((prev) => ({
        ...prev,
        albumData: [
          ...prev.albumData,
          ...uploadedItems.map((item, idx) => ({
            id: item.id,
            ecard_id: 'draft',
            image_url: item.url,
            caption: `Kỷ niệm mới #${prev.albumData.length + idx + 1} 💖`,
            order: prev.albumData.length + idx,
          })),
        ],
      }));
      const totalKb = Math.round(
        uploadedItems.reduce((acc, i) => acc + i.sizeBytes, 0) / 1024
      );
      setUploadFeedback(
        `Đã thêm ${uploadedItems.length} ảnh (${totalKb} KB) — Bản xem trước cục bộ (Blob URL).`
      );
      toast.success(`Đã tải lên ${uploadedItems.length} ảnh`);
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
    const asset = await mediaService.uploadMedia(file, 'image');
    updateDraft((prev) => {
      if (target === 'music_cover') {
        const currentMusic = prev.musicData[0] || {
          id: 'music-1',
          ecard_id: 'draft',
          youtube_id: 'JgTZvDbaTtg',
          title: 'Một Đời',
          artist: 'Duni',
          quote: 'Love you to the saturn and back',
          created_at: new Date().toISOString(),
          updated_at: null,
          image_url: asset.url,
          caption: null,
          is_deleted: false,
          deleted_at: null,
        };
        return {
          ...prev,
          musicData: [{ ...currentMusic, image_url: asset.url }],
        };
      }
      return {
        ...prev,
        homepageData: {
          ...prev.homepageData,
          [target]: asset.url,
        },
      };
    });
    toast.success(`Đã cập nhật ảnh (${file.name})`);
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
    const asset = await mediaService.uploadMedia(file, 'audio');
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
    setUploadFeedback(
      `Đã đính kèm bản thu âm "${file.name}" (${Math.round(file.size / 1024)} KB).`
    );
    toast.success('Đã tải lên bản thu âm');
  };

  const moveAlbumPhoto = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= draft.albumData.length) return;
    updateDraft((prev) => {
      const next = [...prev.albumData];
      const [moved] = next.splice(index, 1);
      next.splice(targetIdx, 0, moved);
      return {
        ...prev,
        albumData: next.map((item, idx) => ({ ...item, order: idx })),
      };
    });
  };

  const removeAlbumPhoto = (index: number) => {
    updateDraft((prev) => ({
      ...prev,
      albumData: prev.albumData.filter((_, i) => i !== index),
    }));
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

      {/* Album Multi-Image Upload & Ordering */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Album Ảnh Kỷ Niệm ({draft.albumData.length} ảnh)
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Hỗ trợ tải lên nhiều ảnh cùng lúc (JPG, PNG, WebP tối đa 10 MB/ảnh). Sắp xếp thứ tự hiển thị hoặc xóa ảnh.
            </p>
          </div>

          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#A33149] hover:bg-[#8e283e] text-white text-sm font-semibold shadow-sm transition self-start">
            <UploadCloud className="w-4 h-4" />
            <span>Tải thêm ảnh lên</span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              aria-label="Tải ảnh lên album"
              className="hidden"
              onChange={(e) => void handleAlbumFilesSelected(e.target.files)}
            />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {draft.albumData.map((item, idx) => (
            <div
              key={item.id || idx}
              className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 flex flex-col gap-2.5"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-200">
                <img
                  src={resolveImageUrl(item.image_url)}
                  alt={item.caption || `Ảnh ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/75 text-white text-xs font-semibold">
                  #{idx + 1}
                </span>
              </div>

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
                placeholder="Nhập chú thích cho bức ảnh..."
                aria-label={`Chú thích ảnh ${idx + 1}`}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#A33149]"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => moveAlbumPhoto(idx, -1)}
                    aria-label={`Di chuyển ảnh ${idx + 1} lên`}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    title="Đưa lên trước"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === draft.albumData.length - 1}
                    onClick={() => moveAlbumPhoto(idx, 1)}
                    aria-label={`Di chuyển ảnh ${idx + 1} xuống`}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40"
                    title="Đưa xuống sau"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => removeAlbumPhoto(idx)}
                  aria-label={`Xóa ảnh ${idx + 1}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Audio / Music Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-[#A33149]" />
          <h2 className="text-lg font-bold text-slate-900">Âm nhạc &amp; Bản thu âm lời nhắn</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên bài hát / Bản thu âm
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
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mã YouTube Video ID (hoặc tải file MP3 bên dưới)
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
                Tải tệp âm thanh MP3 / WAV / M4A (Tối đa 25 MB)
              </div>
              <p className="text-xs text-slate-500">
                Bản thu âm sẽ hiển thị trình phát trực tiếp trên trang Nhạc và Lá thư.
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
