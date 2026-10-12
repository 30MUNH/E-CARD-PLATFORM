# Frontend / Backend Integration Contract (`v1.0.0`)

**Project:** By.Duni E-Card Platform (`/home/tts/Documents/LHA`)  
**Schema Version:** `1.0.0` (`ECARD_SCHEMA_VERSION` in [`src/types/ecard.ts`](file:///home/tts/Documents/LHA/src/types/ecard.ts))  
**Frontend Owner:** Antigravity  
**Backend Owner:** OpenAI Codex  

---

## 1. Agent Ownership Boundaries

| Domain | Owner | Responsibilities |
| :--- | :--- | :--- |
| **Frontend Architecture & UI/UX** | **Antigravity** | React 18 components, Admin Dashboard UI (`/admin/*`), Recipient Experience UI (`/ecd/game/:uuid`), responsive layouts (Mobile `390×844`, Tablet `768×1024`, Desktop `1440×900`), animations, Live Preview, TypeScript service interfaces, and clearly labeled development mock adapters. |
| **Backend, API, Storage & Security** | **OpenAI Codex** | Database schema & persistence, REST/HTTP API endpoints, admin authentication & session management, server-side 4-digit PIN hashing & verification, cloud media storage (S3/R2/GCS), unique public slug/link generation, publishing state machine, and production URL routing. |

> **Important Integration Rule:** All frontend components consume data exclusively through the service interfaces in [`src/services/`](file:///home/tts/Documents/LHA/src/services/index.ts) (`CardRepository`, `MediaService`, `CardAccessService`). Codex only needs to implement real HTTP adapters conforming to these interfaces and swap the factory bindings in [`src/services/index.ts`](file:///home/tts/Documents/LHA/src/services/index.ts) — **no React component rewrites are required**.

---

## 2. Security & Privacy Boundaries

1. **Zero Private Content Before PIN Unlock:**
   - When a recipient opens a password-protected E-Card link, the frontend first calls `CardAccessService.getPublicMetadata(id)`.
   - This endpoint returns `PublicCardMetadata` (card ID, template ID, `hasPin`, welcome/PIN screen customization, and theme tokens) — **never** private photos, love letters, audio recordings, or personal couple names.
   - Protected `EcardConfig` content is only delivered after `CardAccessService.verifyPin(id, pin)` succeeds and returns `PinVerificationResult.cardContent` (or an `accessToken` used by `getAuthorizedCardContent`).
2. **Server-Side PIN Verification & Unlimited UI Retries:**
   - The frontend never stores plaintext PINs in `localStorage`, `sessionStorage`, source code, or mock databases.
   - In the Admin Editor (`AccessSettingsSection`), entering a new 4-digit PIN + confirmation populates a transient write-only field (`newPin?: string` in `SaveCardDraftPayload`) intended to be transmitted over HTTPS to Codex's backend, where it must be hashed (e.g., Argon2id / bcrypt) and never returned in `GET` responses.
   - Per product requirements, the recipient PIN screen imposes **no UI attempt counter, no UI lockout, and no forced waiting delay** after an incorrect attempt; recipients can retry immediately.
3. **Explicit Integration-Pending States:**
   - While running against frontend mock adapters (`isMockMode: true`), actions that require backend persistence or public link generation (such as **Publish Card**, **PIN Persistence**, and **Cloud Media Upload**) display explicit `Integration Pending (Demo Mode)` banners in the UI so administrators are never misled into thinking a live production URL has been published.

---

## 3. Core Data Models (`src/types/ecard.ts`)

All shared TypeScript interfaces live in [`src/types/ecard.ts`](file:///home/tts/Documents/LHA/src/types/ecard.ts):

### 3.1 `EcardConfig` (Full Card Configuration — Schema `1.0.0`)
```ts
export type EcardStatus = 'draft' | 'published' | 'archived';

export type SlideId =
  | 'homepage'
  | 'album'
  | 'music'
  | 'letter'
  | 'timeline'
  | 'game'
  | 'video'
  | 'setting';

export interface EcardConfig {
  schemaVersion: string; // '1.0.0'
  title: string;
  description?: string;
  status: EcardStatus;
  createdAt: string;     // ISO 8601
  updatedAt: string;     // ISO 8601
  publicSlug?: string;
  publicUrl?: string;
  slideOrder: SlideId[];
  slideVisibility: Partial<Record<SlideId, boolean>>;
  ecardData: EcardMetadata;
  homepageData: HomepageData;
  albumData: AlbumItem[];
  provinceImages: string[];
  letterData: LetterData;
  musicData: MusicItem[];
  hasVoice: boolean;
  hasVideo: boolean;
  videoData: VideoData;
  injectionData: unknown[];
  wishboxData: unknown[];
  specialDates?: SpecialDateMilestone[];
  welcomeConfig?: WelcomeConfig;
  pinScreenConfig?: PinScreenConfig;
  themeCustomization?: ThemeCustomization;
}
```

### 3.2 `CardSummary` (Admin Dashboard & Card List Row)
```ts
export interface CardSummary {
  id: string;
  title: string;
  recipientName: string;
  senderName: string;
  specialDate: string;
  status: EcardStatus;
  templateId: string;
  templateName: string;
  hasPin: boolean;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
  publicUrl?: string;
}
```

### 3.3 `PublicCardMetadata` & `PinVerificationResult` (Recipient Access Flow)
```ts
export interface PublicCardMetadata {
  id: string;
  title: string;
  templateId: string;
  hasPin: boolean;
  status: EcardStatus;
  welcomeConfig: WelcomeConfig;
  pinScreenConfig: PinScreenConfig;
  themeCustomization: ThemeCustomization;
}

export interface PinVerificationResult {
  authorized: boolean;
  accessToken?: string;
  errorMessage?: string;
  cardContent?: EcardConfig;
  isMockMode: boolean;
}
```

---

## 4. Service Interfaces & Suggested HTTP API Endpoints

### 4.1 `CardRepository` ([`src/services/CardRepository.ts`](file:///home/tts/Documents/LHA/src/services/CardRepository.ts))

Used by the Admin Dashboard (`/admin`, `/admin/cards`, `/admin/cards/new`, `/admin/cards/:id/edit`). Requires Admin Authentication in production.

| Method Signature | Suggested HTTP Endpoint | Request Body / Params | Response Shape |
| :--- | :--- | :--- | :--- |
| `listCards(filter?: { status?: EcardStatus \| 'all'; search?: string }): Promise<CardSummary[]>` | `GET /api/admin/cards?status=&search=` | Query params `status`, `search` | `{ data: CardSummary[] }` |
| `getCard(id: string): Promise<EcardConfig>` | `GET /api/admin/cards/:id` | Path param `:id` | `{ data: EcardConfig }` |
| `createCard(payload: SaveCardDraftPayload): Promise<EcardConfig>` | `POST /api/admin/cards` | `SaveCardDraftPayload` JSON | `{ data: EcardConfig }` |
| `updateCard(id: string, payload: Partial<SaveCardDraftPayload>): Promise<EcardConfig>` | `PUT /api/admin/cards/:id` | `Partial<SaveCardDraftPayload>` JSON | `{ data: EcardConfig }` |
| `saveDraft(id: string, payload: SaveCardDraftPayload): Promise<EcardConfig>` | `PATCH /api/admin/cards/:id/draft` | `SaveCardDraftPayload` JSON | `{ data: EcardConfig }` |
| `publishCard(id: string): Promise<PublishCardResult>` | `POST /api/admin/cards/:id/publish` | Path param `:id` | `{ data: PublishCardResult }` |
| `archiveCard(id: string): Promise<CardSummary>` | `POST /api/admin/cards/:id/archive` | Path param `:id` | `{ data: CardSummary }` |
| `listTemplates(): Promise<TemplateDefinition[]>` | `GET /api/admin/templates` | None | `{ data: TemplateDefinition[] }` |

### 4.2 `MediaService` ([`src/services/MediaService.ts`](file:///home/tts/Documents/LHA/src/services/MediaService.ts))

Used by the Admin Media Upload section for images, audio recordings, and optional video.

| Method Signature | Suggested HTTP Endpoint | Constraints | Response Shape |
| :--- | :--- | :--- | :--- |
| `validateFile(file: File, expectedType: 'image' \| 'audio' \| 'video'): MediaUploadValidation` | Client-side pre-flight check | Images: `jpeg/png/webp` ≤ 10 MB; Audio: `mp3/wav/m4a/ogg` ≤ 25 MB; Video: `mp4/webm` ≤ 50 MB | `{ valid: boolean; error?: string }` |
| `uploadMedia(file: File, expectedType: 'image' \| 'audio' \| 'video'): Promise<MediaAsset>` | `POST /api/admin/media` (`multipart/form-data`) | Field `file`, `mediaType` | `{ data: MediaAsset }` |
| `deleteMedia(id: string): Promise<void>` | `DELETE /api/admin/media/:id` | Path param `:id` | `204 No Content` |

### 4.3 `CardAccessService` ([`src/services/CardAccessService.ts`](file:///home/tts/Documents/LHA/src/services/CardAccessService.ts))

Used by the public Recipient Experience (`/ecd/game/:uuid`).

| Method Signature | Suggested HTTP Endpoint | Request Body / Headers | Response Shape |
| :--- | :--- | :--- | :--- |
| `getPublicMetadata(uuidOrSlug: string): Promise<PublicCardMetadata>` | `GET /api/public/cards/:uuidOrSlug/metadata` | Public (no auth header) | `{ data: PublicCardMetadata }` |
| `verifyPin(uuidOrSlug: string, pin: string): Promise<PinVerificationResult>` | `POST /api/public/cards/:uuidOrSlug/verify-pin` | `{ pin: string }` (4 numeric digits) | `{ data: PinVerificationResult }` |
| `getAuthorizedCardContent(uuidOrSlug: string, accessToken?: string): Promise<EcardConfig>` | `GET /api/public/cards/:uuidOrSlug/content` | `Authorization: Bearer <accessToken>` (if `hasPin`) | `{ data: EcardConfig }` |

---

## 5. Error Response Specification

All non-2xx responses from Codex's backend should return JSON matching `ApiError`:

```json
{
  "error": "Sai mã PIN",
  "code": "INVALID_PIN",
  "details": {}
}
```

### Standard Error Codes
| HTTP Status | `code` | Meaning | Frontend Handling |
| :---: | :--- | :--- | :--- |
| `401` | `UNAUTHORIZED` | Admin session expired or missing | Redirect to admin login |
| `401` | `INVALID_PIN` | Recipient entered wrong 4-digit PIN | Show toast `"Sai mã PIN"`, clear dots, allow immediate retry |
| `404` | `CARD_NOT_FOUND` | UUID or slug does not exist | Render friendly not-found screen |
| `403` | `CARD_NOT_PUBLISHED` | Recipient accessed a draft/archived card | Render card unavailable state |
| `422` | `VALIDATION_ERROR` | Invalid draft/publish fields | Highlight field errors in `details` |
| `413` | `MEDIA_TOO_LARGE` | Uploaded file exceeds limit | Display inline size error |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | Disallowed MIME type | Display inline format error |

---

## 6. How Codex Connects Real Backend Adapters

1. Create `src/services/api/HttpCardRepository.ts`, `src/services/api/HttpMediaService.ts`, and `src/services/api/HttpCardAccessService.ts` implementing the interfaces in `src/services/*.ts`.
2. Update the factory functions in [`src/services/index.ts`](file:///home/tts/Documents/LHA/src/services/index.ts) (`getCardRepository()`, `getMediaService()`, `getCardAccessService()`) to instantiate the HTTP adapters instead of the mock adapters.
3. Set `isMockMode: false` in responses so all `"Integration Pending (Demo Mode)"` banners in the Admin UI automatically disappear.
