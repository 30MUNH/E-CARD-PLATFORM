import { DomainError, hashOpaqueToken, normalizeMediaReferences, stripWriteOnlyFields } from './domain/index.js';
import { HttpError } from './http.js';
import {
  extractMediaReferences,
  MAX_MEDIA_UPLOAD_REQUEST_BYTES,
  mediaId,
  resolveMediaReferences,
  validateMediaFile,
} from './media.js';
import type {
  AdminPrincipal,
  ApiDeps,
  MediaRepository,
  RecipientSession,
} from './repository.js';

const SCHEMA_VERSION = '1.0.0';

export function createSupabaseDeps(
  client: any,
  options: {
    publicBaseUrl: string;
    mediaBucket: string;
    recipientSessionTtlSeconds: number;
    signedMediaUrlTtlSeconds: number;
  }
): ApiDeps {
  return {
    admin: {
      authenticate: async (request) => authenticateAdmin(client, request),
    },
    cards: createAdminRepository(client, options),
    media: createMediaRepository(client, options),
    public: createPublicRepository(client, options),
  };
}

async function authenticateAdmin(client: any, request: Request): Promise<AdminPrincipal | null> {
  const authorization = request.headers.get('authorization');
  if (!authorization?.startsWith('Bearer ')) return null;

  const { data: userData, error: userError } = await client.auth.getUser(
    authorization.slice('Bearer '.length).trim()
  );
  if (userError || !userData?.user) return null;

  const { data: profile, error } = await client
    .from('profiles')
    .select('role')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (error || profile?.role !== 'admin') return null;

  return { userId: userData.user.id, role: profile.role };
}

