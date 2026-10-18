import type { EcardConfig } from '../../types/ecard.js';

export interface RecipientMediaRefreshCallbacks {
  refresh: () => Promise<EcardConfig>;
  onRefresh: (config: EcardConfig) => void;
  onSessionExpired: () => void;
  onCardUnavailable: () => void;
  onFailure: () => void;
}

/** Coalesces lazy refreshes triggered by failed private signed media requests. */
export class RecipientMediaRefreshCoordinator {
  private readonly attemptedUrls = new Set<string>();
  private inFlight: Promise<void> | null = null;

  constructor(private readonly callbacks: RecipientMediaRefreshCallbacks) {}

  refreshForFailedUrl(url: string): Promise<void> {
    if (!isPrivateSignedMediaUrl(url) || this.attemptedUrls.has(url)) return Promise.resolve();
    this.attemptedUrls.add(url);
    if (this.inFlight) return this.inFlight;

    this.inFlight = this.callbacks.refresh()
      .then((config) => this.callbacks.onRefresh(config))
      .catch((error: unknown) => {
        const status = typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status: unknown }).status)
          : 0;
        const code = typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code: unknown }).code)
          : '';
        if (code === 'CARD_NOT_FOUND' || code === 'CARD_NOT_PUBLISHED' || status === 404) {
          this.callbacks.onCardUnavailable();
        } else if (status === 401 || status === 403) this.callbacks.onSessionExpired();
        else this.callbacks.onFailure();
      })
      .finally(() => {
        this.inFlight = null;
      });
    return this.inFlight;
  }
}

export function isPrivateSignedMediaUrl(value: string): boolean {
  try {
    const url = new URL(value, 'https://relative.invalid');
    return url.pathname.includes('/storage/v1/object/sign/');
  } catch {
    return false;
  }
}
