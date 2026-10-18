import { MediaAsset, MediaUploadValidation } from '../../types/ecard';
import { MediaService, UploadMediaCategory } from '../MediaService';

const ALLOWED_MIME_TYPES: Record<UploadMediaCategory, string[]> = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  pdf: ['application/pdf'],
};

const MAX_SIZE_BYTES: Record<UploadMediaCategory, number> = {
  image: 10 * 1024 * 1024, // 10 MB
  audio: 25 * 1024 * 1024, // 25 MB
  video: 50 * 1024 * 1024, // 50 MB
  pdf: 100 * 1024 * 1024, // 100 MB
};

export class MockMediaService implements MediaService {
  public readonly isMockMode = true;
  private assets = new Map<string, MediaAsset>();

  validateFile(file: File, category: UploadMediaCategory): MediaUploadValidation {
    const allowedMimes = ALLOWED_MIME_TYPES[category];
    const maxBytes = MAX_SIZE_BYTES[category];

    const mimeType = file.type.toLowerCase();
    const mimeMatch =
      category === 'pdf'
        ? /\.pdf$/i.test(file.name) && (!mimeType || mimeType === 'application/pdf')
        : allowedMimes.includes(mimeType) ||
          (category === 'image' && /\.(jpe?g|png|webp|gif)$/i.test(file.name)) ||
          (category === 'audio' && /\.(mp3|wav|m4a|ogg)$/i.test(file.name)) ||
          (category === 'video' && /\.(mp4|webm|mov)$/i.test(file.name));

    if (!mimeMatch) {
      return {
        valid: false,
        error: `Định dạng tệp "${file.name}" không hợp lệ cho mục ${category}.`,
      };
    }

    if (file.size > maxBytes) {
      const maxMb = Math.round(maxBytes / (1024 * 1024));
      const fileMb = (file.size / (1024 * 1024)).toFixed(1);
      return {
        valid: false,
        error: `Kích thước tệp "${file.name}" (${fileMb} MB) vượt quá giới hạn ${maxMb} MB.`,
      };
    }

    return { valid: true };
  }

  async uploadMedia(file: File, category: UploadMediaCategory, _cardId?: string): Promise<MediaAsset> {
    const validation = this.validateFile(file, category);
    if (!validation.valid) {
      throw new Error(validation.error || 'Tệp tải lên không hợp lệ');
    }

    const id = `media-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const blobUrl = URL.createObjectURL(file);

    const asset: MediaAsset = {
      id,
      url: blobUrl,
      filename: file.name,
      mimeType:
        file.type || (category === 'pdf' ? 'application/pdf' : `${category}/octet-stream`),
      mediaType: category,
      sizeBytes: file.size,
      createdAt: new Date().toISOString(),
      isLocalPreview: true,
    };

    this.assets.set(id, asset);
    return asset;
  }

  async deleteMedia(id: string): Promise<void> {
    const asset = this.assets.get(id);
    if (asset && asset.url.startsWith('blob:')) {
      URL.revokeObjectURL(asset.url);
    }
    this.assets.delete(id);
  }
}
