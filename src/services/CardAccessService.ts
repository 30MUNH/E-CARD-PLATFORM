import { EcardConfig, PinVerificationResult, PublicCardMetadata } from '../types/ecard';

export interface CardAccessService {
  /** Whether PIN verification and card retrieval are running in frontend mock mode */
  readonly isMockMode: boolean;

  /**
   * Fetch non-sensitive public metadata needed to render the Welcome & PIN screens.
   * Must not include private photos, letters, or couple names when hasPin is true.
   */
  getPublicMetadata(uuidOrSlug: string): Promise<PublicCardMetadata>;

  /**
   * Verify a 4-digit PIN against the server (or development mock).
   * Product requirement: No UI attempt limit, lockout, or forced cooldown.
   */
  verifyPin(uuidOrSlug: string, pin: string): Promise<PinVerificationResult>;

  /**
   * Retrieve the full authorized E-Card configuration after unlocking (or immediately if hasPin is false).
   */
  getAuthorizedCardContent(uuidOrSlug: string, accessToken?: string): Promise<EcardConfig>;
}
