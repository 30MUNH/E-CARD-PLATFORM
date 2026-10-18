import { MediaAsset, MediaUploadValidation } from '../../types/ecard.js';
import { MediaService, UploadMediaCategory } from '../MediaService.js';
import { ApiClient, ApiClientOptions } from './http.js';

const MIME_TYPES: Record<UploadMediaCategory, string[]> = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  pdf: ['application/pdf'],
};
const MAX_BYTES: Record<UploadMediaCategory, number> = {
  image: 10 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  pdf: 50 * 1024 * 1024,
};

export class HttpMediaService implements MediaService {
  readonly isMockMode = false;
  private readonly api: ApiClient;

  constructor(options: ApiClientOptions) {
    this.api = new ApiClient(options);
  }

  validateFile(file: File, category: UploadMediaCategory): MediaUploadValidation {
    const extensions: Record<UploadMediaCategory, RegExp> = {
      image: /\.(jpe?g|png|webp|gif)$/i,
      audio: /\.(mp3|wav|m4a|ogg)$/i,
      video: /\.(mp4|webm|mov)$/i,
      pdf: /\.pdf$/i,
    };
    const extension = extensions[category];
    if (!MIME_TYPES[category].includes(file.type.toLowerCase()) && !extension.test(file.name)) {
      return { valid: false, error: `Định dạng tệp "${file.name}" không hợp lệ cho mục ${category}.` };
    }
    if (file.size < 1 || file.size > MAX_BYTES[category]) {
      return { valid: false, error: `Kích thước tệp "${file.name}" vượt quá giới hạn.` };
    }
    return { valid: true };
  }

  async uploadMedia(file: File, category: UploadMediaCategory, cardId?: string): Promise<MediaAsset> {
    const validation = this.validateFile(file, category);
    if (!validation.valid) throw new Error(validation.error || 'Tệp tải lên không hợp lệ');
    if (!cardId) throw new Error('CARD_REQUIRED: Lưu bản nháp trước khi tải media lên');
    const form = new FormData();
    form.append('file', file);
    form.append('mediaType', category);
    form.append('cardId', cardId);
    return this.api.request<MediaAsset>('/api/admin/media', { method: 'POST', body: form }, 'admin');
  }

  async deleteMedia(id: string): Promise<void> {
    await this.api.request(`/api/admin/media/${encodeURIComponent(id)}`, { method: 'DELETE' }, 'admin');
  }
}
