import { DomainError } from './errors.js';

export interface OwnedMediaAsset {
  id: string;
  storagePath: string;
  ownerId: string;
}

export function normalizeMediaReferences<T>(value: T, assets: OwnedMediaAsset[]): T {
  return visit(value, assets) as T;
}

function visit(value: unknown, assets: OwnedMediaAsset[]): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => visit(item, assets));
  }

  if (!value || typeof value !== 'object') {
    if (typeof value !== 'string') return value;
    return normalizeUrl(value, assets);
  }

  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    result[key] = visit(nested, assets);
  }
  return result;
}

function normalizeUrl(value: string, assets: OwnedMediaAsset[]): string {
  if (value.startsWith('media://')) {
    const id = value.slice('media://'.length);
    if (!assets.some((asset) => asset.id === id)) {
      throw new DomainError('MEDIA_NOT_OWNED', 'media reference is not owned by the actor');
    }
    return value;
  }

  if (!value.includes('/storage/v1/object/')) {
    return value;
  }

  let pathname: string;
  try {
    pathname = decodeURIComponent(new URL(value).pathname);
  } catch {
    throw new DomainError('MEDIA_NOT_OWNED', 'media reference is not owned by the actor');
  }

  const asset = assets.find((candidate) => pathname.endsWith(`/${candidate.storagePath}`));
  if (!asset) {
    throw new DomainError('MEDIA_NOT_OWNED', 'media reference is not owned by the actor');
  }
  return `media://${asset.id}`;
}
