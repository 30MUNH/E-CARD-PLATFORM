import {
  CardSummary,
  EcardConfig,
  PublishCardResult,
  SaveCardDraftPayload,
  TemplateDefinition,
} from '../../types/ecard.js';
import { CardRepository, CardFilterOptions } from '../CardRepository.js';
import { ApiClient, ApiClientOptions } from './http.js';

export class HttpCardRepository implements CardRepository {
  readonly isMockMode = false;
  private readonly api: ApiClient;
  private readonly draftVersions = new Map<string, number>();

  constructor(options: ApiClientOptions) {
    this.api = new ApiClient(options);
  }

  listCards(filter?: CardFilterOptions): Promise<CardSummary[]> {
    const query = new URLSearchParams();
    if (filter?.status) query.set('status', filter.status);
    if (filter?.search) query.set('search', filter.search);
    return this.api.request<CardSummary[]>(`/api/admin/cards${query.size ? `?${query}` : ''}`, {}, 'admin');
  }

  async getCard(id: string): Promise<EcardConfig> {
    const card = await this.api.request<EcardConfig>(`/api/admin/cards/${encodeURIComponent(id)}`, {}, 'admin');
    this.rememberVersion(id, card);
    return card;
  }

  getPublishedCard(id: string): Promise<EcardConfig | null> {
    return this.api.request<EcardConfig | null>(
      `/api/admin/cards/${encodeURIComponent(id)}/published`,
      {},
      'admin'
    );
  }

  async createCard(payload: SaveCardDraftPayload): Promise<EcardConfig> {
    const card = await this.api.request<EcardConfig>('/api/admin/cards', jsonInit(payload), 'admin');
    this.rememberVersion(card.ecardData.id, card);
    return card;
  }

  async updateCard(id: string, payload: Partial<SaveCardDraftPayload>): Promise<EcardConfig> {
    const body = { ...payload, ...this.versionBody(id, payload) };
    const card = await this.api.request<EcardConfig>(`/api/admin/cards/${encodeURIComponent(id)}`, {
      ...jsonInit(body),
      method: 'PUT',
    }, 'admin');
    this.rememberVersion(id, card);
    return card;
  }

  async saveDraft(id: string, payload: SaveCardDraftPayload): Promise<EcardConfig> {
    const body = { ...payload, ...this.versionBody(id, payload) };
    const card = await this.api.request<EcardConfig>(`/api/admin/cards/${encodeURIComponent(id)}/draft`, {
      ...jsonInit(body),
      method: 'PATCH',
    }, 'admin');
    this.rememberVersion(id, card);
    return card;
  }

  async publishCard(id: string): Promise<PublishCardResult> {
    const body = this.draftVersions.has(id) ? { draftVersion: this.draftVersions.get(id) } : undefined;
    const result = await this.api.request<PublishCardResult>(`/api/admin/cards/${encodeURIComponent(id)}/publish`, {
      method: 'POST',
      ...(body ? jsonInit(body) : {}),
    }, 'admin');
    this.draftVersions.delete(id);
    return result;
  }

  archiveCard(id: string): Promise<CardSummary> {
    return this.api.request<CardSummary>(`/api/admin/cards/${encodeURIComponent(id)}/archive`, { method: 'POST' }, 'admin');
  }

  listTemplates(): Promise<TemplateDefinition[]> {
    return this.api.request<TemplateDefinition[]>('/api/admin/templates', {}, 'admin');
  }

  private versionBody(id: string, payload: Partial<SaveCardDraftPayload>) {
    const explicit = (payload as Partial<SaveCardDraftPayload> & { baseVersion?: number }).baseVersion;
    const version = explicit ?? this.draftVersions.get(id);
    return version === undefined ? {} : { baseVersion: version };
  }

  private rememberVersion(id: string, card: EcardConfig) {
    const version = (card as EcardConfig & { draftVersion?: number }).draftVersion;
    if (typeof version === 'number') this.draftVersions.set(id, version);
  }
}

function jsonInit(body: unknown): RequestInit {
  return { method: 'POST', body: JSON.stringify(body) };
}