function createAdminRepository(client: any, options: {
  publicBaseUrl: string;
  mediaBucket: string;
  signedMediaUrlTtlSeconds: number;
}) {
  return {
    async list(filter: { status?: string; search?: string }, principal: AdminPrincipal) {
      let query = client.from('ecard_cards').select('*').order('updated_at', { ascending: false });
      if (filter.status && filter.status !== 'all') query = query.eq('status', filter.status);
      const { data: cards, error } = await query;
      if (error) throw databaseError(error);

      const visibleCards = principal.role === 'admin'
        ? cards || []
        : await filterCardsByCapability(client, cards || [], principal, 'edit');
      const summaries = await Promise.all(visibleCards.map((card: any) => summarizeCard(client, card, options)));
      const search = filter.search?.trim().toLowerCase();
      return search
        ? summaries.filter((summary: any) =>
            [summary.title, summary.recipientName, summary.senderName, summary.id]
              .filter(Boolean)
              .some((value) => String(value).toLowerCase().includes(search))
          )
        : summaries;
    },

    async get(id: string, principal: AdminPrincipal) {
      const card = await loadOwnedCard(client, id, principal, 'edit');
      return card ? loadAdminConfig(client, card, options) : null;
    },

    async getPublished(id: string, principal: AdminPrincipal) {
      const card = await loadOwnedCard(client, id, principal, 'edit');
      if (!card || card.status !== 'published' || !card.active_published_version_id) return null;
      const version = await loadVersion(client, card.active_published_version_id);
      return {
        ...(await resolveConfigMedia(client, version.config, card.id, options)),
        status: 'published',
        publicSlug: card.public_slug,
        publicUrl: `${options.publicBaseUrl}/ecd/game/${card.public_slug}`,
        publishedVersion: version.version_number,
      };
    },

    async create(payload: any, principal: AdminPrincipal) {
      const { data: card, error } = await client
        .from('ecard_cards')
        .insert({ owner_id: principal.userId, title: String(payload.title || 'Thiệp mới').trim() })
        .select('*')
        .single();
      if (error) throw databaseError(error);
      await saveDraft(client, card, payload, principal, 0, true);
      return loadAdminConfig(client, card.id, options);
    },

    async update(id: string, payload: any, principal: AdminPrincipal) {
      const card = await loadOwnedCard(client, id, principal, 'edit');
      if (!card) return null;
      const current = await loadAdminConfig(client, card.id, options);
      const merged = mergePayload(current, payload);
      const version = payload.baseVersion ?? current.draftVersion ?? 0;
      await saveDraft(client, card, merged, principal, version, pinWasProvided(payload));
      return loadAdminConfig(client, card.id, options);
    },

    async saveDraft(id: string, payload: any, principal: AdminPrincipal) {
      const card = await loadOwnedCard(client, id, principal, 'edit');
      if (!card) throw new HttpError(404, 'CARD_NOT_FOUND', 'Card not found');
      const version = payload.baseVersion ?? (await currentDraftVersion(client, card.id));
      await saveDraft(client, card, payload, principal, version, pinWasProvided(payload));
      return loadAdminConfig(client, card.id, options);
    },

    async publish(id: string, expectedVersion: number | undefined, principal: AdminPrincipal) {
      const card = await loadOwnedCard(client, id, principal, 'publish');
      if (!card) throw new HttpError(404, 'CARD_NOT_FOUND', 'Card not found');
      const draftVersion = expectedVersion ?? (await currentDraftVersion(client, card.id));
      const result = await callRpc(client, 'publish_ecard', {
        p_card_id: card.id,
        p_actor_id: principal.userId,
        p_expected_draft_version: draftVersion,
      });
      return {
        id: card.id,
        status: 'published',
        publishedAt: new Date().toISOString(),
        publicUrl: `${options.publicBaseUrl}/ecd/game/${card.public_slug}`,
        integrationPending: false,
        message: 'E-Card đã được xuất bản và sẵn sàng chia sẻ.',
        ...result,
      };
    },

    async archive(id: string, principal: AdminPrincipal) {
      const card = await loadOwnedCard(client, id, principal, 'archive');
      if (!card) throw new HttpError(404, 'CARD_NOT_FOUND', 'Card not found');
      const { data, error } = await client
        .from('ecard_cards')
        .update({ status: 'archived' })
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw databaseError(error);
      await callRpc(client, 'revoke_recipient_sessions', { p_card_id: id });
      return summarizeCard(client, data, options);
    },

    async templates() {
      const { data, error } = await client.from('ecard_templates').select('*').order('name');
      if (error) throw databaseError(error);
      return (data || []).map((template: any) => ({
        id: template.id,
        name: template.name,
        tagline: template.tagline,
        description: template.description,
        previewImageUrl: template.preview_image_url,
        accentColor: template.accent_color,
        supportedSlides: template.supported_slides,
        isDefault: template.is_default,
      }));
    },
  };
}

function createPublicRepository(
  client: any,
  options: {
    recipientSessionTtlSeconds: number;
    signedMediaUrlTtlSeconds: number;
    mediaBucket: string;
  }
) {
  return {
    async metadata(slug: string) {
      const loaded = await loadPublicVersion(client, slug);
      if (!loaded) return null;
      const { card, version } = loaded;
      const config = version.config || {};
      const ecardData = config.ecardData || {};
      return {
        id: card.id,
        title: card.title,
        templateId: ecardData.template_id,
        hasPin: Boolean(version.pin_hash),
        status: card.status,
        welcomeConfig: config.welcomeConfig || {},
        pinScreenConfig: config.pinScreenConfig || {},
        themeCustomization: config.themeCustomization || {},
      };
    },

    async verifyPin(slug: string, pin: string) {
      const result = await callRpc(client, 'verify_ecard_pin', {
        p_public_slug: slug,
        p_pin: pin,
      });
      const row = Array.isArray(result) ? result[0] : result;
      return row?.card_id && row?.version_id
        ? { cardId: row.card_id, versionId: row.version_id }
        : null;
    },

    async createSession(cardId: string) {
      const token = `${crypto.randomUUID()}-${crypto.randomUUID()}`;
      const tokenHash = await hashOpaqueToken(token);
      const expiresAt = new Date(Date.now() + options.recipientSessionTtlSeconds * 1000).toISOString();
      await callRpc(client, 'create_recipient_session', {
        p_card_id: cardId,
        p_token_hash: tokenHash,
        p_expires_at: expiresAt,
      });
      return { token, expiresAt };
    },

    async resolveSession(token: string): Promise<RecipientSession | null> {
      const tokenHash = await hashOpaqueToken(token);
      const { data, error } = await client
        .from('recipient_sessions')
        .select('card_id, expires_at, revoked_at')
        .eq('token_hash', tokenHash)
        .maybeSingle();
      if (error) throw databaseError(error);
      if (!data || data.revoked_at || new Date(data.expires_at).getTime() <= Date.now()) return null;
      return { cardId: data.card_id, expiresAt: new Date(data.expires_at).getTime() };
    },

    async content(slug: string) {
      const loaded = await loadPublicVersion(client, slug);
      if (!loaded) return null;
      return {
        ...(await resolveConfigMedia(client, loaded.version.config, loaded.card.id, options)),
        status: 'published',
        publicSlug: slug,
        publicUrl: `/ecd/game/${slug}`,
      };
    },
  };
}

