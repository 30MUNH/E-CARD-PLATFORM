import { MediaAsset, MediaUploadValidation } from '../types/ecard';

export type UploadMediaCategory = 'image' | 'audio' | 'video' | 'pdf';

export interface MediaService {
  /** Whether media uploads use local blob URLs (mock) instead of remote cloud storage */
  readonly isMockMode: boolean;

  /** Validate file MIME type and size before uploading */
  validateFile(file: File, category: UploadMediaCategory): MediaUploadValidation;

  /** Upload an image, audio, video, or PDF and return its MediaAsset descriptor */
  uploadMedia(file: File, category: UploadMediaCategory, cardId?: string): Promise<MediaAsset>;

  /** Delete an uploaded media asset */
  deleteMedia(id: string): Promise<void>;
}
