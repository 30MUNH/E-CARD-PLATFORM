import { isValidPin, stripWriteOnlyFields } from './domain/index.js';
import { HttpError } from './http.js';

export function validatePublishVersion(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new HttpError(422, 'VALIDATION_ERROR', 'draftVersion must be a positive integer');
  }
  return value;
}

export function validatePinInput(value: unknown): string {
  if (!isValidPin(value)) {
    throw new HttpError(422, 'VALIDATION_ERROR', 'PIN must contain exactly four numeric digits');
  }
  return value;
}

export function sanitizeResponse<T>(value: T): T {
  return stripWriteOnlyFields(value);
}

export function allowlistPublicMetadata(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new HttpError(500, 'INTERNAL_ERROR', 'Public metadata is malformed');
  }

  const input = value as Record<string, unknown>;
  return {
    id: input.id,
    title: input.title,
    templateId: input.templateId,
    hasPin: input.hasPin,
    status: input.status,
    welcomeConfig: input.welcomeConfig,
    pinScreenConfig: input.pinScreenConfig,
    themeCustomization: input.themeCustomization,
  };
}
