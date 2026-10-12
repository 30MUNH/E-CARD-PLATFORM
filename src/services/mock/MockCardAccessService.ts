import {
  DEFAULT_ECARD_CONFIG,
  DEFAULT_THEME_CUSTOMIZATION,
  verifyPinInput,
} from '../../data/ecardData';
import { EcardConfig, PinVerificationResult, PublicCardMetadata } from '../../types/ecard';
import { CardAccessService } from '../CardAccessService';
import { MockCardRepository } from './MockCardRepository';

/**
 * Isolated development mock for recipient card access and PIN verification.
 * In production, OpenAI Codex replaces this service with an HTTP adapter
 * that performs server-side PIN verification and only returns private card
 * content after authorization.
 */
export class MockCardAccessService implements CardAccessService {
  public readonly isMockMode = true;

  constructor(private readonly repository: MockCardRepository) {}

  async getPublicMetadata(uuidOrSlug: string): Promise<PublicCardMetadata> {
    const card = this.repository.getCardSync(uuidOrSlug) || DEFAULT_ECARD_CONFIG;
    return {
      id: card.ecardData.id,
      title: card.title,
      templateId: card.ecardData.template_id,
      hasPin: card.ecardData.has_pin,
      status: card.status,
      welcomeConfig: card.welcomeConfig || {
        heading: 'Món quà bí mật',
        subheading: 'Dành tặng người đặc biệt',
        buttonLabel: 'Bắt đầu',
        backgroundImage: '/template/background-welcome.png',
      },
      pinScreenConfig: card.pinScreenConfig || {
        heading: 'Mở khóa kỷ niệm',
        subheading: 'Bất ngờ cho cậu nà 😜',
        backgroundImage: '/template/background-template.jpg',
      },
      themeCustomization: card.themeCustomization || DEFAULT_THEME_CUSTOMIZATION,
    };
  }

  async verifyPin(uuidOrSlug: string, pin: string): Promise<PinVerificationResult> {
    const card = this.repository.getCardSync(uuidOrSlug) || DEFAULT_ECARD_CONFIG;

    if (!/^\d{4}$/.test(pin)) {
      return {
        authorized: false,
        errorMessage: 'Sai mã PIN',
        isMockMode: true,
      };
    }

    // Development mock check: validates against the reference E2E test checksum
    // without imposing any attempt counter, lockout, or cooldown delay.
    const isValid = verifyPinInput(pin);

    if (!isValid) {
      return {
        authorized: false,
        errorMessage: 'Sai mã PIN',
        isMockMode: true,
      };
    }

    return {
      authorized: true,
      accessToken: `mock-session-${card.ecardData.id}`,
      cardContent: card,
      isMockMode: true,
    };
  }

  async getAuthorizedCardContent(uuidOrSlug: string): Promise<EcardConfig> {
    const card = this.repository.getCardSync(uuidOrSlug);
    return card || structuredClone(DEFAULT_ECARD_CONFIG);
  }
}