async function saveDraft(
  client: any,
  card: any,
  payload: any,
  principal: AdminPrincipal,
  baseVersion: number,
  pinProvided: boolean
) {
  const rawConfig = stripWriteOnlyFields(payloadToConfig(payload, card));
  const { config, assets } = await normalizeDraftConfig(client, rawConfig, card, principal);
  const result = await callRpc(client, 'replace_ecard_draft', {
    p_card_id: card.id,
    p_actor_id: principal.userId,
    p_base_version: baseVersion,
    p_config: config,
    p_pin_provided: pinProvided,
    p_pin: pinProvided ? payload.newPin ?? null : null,
  });
  if (result?.version_id && assets.length) {
    const { error } = await client.from('ecard_version_media').insert(
      assets.map((asset: any) => ({ version_id: result.version_id, media_asset_id: asset.id }))
    );
    if (error) throw databaseError(error);
  }
  return result;
}

async function normalizeDraftConfig(client: any, config: any, card: any, principal: AdminPrincipal) {
  const { data: assets, error } = await client
    .from('media_assets')
    .select('id, owner_id, card_id, storage_bucket, storage_path, deleted_at')
    .eq('card_id', card.id)
    .is('deleted_at', null);
  if (error) throw databaseError(error);

  const available = (assets || []).filter(
    (asset: any) =>
      (asset.owner_id === principal.userId || asset.owner_id === card.owner_id) &&
      asset.storage_bucket === 'ecard-media'
  );
  let normalized: any;
  try {
    normalized = normalizeMediaReferences(
      config,
      available.map((asset: any) => ({
        id: asset.id,
        storagePath: asset.storage_path,
        ownerId: asset.owner_id,
      }))
    );
  } catch (error) {
    if (error instanceof DomainError) {
      throw new HttpError(403, 'MEDIA_NOT_OWNED', error.message);
    }
    throw error;
  }
  const references = extractMediaReferences(normalized);
  const referencedAssets = available.filter((asset: any) => references.includes(asset.id));
  if (referencedAssets.length !== references.length) {
    throw new HttpError(403, 'MEDIA_NOT_OWNED', 'Media must belong to this card');
  }
  return { config: normalized, assets: referencedAssets };
}

