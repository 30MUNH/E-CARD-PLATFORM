import { CardAccessService } from './CardAccessService';
import { CardRepository } from './CardRepository';
import { MediaService } from './MediaService';
import { MockCardAccessService } from './mock/MockCardAccessService';
import { MockCardRepository } from './mock/MockCardRepository';
import { MockMediaService } from './mock/MockMediaService';
import { HttpCardAccessService } from './api/HttpCardAccessService';
import { HttpCardRepository } from './api/HttpCardRepository';
import { HttpMediaService } from './api/HttpMediaService';
import { isApiMode, getApiBaseUrl } from './api/config';
import { getAdminAccessToken, getRecipientAccessToken } from './api/auth';

export type { CardAccessService } from './CardAccessService';
export type { CardFilterOptions, CardRepository } from './CardRepository';
export type { MediaService, UploadMediaCategory } from './MediaService';

// Shared singleton mock instances so Admin edits immediately reflect in Recipient/Preview routes
const mockCardRepository = new MockCardRepository();
const mockMediaService = new MockMediaService();
const mockCardAccessService = new MockCardAccessService(mockCardRepository);
const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
const publicKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';
const apiOptions = {
  baseUrl: getApiBaseUrl(),
  anonKey: publicKey,
  getAdminToken: getAdminAccessToken,
  getRecipientToken: getRecipientAccessToken,
};
const apiCardRepository = new HttpCardRepository(apiOptions);
const apiMediaService = new HttpMediaService(apiOptions);
const apiCardAccessService = new HttpCardAccessService(apiOptions);

export function getCardRepository(): CardRepository {
  return isApiMode() ? apiCardRepository : mockCardRepository;
}

export function getMediaService(): MediaService {
  return isApiMode() ? apiMediaService : mockMediaService;
}

export function getCardAccessService(): CardAccessService {
  return isApiMode() ? apiCardAccessService : mockCardAccessService;
}
