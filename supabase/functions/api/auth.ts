import { HttpError } from './http.js';
import type { AdminPrincipal, ApiDeps, RecipientSession } from './repository.js';

export async function requireAdmin(
  request: Request,
  deps: ApiDeps
): Promise<AdminPrincipal> {
  const principal = await deps.admin.authenticate(request);
  if (!principal) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Admin session is missing or expired');
  }
  if (principal.role !== 'admin') {
    throw new HttpError(403, 'FORBIDDEN', 'Administrator role is required');
  }
  return principal;
}

export function readBearerToken(request: Request): string | null {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice('Bearer '.length).trim();
  return token || null;
}

export async function requireRecipientSession(
  request: Request,
  cardId: string,
  deps: ApiDeps
): Promise<RecipientSession> {
  const token = readBearerToken(request);
  if (!token) {
    throw new HttpError(401, 'UNAUTHORIZED', 'Recipient session is missing or expired');
  }

  const session = await deps.public.resolveSession(token);
  if (!session || session.cardId !== cardId || session.expiresAt <= Date.now()) {
    throw new HttpError(403, 'UNAUTHORIZED', 'Recipient session is invalid for this card');
  }
  return session;
}
