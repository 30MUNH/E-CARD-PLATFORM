import {
  CardSummary,
  EcardConfig,
  EcardStatus,
  PublishCardResult,
  SaveCardDraftPayload,
  TemplateDefinition,
} from '../types/ecard';

export interface CardFilterOptions {
  status?: EcardStatus | 'all';
  search?: string;
}

export interface CardRepository {
  /** Whether this repository is backed by local demo mocks rather than a live backend */
  readonly isMockMode: boolean;

  /** Retrieve summary list of all cards for the Admin Dashboard and Card Management list */
  listCards(filter?: CardFilterOptions): Promise<CardSummary[]>;

  /** Retrieve full E-Card configuration by ID for editing or previewing */
  getCard(id: string): Promise<EcardConfig>;

  /** Create a new E-Card record (starts in 'draft' status) */
  createCard(payload: SaveCardDraftPayload): Promise<EcardConfig>;

  /** Update an existing E-Card configuration */
  updateCard(id: string, payload: Partial<SaveCardDraftPayload>): Promise<EcardConfig>;

  /** Save draft changes for an existing E-Card */
  saveDraft(id: string, payload: SaveCardDraftPayload): Promise<EcardConfig>;

  /**
   * Request card publication.
   * Note: In mock mode, returns integrationPending: true and does not generate a fake live URL.
   */
  publishCard(id: string): Promise<PublishCardResult>;

  /** Archive an E-Card so it is no longer publicly accessible */
  archiveCard(id: string): Promise<CardSummary>;

  /** List available visual templates supported by the platform */
  listTemplates(): Promise<TemplateDefinition[]>;
}
