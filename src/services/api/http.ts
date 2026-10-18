import { ApiError } from '../../types/ecard.js';

export interface ApiClientOptions {
  baseUrl: string;
  anonKey?: string;
  getAdminToken?: () => string | null;
  getRecipientToken?: (scope: string) => string | null;
  fetchImpl?: typeof fetch;
}

export class HttpApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: Record<string, string>;

  constructor(status: number, body: Partial<ApiError> & { error?: string }) {
    super(body.error || 'Backend request failed');
    this.name = 'HttpApiError';
    this.status = status;
    this.code = body.code || 'INTERNAL_ERROR';
    this.details = body.details;
  }
}

export class ApiClient {
  private readonly fetchImpl: typeof fetch;

  constructor(private readonly options: ApiClientOptions) {
    this.fetchImpl = options.fetchImpl || fetch.bind(globalThis);
  }

  async request<T>(
    path: string,
    init: RequestInit = {},
    auth: 'admin' | { recipientScope: string } | undefined = undefined
  ): Promise<T> {
    const headers = new Headers(init.headers);
    if (this.options.anonKey) headers.set('apikey', this.options.anonKey);
    if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
      headers.set('content-type', 'application/json');
    }
    const token = auth === 'admin'
      ? this.options.getAdminToken?.()
      : auth && 'recipientScope' in auth
        ? this.options.getRecipientToken?.(auth.recipientScope)
        : null;
    if (token) headers.set('authorization', `Bearer ${token}`);

    const response = await this.fetchImpl(joinUrl(this.options.baseUrl, path), {
      ...init,
      headers,
    });
    const body = await readResponseBody(response);
    if (!response.ok) {
      throw new HttpApiError(response.status, body || { error: response.statusText });
    }
    return (body && 'data' in body ? body.data : body) as T;
  }
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
}

async function readResponseBody(response: Response): Promise<any> {
  if (response.status === 204) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { error: text, code: 'INTERNAL_ERROR' };
  }
}
