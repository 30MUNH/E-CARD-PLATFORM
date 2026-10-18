export type MediaCategory = 'image' | 'audio' | 'video' | 'pdf';

export const MEDIA_LIMITS: Record<MediaCategory, number> = {
  image: 10 * 1024 * 1024,
  audio: 25 * 1024 * 1024,
  video: 50 * 1024 * 1024,
  pdf: 50 * 1024 * 1024,
};
export const MAX_MEDIA_UPLOAD_REQUEST_BYTES = MEDIA_LIMITS.pdf + 1024 * 1024;

const MEDIA_MIME_TYPES: Record<MediaCategory, string[]> = {
  image: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/mp4', 'audio/ogg'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  pdf: ['application/pdf'],
};
const MEDIA_EXTENSION_MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  ogg: 'audio/ogg',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  pdf: 'application/pdf',
};

export class MediaError extends Error {
  public readonly code: 'MEDIA_TOO_LARGE' | 'UNSUPPORTED_MEDIA_TYPE' | 'MEDIA_NOT_FOUND';

  constructor(
    code: 'MEDIA_TOO_LARGE' | 'UNSUPPORTED_MEDIA_TYPE' | 'MEDIA_NOT_FOUND',
    message: string
  ) {
    super(message);
    this.name = 'MediaError';
    this.code = code;
  }
}

export interface MediaUploadMetadata {
  name: string;
  type: string;
  size: number;
}

export interface MediaValidationResult {
  valid: boolean;
  code?: 'MEDIA_TOO_LARGE' | 'UNSUPPORTED_MEDIA_TYPE';
  error?: string;
  mimeType?: string;
}

export function validateMediaUpload(
  file: MediaUploadMetadata,
  category: MediaCategory
): MediaValidationResult {
  if (!Number.isFinite(file.size) || file.size < 1 || file.size > MEDIA_LIMITS[category]) {
    return {
      valid: false,
      code: 'MEDIA_TOO_LARGE',
      error: `The ${category} file exceeds its size limit`,
    };
  }

  const mime = String(file.type || '').toLowerCase();
  const name = String(file.name || '');
  const extensionPattern = {
    image: /\.(jpe?g|png|webp|gif)$/i,
    audio: /\.(mp3|wav|m4a|ogg)$/i,
    video: /\.(mp4|webm|mov)$/i,
    pdf: /\.pdf$/i,
  }[category];

  if (!MEDIA_MIME_TYPES[category].includes(mime) && !extensionPattern.test(name)) {
    return {
      valid: false,
      code: 'UNSUPPORTED_MEDIA_TYPE',
      error: `Unsupported ${category} media type`,
    };
  }

  return { valid: true };
}

export async function validateMediaFile(
  file: File,
  category: MediaCategory
): Promise<MediaValidationResult> {
  const metadataValidation = validateMediaUpload(
    { name: file.name, type: file.type, size: file.size },
    category
  );
  if (!metadataValidation.valid) return metadataValidation;

  const bytes = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const actualMime = detectMediaMime(bytes);
  const declaredMime = normalizeMime(file.type);
  const allowedMimes = MEDIA_MIME_TYPES[category].map(normalizeMime);
  const extension = file.name.match(/\.([^.]+)$/)?.[1];
  const extensionPattern = {
    image: /\.(jpe?g|png|webp|gif)$/i,
    audio: /\.(mp3|wav|m4a|ogg)$/i,
    video: /\.(mp4|webm|mov)$/i,
    pdf: /\.pdf$/i,
  }[category];

  if (
    !actualMime ||
    !allowedMimes.includes(actualMime) ||
    (declaredMime && declaredMime !== actualMime) ||
    (extension && (
      !extensionPattern.test(file.name) ||
      MEDIA_EXTENSION_MIME_TYPES[extension.toLowerCase()] !== actualMime
    ))
  ) {
    return {
      valid: false,
      code: 'UNSUPPORTED_MEDIA_TYPE',
      error: `Unsupported ${category} media type`,
    };
  }

  return { valid: true, mimeType: actualMime };
}

function detectMediaMime(bytes: Uint8Array): string | null {
  const ascii = String.fromCharCode(...bytes);
  if (bytes.length >= 8 && ascii.startsWith('\x89PNG\r\n\x1a\n')) return 'image/png';
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (ascii.startsWith('GIF87a') || ascii.startsWith('GIF89a')) return 'image/gif';
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WEBP') return 'image/webp';
  if (ascii.startsWith('RIFF') && ascii.slice(8, 12) === 'WAVE') return 'audio/wav';
  if (ascii.startsWith('OggS')) return 'audio/ogg';
  if (ascii.startsWith('ID3') || (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0)) {
    return 'audio/mpeg';
  }
  if (bytes.length >= 12 && ascii.slice(4, 8) === 'ftyp') {
    const brand = ascii.slice(8, 12);
    if (brand === 'qt  ') return 'video/quicktime';
    if (['M4A ', 'M4B ', 'M4P ', 'F4A ', 'F4B '].includes(brand)) return 'audio/mp4';
    return 'video/mp4';
  }
  if (ascii.startsWith('%PDF-')) return 'application/pdf';
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return 'video/webm';
  }
  return null;
}

function normalizeMime(mime: string): string {
  return ({
    'image/jpg': 'image/jpeg',
    'audio/mp3': 'audio/mpeg',
    'audio/x-m4a': 'audio/mp4',
  } as Record<string, string>)[mime] || mime;
}

export function extractMediaReferences(value: unknown): string[] {
  const references = new Set<string>();
  visit(value, (candidate) => {
    const id = mediaId(candidate);
    if (id) references.add(id);
  });
  return [...references];
}

export async function resolveMediaReferences<T>(
  value: T,
  resolver: (assetId: string) => Promise<string | null>
): Promise<T> {
  return visitAsync(value, async (candidate) => {
    const id = mediaId(candidate);
    if (!id) return candidate;
    const url = await resolver(id);
    if (!url) throw new MediaError('MEDIA_NOT_FOUND', `Media asset ${id} is unavailable`);
    return url;
  }) as Promise<T>;
}

export function mediaId(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith('media://')) return null;
  const id = value.slice('media://'.length).trim();
  return id ? id : null;
}

function visit(value: unknown, callback: (candidate: unknown) => void): void {
  callback(value);
  if (Array.isArray(value)) {
    for (const item of value) visit(item, callback);
    return;
  }
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) visit(child, callback);
  }
}

async function visitAsync(value: unknown, callback: (candidate: unknown) => Promise<unknown>): Promise<unknown> {
  if (Array.isArray(value)) return Promise.all(value.map((item) => visitAsync(item, callback)));
  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value).map(async ([key, child]) => [key, await visitAsync(child, callback)] as const)
    );
    return Object.fromEntries(entries);
  }
  return callback(value);
}
