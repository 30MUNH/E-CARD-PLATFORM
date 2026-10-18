export class HttpError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, string>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, string>
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function dataResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ data }), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}

export function errorResponse(error: HttpError): Response {
  return new Response(
    JSON.stringify({
      error: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    }),
    {
      status: error.status,
      headers: { 'content-type': 'application/json; charset=utf-8' },
    }
  );
}

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const value = await request.json();
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('object required');
    }
    return value as Record<string, unknown>;
  } catch {
    throw new HttpError(422, 'VALIDATION_ERROR', 'Request body must be a JSON object');
  }
}

function validateOrigin(origin: string): string {
  try {
    const parsed = new URL(origin);
    const loopbackHosts = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
    const isLoopback = loopbackHosts.has(parsed.hostname);
    if (
      parsed.origin !== origin ||
      parsed.username ||
      parsed.password ||
      parsed.hostname.includes('*') ||
      parsed.pathname !== '/' ||
      parsed.search ||
      parsed.hash ||
      (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && isLoopback))
    ) {
      throw new Error();
    }
    return origin;
  } catch {
    throw new Error('Frontend origin configuration must contain valid exact origins');
  }
}

export function validateFrontendOrigins(
  origins: string | undefined,
  legacyOrigin?: string | undefined
): string[] {
  const configured = origins === undefined ? legacyOrigin : origins;
  if (configured === undefined) {
    throw new Error('FRONTEND_ORIGINS or FRONTEND_ORIGIN must contain a valid exact origin');
  }
  const entries = configured.split(',').map((origin) => origin.trim());
  if (entries.length === 0 || entries.some((origin) => origin.length === 0 || origin === '*')) {
    throw new Error('Frontend origin configuration must contain valid exact origins');
  }
  return [...new Set(entries.map(validateOrigin))];
}

export function withCors(
  response: Response,
  requestOrigin: string | null,
  allowedOrigins: readonly string[]
): Response {
  const headers = new Headers(response.headers);
  headers.append('vary', 'Origin');
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    headers.set('access-control-allow-origin', requestOrigin);
    headers.set('access-control-allow-headers', 'authorization, apikey, content-type');
    headers.set('access-control-allow-methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  }
  return new Response(response.body, { status: response.status, headers });
}
