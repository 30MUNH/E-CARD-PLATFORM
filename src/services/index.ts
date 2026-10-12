import { CardAccessService } from './CardAccessService';
import { CardRepository } from './CardRepository';
import { MediaService } from './MediaService';
import { MockCardAccessService } from './mock/MockCardAccessService';
import { MockCardRepository } from './mock/MockCardRepository';
import { MockMediaService } from './mock/MockMediaService';

export type { CardAccessService } from './CardAccessService';
export type { CardFilterOptions, CardRepository } from './CardRepository';
export type { MediaService, UploadMediaCategory } from './MediaService';

// Shared singleton mock instances so Admin edits immediately reflect in Recipient/Preview routes
const mockCardRepository = new MockCardRepository();
const mockMediaService = new MockMediaService();
const mockCardAccessService = new MockCardAccessService(mockCardRepository);

export function getCardRepository(): CardRepository {
  return mockCardRepository;
}

export function getMediaService(): MediaService {
  return mockMediaService;
}

export function getCardAccessService(): CardAccessService {
  return mockCardAccessService;
}