function createMediaRepository(
  client: any,
  options: { mediaBucket: string; signedMediaUrlTtlSeconds: number }
): MediaRepository {
  return {
    async upload(request, principal) {
      const contentLength = request.headers.get('content-length');
      if (contentLength !== null) {
        const requestSize = Number(contentLength);
        if (!Number.isSafeInteger(requestSize) || requestSize < 0) {
          throw new HttpError(400, 'VALIDATION_ERROR', 'Invalid upload content length');
        }
        if (requestSize > MAX_MEDIA_UPLOAD_REQUEST_BYTES) {
          throw new HttpError(413, 'MEDIA_TOO_LARGE', 'The media upload request exceeds its size limit');
        }
      }

      let form: FormData;
      try {
        form = await parseBoundedMultipartForm(request);
      } catch (error) {
        if (error instanceof HttpError) throw error;
        throw new HttpError(422, 'VALIDATION_ERROR', 'Multipart form data is required');
      }
      const keys: string[] = [];
      form.forEach((_value, key) => keys.push(key));
      const allowedKeys = new Set(['file', 'mediaType', 'category', 'cardId']);
      if (
        keys.some((key) => !allowedKeys.has(key)) ||
        keys.filter((key) => key === 'file').length !== 1 ||
        keys.filter((key) => key === 'cardId').length !== 1 ||
        keys.filter((key) => key === 'mediaType' || key === 'category').length !== 1 ||
        form.getAll('file').length !== 1 ||
        form.getAll('cardId').length !== 1 ||
        (form.has('mediaType') && form.has('category'))
      ) {
        throw new HttpError(422, 'VALIDATION_ERROR', 'Unexpected or duplicate multipart fields');
      }
      const file = form.get('file');
      const category = String(form.get('mediaType') || form.get('category') || '');
      const cardId = String(form.get('cardId') || '');
      if (!(file instanceof File) || !['image', 'audio', 'video', 'pdf'].includes(category) || !cardId) {
        throw new HttpError(422, 'VALIDATION_ERROR', 'file, mediaType, and cardId are required');
      }

      const validation = await validateMediaFile(file, category as 'image' | 'audio' | 'video' | 'pdf');
      if (!validation.valid) {
        const status = validation.code === 'MEDIA_TOO_LARGE' ? 413 : 415;
        throw new HttpError(status, validation.code || 'VALIDATION_ERROR', validation.error || 'Media is invalid');
      }

      const card = await loadOwnedCard(client, cardId, principal, 'edit');
      if (!card) throw new HttpError(404, 'CARD_NOT_FOUND', 'Card not found');
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'upload';
      const storagePath = `${principal.userId}/${card.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await client.storage.from(options.mediaBucket).upload(storagePath, file, {
        contentType: validation.mimeType,
        cacheControl: '60',
        upsert: false,
      });
      if (uploadError) throw new HttpError(502, 'MEDIA_UPLOAD_FAILED', 'Media upload failed');

      const { data: asset, error: insertError } = await client
        .from('media_assets')
        .insert({
          owner_id: principal.userId,
          card_id: card.id,
          storage_bucket: options.mediaBucket,
          storage_path: storagePath,
          filename: file.name,
          mime_type: validation.mimeType,
          media_type: category,
          size_bytes: file.size,
        })
        .select('*')
        .single();
      if (insertError) {
        await client.storage.from(options.mediaBucket).remove([storagePath]);
        throw databaseError(insertError);
      }

      return formatMediaAsset(asset, await signedMediaUrl(client, asset, options));
    },

    async delete(id, principal) {
      const { data: asset, error } = await client.from('media_assets').select('*').eq('id', id).maybeSingle();
      if (error) throw databaseError(error);
      if (!asset) throw new HttpError(404, 'MEDIA_NOT_FOUND', 'Media asset not found');
      const card = await loadOwnedCard(client, asset.card_id, principal, 'edit');
      if (!card || (asset.owner_id !== principal.userId && asset.owner_id !== card.owner_id)) {
        throw new HttpError(403, 'MEDIA_NOT_OWNED', 'Media asset is not owned by this card');
      }
      const { data: references, error: referenceError } = await client
        .from('ecard_version_media')
        .select('version_id')
        .eq('media_asset_id', id)
        .limit(1);
      if (referenceError) throw databaseError(referenceError);
      if (references?.length) {
        throw new HttpError(409, 'MEDIA_IN_USE', 'Media is referenced by a card version');
      }
      const { error: storageError } = await client.storage.from(asset.storage_bucket).remove([asset.storage_path]);
      if (storageError) throw new HttpError(502, 'MEDIA_DELETE_FAILED', 'Media deletion failed');
      const { error: deleteError } = await client.from('media_assets').delete().eq('id', id);
      if (deleteError) throw databaseError(deleteError);
    },
  };
}

async function parseBoundedMultipartForm(request: Request): Promise<FormData> {
  if (!request.body) return request.formData();

  let bytesRead = 0;
  let limitExceeded = false;
  const boundedBody = request.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      bytesRead += chunk.byteLength;
      if (bytesRead > MAX_MEDIA_UPLOAD_REQUEST_BYTES) {
        limitExceeded = true;
        throw new Error('Multipart body exceeds configured byte limit');
      }
      controller.enqueue(chunk);
    },
  }));

  try {
    const boundedRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: boundedBody,
      // Node requires duplex for streamed request bodies; Deno ignores this extension.
      duplex: 'half',
    } as RequestInit);
    return await boundedRequest.formData();
  } catch (error) {
    if (limitExceeded) {
      throw new HttpError(413, 'MEDIA_TOO_LARGE', 'The media upload request exceeds its size limit');
    }
    throw error;
  }
}

async function signedMediaUrl(client: any, asset: any, options: {
  mediaBucket: string;
  signedMediaUrlTtlSeconds: number;
}) {
  const { data, error } = await client.storage
    .from(asset.storage_bucket || options.mediaBucket)
    .createSignedUrl(asset.storage_path, Math.max(60, options.signedMediaUrlTtlSeconds));
  if (error || !data?.signedUrl) throw new HttpError(502, 'MEDIA_URL_FAILED', 'Media URL generation failed');
  return data.signedUrl;
}

function formatMediaAsset(asset: any, url: string) {
  return {
    id: asset.id,
    url,
    filename: asset.filename,
    mimeType: asset.mime_type,
    mediaType: asset.media_type,
    sizeBytes: asset.size_bytes,
    createdAt: asset.created_at,
    isLocalPreview: false,
  };
}

async function loadOwnedCard(client: any, id: string, principal: AdminPrincipal, capability: string) {
  const { data: card, error } = await client.from('ecard_cards').select('*').eq('id', id).maybeSingle();
  if (error) throw databaseError(error);
  if (!card) return null;
  const allowed = await callRpc(client, 'has_card_capability', {
    p_user_id: principal.userId,
    p_card_id: id,
    p_capability: capability,
  });
  if (!allowed) return null;
  return card;
}

async function filterCardsByCapability(
  client: any,
  cards: any[],
  principal: AdminPrincipal,
  capability: string
) {
  const visible = [];
  for (const card of cards) {
    if (await callRpc(client, 'has_card_capability', {
      p_user_id: principal.userId,
      p_card_id: card.id,
      p_capability: capability,
    })) {
      visible.push(card);
    }
  }
  return visible;
}

async function currentDraftVersion(client: any, cardId: string): Promise<number> {
  const { data: card, error } = await client
    .from('ecard_cards')
    .select('current_draft_version_id')
    .eq('id', cardId)
    .single();
  if (error) throw databaseError(error);
  if (!card.current_draft_version_id) return 0;
  const { data: version, error: versionError } = await client
    .from('ecard_versions')
    .select('version_number')
    .eq('id', card.current_draft_version_id)
    .single();
  if (versionError) throw databaseError(versionError);
  return version.version_number;
}

async function loadAdminConfig(
  client: any,
  cardOrId: any,
  options: {
    publicBaseUrl: string;
    mediaBucket?: string;
    signedMediaUrlTtlSeconds: number;
  }
) {
  const card = typeof cardOrId === 'string' ? await loadCard(client, cardOrId) : cardOrId;
  if (!card) return null;
  const draft = card.current_draft_version_id
    ? await loadVersion(client, card.current_draft_version_id)
    : null;
  const published = card.active_published_version_id
    ? await loadVersion(client, card.active_published_version_id)
    : null;
  const source = draft || published;
  if (!source) return { id: card.id, title: card.title, status: card.status };
  const resolvedConfig = await resolveConfigMedia(client, source.config, card.id, options);
  return {
    ...resolvedConfig,
    status: card.status,
    hasPin: Boolean(draft?.pin_hash ?? published?.pin_hash),
    publicSlug: card.public_slug,
    publicUrl: card.status === 'published' ? `${options.publicBaseUrl}/ecd/game/${card.public_slug}` : undefined,
    draftVersion: draft?.version_number,
    publishedVersion: published?.version_number,
  };
}

async function summarizeCard(client: any, card: any, options: { publicBaseUrl: string }) {
  const loaded = card.current_draft_version_id
    ? await loadVersion(client, card.current_draft_version_id)
    : card.active_published_version_id
      ? await loadVersion(client, card.active_published_version_id)
      : null;
  const config = loaded?.config || {};
  const ecardData = config.ecardData || {};
  return {
    id: card.id,
    title: card.title,
    recipientName: ecardData.male_name || '',
    senderName: ecardData.female_name || '',
    specialDate: ecardData.love_start_date || '',
    status: card.status,
    templateId: ecardData.template_id || '',
    templateName: ecardData.template_id || '',
    hasPin: Boolean(loaded?.pin_hash),
    photoCount: Array.isArray(config.albumData) ? config.albumData.length : 0,
    createdAt: card.created_at,
    updatedAt: card.updated_at,
    publicUrl: card.status === 'published' ? `${options.publicBaseUrl}/ecd/game/${card.public_slug}` : undefined,
  };
}

async function loadVersion(client: any, versionId: string) {
  const { data, error } = await client.from('ecard_versions').select('*').eq('id', versionId).single();
  if (error) throw databaseError(error);
  return data;
}

async function loadCard(client: any, cardId: string) {
  const { data, error } = await client.from('ecard_cards').select('*').eq('id', cardId).maybeSingle();
  if (error) throw databaseError(error);
  return data;
}

async function loadPublicVersion(client: any, slug: string) {
  const { data: card, error } = await client
    .from('ecard_cards')
    .select('id, title, status, public_slug, active_published_version_id')
    .eq('public_slug', slug)
    .maybeSingle();
  if (error) throw databaseError(error);
  if (!card || card.status !== 'published' || !card.active_published_version_id) return null;
  const version = await loadVersion(client, card.active_published_version_id);
  return { card, version };
}

async function resolveConfigMedia(
  client: any,
  config: any,
  cardId: string,
  options: { mediaBucket?: string; signedMediaUrlTtlSeconds: number }
) {
  const references = extractMediaReferences(config);
  if (!references.length) return config;
  const { data: assets, error } = await client
    .from('media_assets')
    .select('id, card_id, storage_bucket, storage_path, deleted_at')
    .in('id', references);
  if (error) throw databaseError(error);
  const available = (assets || []).filter(
    (asset: any) => asset.card_id === cardId && !asset.deleted_at && asset.storage_bucket === (options.mediaBucket || 'ecard-media')
  );
  if (available.length !== references.length) {
    throw new HttpError(403, 'MEDIA_NOT_OWNED', 'Media reference is not available for this card');
  }
  return resolveMediaReferences(config, async (assetId) => {
    const asset = available.find((candidate: any) => candidate.id === assetId);
    return asset ? signedMediaUrl(client, asset, {
      mediaBucket: options.mediaBucket || 'ecard-media',
      signedMediaUrlTtlSeconds: options.signedMediaUrlTtlSeconds,
    }) : null;
  });
}

function payloadToConfig(payload: any, card: any) {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    title: String(payload.title || card.title || 'Thiệp mới').trim(),
    description: payload.description || '',
    status: 'draft',
    createdAt: card.created_at || now,
    updatedAt: now,
    publicSlug: card.public_slug,
    slideOrder: payload.slideOrder || [],
    slideVisibility: payload.slideVisibility || {},
    ecardData: {
      id: card.id,
      female_name: payload.senderName || '',
      male_name: payload.recipientName || '',
      love_start_date: payload.loveStartDate || now,
      has_pin: Boolean(payload.hasPin ?? payload.newPin),
      template_id: payload.templateId || '',
      owner_name: null,
      owner_phone: null,
      owner_addr: null,
      owner_maps: null,
    },
    homepageData: payload.homepageData || {},
    albumData: payload.albumData || [],
    albumPdf: payload.albumPdf || null,
    provinceImages: [],
    letterData: payload.letterData || { love_letters: [], audio_url: null, avatars: [] },
    musicData: payload.musicData || [],
    hasVoice: Boolean(payload.hasVoice),
    hasVideo: Boolean(payload.hasVideo),
    videoData: payload.videoData || { video_url: null },
    injectionData: [],
    wishboxData: [],
    specialDates: payload.specialDates || [],
    welcomeConfig: payload.welcomeConfig || {},
    pinScreenConfig: payload.pinScreenConfig || {},
    themeCustomization: payload.themeCustomization || {},
  };
}

function pinWasProvided(payload: any): boolean {
  return Object.hasOwn(payload, 'newPin') || payload.hasPin === false;
}

function mergePayload(current: any, patch: any) {
  const config = current || {};
  return {
    ...config,
    ...patch,
    recipientName: patch.recipientName ?? config.ecardData?.male_name,
    senderName: patch.senderName ?? config.ecardData?.female_name,
    loveStartDate: patch.loveStartDate ?? config.ecardData?.love_start_date,
    templateId: patch.templateId ?? config.ecardData?.template_id,
    homepageData: patch.homepageData ?? config.homepageData,
    albumData: patch.albumData ?? config.albumData,
    albumPdf: patch.albumPdf ?? config.albumPdf,
    letterData: patch.letterData ?? config.letterData,
    musicData: patch.musicData ?? config.musicData,
    videoData: patch.videoData ?? config.videoData,
    specialDates: patch.specialDates ?? config.specialDates,
    welcomeConfig: patch.welcomeConfig ?? config.welcomeConfig,
    pinScreenConfig: patch.pinScreenConfig ?? config.pinScreenConfig,
    themeCustomization: patch.themeCustomization ?? config.themeCustomization,
    slideOrder: patch.slideOrder ?? config.slideOrder,
    slideVisibility: patch.slideVisibility ?? config.slideVisibility,
  };
}

async function callRpc(client: any, functionName: string, params: Record<string, unknown>): Promise<any> {
  const { data, error } = await client.rpc(functionName, params);
  if (error) throw databaseError(error);
  return data;
}

function databaseError(error: any): HttpError {
  const message = String(error?.message || 'Database request failed');
  const known = [
    'UNAUTHORIZED',
    'CARD_NOT_FOUND',
    'STALE_DRAFT_VERSION',
    'INVALID_PIN',
    'PUBLISHED_PIN_REQUIRED',
    'CARD_NOT_PUBLISHED',
    'DRAFT_REQUIRED',
    'INVALID_DRAFT_CONFIG',
  ].find((code) => message.includes(code));
  if (known === 'CARD_NOT_FOUND') return new HttpError(404, known, 'Card not found');
  if (known === 'UNAUTHORIZED') return new HttpError(403, known, 'Not authorized');
  if (known === 'INVALID_PIN') return new HttpError(422, 'VALIDATION_ERROR', 'PIN is invalid');
  if (known === 'PUBLISHED_PIN_REQUIRED') return new HttpError(422, 'VALIDATION_ERROR', 'Published cards require a PIN');
  if (known === 'STALE_DRAFT_VERSION') return new HttpError(409, known, 'Draft changed; reload before saving');
  if (known === 'CARD_NOT_PUBLISHED') return new HttpError(403, known, 'Card is not published');
  if (known === 'DRAFT_REQUIRED') return new HttpError(422, 'VALIDATION_ERROR', 'A draft is required before publishing');
  if (known === 'INVALID_DRAFT_CONFIG') return new HttpError(422, 'VALIDATION_ERROR', 'Draft configuration is invalid');
  const diagnosticId = crypto.randomUUID();
  const safeCode = /^[0-9A-Z]{5}$/.test(String(error?.code || '')) ? error.code : 'UNKNOWN';
  console.error('Supabase database request failed', {
    diagnosticId,
    code: safeCode,
    message,
    details: error?.details,
    hint: error?.hint,
  });
  return new HttpError(500, 'INTERNAL_ERROR', 'Database request failed');
}
