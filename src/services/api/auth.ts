const ADMIN_TOKEN_KEY = 'ecard.admin.access_token';
const RECIPIENT_TOKEN_PREFIX = 'ecard.recipient.session.';

function storage(): Storage | null {
  return typeof sessionStorage === 'undefined' ? null : sessionStorage;
}

export function getAuthBaseUrl(value: string): string {
  const parsed = new URL(value);
  const localHttp = parsed.protocol === 'http:' &&
    (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1');
  if (parsed.protocol !== 'https:' && !localHttp) {
    throw new Error('Auth requires HTTPS outside local development.');
  }
  return parsed.toString().replace(/\/$/, '');
}

export function getAdminAccessToken(): string | null {
  return storage()?.getItem(ADMIN_TOKEN_KEY) || null;
}

export function setAdminAccessToken(token: string): void {
  storage()?.setItem(ADMIN_TOKEN_KEY, token);
}

export function clearAdminAccessToken(): void {
  storage()?.removeItem(ADMIN_TOKEN_KEY);
}

export function getRecipientAccessToken(slug: string): string | null {
  return storage()?.getItem(`${RECIPIENT_TOKEN_PREFIX}${slug}`) || null;
}

export function setRecipientAccessToken(slug: string, token: string): void {
  storage()?.setItem(`${RECIPIENT_TOKEN_PREFIX}${slug}`, token);
}

export function clearRecipientAccessToken(slug: string): void {
  storage()?.removeItem(`${RECIPIENT_TOKEN_PREFIX}${slug}`);
}

export async function signInAdmin(email: string, password: string, config?: {
  url: string;
  anonKey: string;
  apiBaseUrl: string;
  fetchImpl?: typeof fetch;
}): Promise<string> {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
  const supabaseUrl = config?.url || env.VITE_SUPABASE_URL;
  const anonKey = config?.anonKey || env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
  const apiBaseUrl = config?.apiBaseUrl || (env.VITE_ECARD_API_BASE_URL
    ? env.VITE_ECARD_API_BASE_URL.replace(/\/api\/?$/, '')
    : supabaseUrl ? `${supabaseUrl.replace(/\/$/, '')}/functions/v1` : '');
  if (!supabaseUrl || !anonKey || !apiBaseUrl) {
    throw new Error('Supabase Auth is not configured for API mode');
  }
  const fetcher = config?.fetchImpl || fetch;
  const response = await fetcher(
    `${getAuthBaseUrl(supabaseUrl)}/auth/v1/token?grant_type=password`,
    {
      method: 'POST',
      headers: {
        apikey: anonKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    }
  );
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body.access_token) {
    throw new Error('Đăng nhập thất bại');
  }
  let authorization: Response;
  try {
    authorization = await fetcher(`${apiBaseUrl.replace(/\/$/, '')}/api/admin/cards`, {
      headers: { apikey: anonKey, authorization: `Bearer ${body.access_token}` },
    });
  } catch {
    throw new Error('Không thể xác minh quyền truy cập quản trị. Vui lòng thử lại.');
  }
  if (!authorization.ok) {
    throw new Error(authorization.status === 401 || authorization.status === 403
      ? 'Tài khoản chưa được kích hoạt cho quyền quản trị.'
      : 'Không thể xác minh quyền truy cập quản trị. Vui lòng thử lại.');
  }
  setAdminAccessToken(body.access_token);
  return body.access_token;
}
