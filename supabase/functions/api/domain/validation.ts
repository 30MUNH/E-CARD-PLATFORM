import { ValidationResult } from './errors.js';

const WRITE_ONLY_KEYS = new Set(['newPin', 'confirmPin', 'pin', 'pinHash', 'pin_hash']);

export function validateDraftPayload(payload: unknown): ValidationResult {
  const details: Record<string, string> = {};

  if (!payload || typeof payload !== 'object') {
    return { valid: false, details: { payload: 'Payload must be an object' } };
  }

  const candidate = payload as Record<string, unknown>;
  if (typeof candidate.title !== 'string' || candidate.title.trim().length === 0) {
    details.title = 'Title is required';
  }

  if (!Array.isArray(candidate.albumData)) {
    details.albumData = 'albumData must be an array';
  }

  return Object.keys(details).length > 0 ? { valid: false, details } : { valid: true };
}

export function stripWriteOnlyFields<T>(value: T): T {
  return strip(value) as T;
}

function strip(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(strip);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const result: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    if (!WRITE_ONLY_KEYS.has(key)) {
      result[key] = strip(nested);
    }
  }
  return result;
}
