export function getApiBaseUrl(): string {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
  if (env.VITE_ECARD_API_BASE_URL) {
    return env.VITE_ECARD_API_BASE_URL.replace(/\/api\/?$/, '');
  }
  if (env.VITE_SUPABASE_URL) return `${env.VITE_SUPABASE_URL.replace(/\/$/, '')}/functions/v1`;
  return '';
}

export function isApiMode(): boolean {
  const env = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env || {};
  return env.VITE_ECARD_BACKEND_MODE === 'api' || (!env.DEV && env.VITE_ECARD_BACKEND_MODE !== 'mock');
}
