import { requireAdmin, requireRecipientSession } from './auth.js';
import { errorResponse, dataResponse, HttpError, readJson, withCors } from './http.js';
import type { ApiDeps } from './repository.js';
import {
  allowlistPublicMetadata,
  sanitizeResponse,
  validatePinInput,
  validatePublishVersion,
} from './validation.js';

export function createApiRouter(deps: ApiDeps, configuredOrigins: readonly string[] | string) {
  const allowedOrigins =
    typeof configuredOrigins === 'string' ? [configuredOrigins] : [...configuredOrigins];
  return async function handle(request: Request): Promise<Response> {
    try {
      if (request.method === 'OPTIONS') {
        const requestOrigin = request.headers.get('origin');
        if (requestOrigin && !allowedOrigins.includes(requestOrigin)) {
          return withCors(new Response(null, { status: 403 }), requestOrigin, allowedOrigins);
        }
        return withCors(new Response(null, { status: 204 }), requestOrigin, allowedOrigins);
      }

      const url = new URL(request.url);
      const segments = url.pathname.split('/').filter(Boolean);
      const apiIndex = segments.indexOf('api');
      const route = apiIndex >= 0 ? segments.slice(apiIndex + 1) : segments;

      if (route[0] === 'admin') {
        const principal = await requireAdmin(request, deps);
        const response = await handleAdmin(request, route.slice(1), url, principal, deps);
        return withCors(response, request.headers.get('origin'), allowedOrigins);
      }

      if (route[0] === 'public' && route[1] === 'cards') {
        const response = await handlePublic(request, route.slice(2), deps);
        return withCors(response, request.headers.get('origin'), allowedOrigins);
      }

      throw new HttpError(404, 'CARD_NOT_FOUND', 'Route not found');
    } catch (error) {
      const httpError =
        error instanceof HttpError
          ? error
          : new HttpError(500, 'INTERNAL_ERROR', 'Unexpected backend error');
      return withCors(errorResponse(httpError), request.headers.get('origin'), allowedOrigins);
    }
  };
}

async function handleAdmin(
  request: Request,
  route: string[],
  url: URL,
  principal: NonNullable<Awaited<ReturnType<ApiDeps['admin']['authenticate']>>>,
  deps: ApiDeps
): Promise<Response> {
  if (route[0] === 'media' && route.length === 1 && request.method === 'POST') {
    if (!deps.media) throw new HttpError(503, 'MEDIA_UNAVAILABLE', 'Media storage is unavailable');
    return dataResponse(await deps.media.upload(request, principal), 201);
  }

  if (route[0] === 'media' && route.length === 2 && request.method === 'DELETE') {
    if (!deps.media) throw new HttpError(503, 'MEDIA_UNAVAILABLE', 'Media storage is unavailable');
    await deps.media.delete(route[1], principal);
    return new Response(null, { status: 204 });
  }

  if (route[0] === 'templates' && request.method === 'GET') {
    return dataResponse(await deps.cards.templates(principal));
  }

  if (route[0] === 'cards' && route.length === 1 && request.method === 'GET') {
    return dataResponse(
      await deps.cards.list(
        {
          status: url.searchParams.get('status') || undefined,
          search: url.searchParams.get('search') || undefined,
        },
        principal
      )
    );
  }

  if (route[0] === 'cards' && route.length === 1 && request.method === 'POST') {
    return dataResponse(
      sanitizeResponse(await deps.cards.create(await readJson(request), principal)),
      201
    );
  }

  if (route[0] !== 'cards' || !route[1]) {
    throw new HttpError(404, 'CARD_NOT_FOUND', 'Admin route not found');
  }

  const cardId = route[1];
  if (route.length === 3 && route[2] === 'published' && request.method === 'GET') {
    const published = await deps.cards.getPublished(cardId, principal);
    if (!published) throw new HttpError(404, 'CARD_NOT_FOUND', 'Published card not found');
    return dataResponse(sanitizeResponse(published));
  }

  if (route.length === 2 && request.method === 'GET') {
    const card = await deps.cards.get(cardId, principal);
    if (!card) throw new HttpError(404, 'CARD_NOT_FOUND', 'Card not found');
    return dataResponse(sanitizeResponse(card));
  }

  if (route.length === 2 && request.method === 'PUT') {
    return dataResponse(
      sanitizeResponse(await deps.cards.update(cardId, await readJson(request), principal))
    );
  }

  if (route[2] === 'draft' && request.method === 'PATCH') {
    return dataResponse(
      sanitizeResponse(await deps.cards.saveDraft(cardId, await readJson(request), principal))
    );
  }

  if (route[2] === 'publish' && request.method === 'POST') {
    const body = await readJson(request);
    return dataResponse(
      await deps.cards.publish(cardId, validatePublishVersion(body.draftVersion), principal)
    );
  }

  if (route[2] === 'archive' && request.method === 'POST') {
    return dataResponse(await deps.cards.archive(cardId, principal));
  }

  throw new HttpError(404, 'CARD_NOT_FOUND', 'Admin route not found');
}

async function handlePublic(request: Request, route: string[], deps: ApiDeps): Promise<Response> {
  const slug = route[0];
  const action = route[1];
  if (!slug) throw new HttpError(404, 'CARD_NOT_FOUND', 'Card not found');

  const metadata = await deps.public.metadata(slug);
  if (!metadata) throw new HttpError(404, 'CARD_NOT_FOUND', 'Card not found');
  const safeMetadata = allowlistPublicMetadata(metadata);
  if (safeMetadata.status !== 'published') {
    throw new HttpError(403, 'CARD_NOT_PUBLISHED', 'Card is not published');
  }

  if (action === 'metadata' && request.method === 'GET') {
    return dataResponse(safeMetadata);
  }

  if (action === 'verify-pin' && request.method === 'POST') {
    const body = await readJson(request);
    const pin = validatePinInput(body.pin);
    const verified = await deps.public.verifyPin(slug, pin);
    if (!verified) throw new HttpError(401, 'INVALID_PIN', 'Sai mã PIN');
    const session = await deps.public.createSession(verified.cardId);
    return dataResponse({ authorized: true, accessToken: session.token, isMockMode: false });
  }

  if (action === 'content' && request.method === 'GET') {
    await requireRecipientSession(request, String(safeMetadata.id), deps);
    const content = await deps.public.content(slug);
    if (!content) throw new HttpError(404, 'CARD_NOT_FOUND', 'Card content not found');
    return dataResponse(sanitizeResponse(content));
  }

  throw new HttpError(404, 'CARD_NOT_FOUND', 'Public route not found');
}
