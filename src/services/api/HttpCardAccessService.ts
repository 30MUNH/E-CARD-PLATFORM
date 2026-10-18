import { EcardConfig, PinVerificationResult, PublicCardMetadata } from '../../types/ecard.js';
import { CardAccessService } from '../CardAccessService.js';
import { ApiClient, ApiClientOptions, HttpApiError } from './http.js';
import { clearRecipientAccessToken, getRecipientAccessToken, setRecipientAccessToken } from './auth.js';

export class HttpCardAccessService implements CardAccessService {
  readonly isMockMode = false;
  private readonly api: ApiClient;
  private readonly options: ApiClientOptions;

  constructor(options: ApiClientOptions) {
    this.options = options;
    this.api = new ApiClient({
      ...options,
      getRecipientToken: options.getRecipientToken || getRecipientAccessToken,
    });
  }

  getPublicMetadata(uuidOrSlug: string): Promise<PublicCardMetadata> {
    return this.api.request<PublicCardMetadata>(`/api/public/cards/${encodeURIComponent(uuidOrSlug)}/metadata`);
  }

  async verifyPin(uuidOrSlug: string, pin: string): Promise<PinVerificationResult> {
    try {
      const result = await this.api.request<PinVerificationResult>(
        `/api/public/cards/${encodeURIComponent(uuidOrSlug)}/verify-pin`,
        { method: 'POST', body: JSON.stringify({ pin }) }
      );
      if (result.accessToken) setRecipientAccessToken(uuidOrSlug, result.accessToken);
      return { ...result, isMockMode: false };
    } catch (error) {
      if (error instanceof HttpApiError && error.code === 'INVALID_PIN') {
        return { authorized: false, errorMessage: error.message, isMockMode: false };
      }
      if (error instanceof HttpApiError && ['CARD_NOT_FOUND', 'CARD_NOT_PUBLISHED'].includes(error.code)) {
        clearRecipientAccessToken(uuidOrSlug);
        return {
          authorized: false,
          unavailable: true,
          errorMessage: 'Thiệp hiện không khả dụng. Liên kết có thể không còn hiệu lực.',
          isMockMode: false,
        };
      }
      throw error;
    }
  }

  getAuthorizedCardContent(uuidOrSlug: string, accessToken?: string): Promise<EcardConfig> {
    const api = accessToken
      ? new ApiClient({
          baseUrl: this.options.baseUrl,
          fetchImpl: this.options.fetchImpl,
          getRecipientToken: () => accessToken,
        })
      : this.api;
    return api.request<EcardConfig>(
      `/api/public/cards/${encodeURIComponent(uuidOrSlug)}/content`,
      {},
      { recipientScope: uuidOrSlug }
    ).then((content) => content);
  }

  async refreshAuthorizedCardContent(uuidOrSlug: string): Promise<EcardConfig> {
    try {
      return await this.api.request<EcardConfig>(
        `/api/public/cards/${encodeURIComponent(uuidOrSlug)}/content`,
        {},
        { recipientScope: uuidOrSlug }
      );
    } catch (error) {
      if (error instanceof HttpApiError && (error.status === 401 || error.status === 403)) {
        clearRecipientAccessToken(uuidOrSlug);
      }
      throw error;
    }
  }
}
