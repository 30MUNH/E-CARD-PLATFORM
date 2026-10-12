// ─── E-Card Platform — Core Type Definitions (Schema v1.0.0) ───
// Shared contract between the Antigravity Frontend and OpenAI Codex Backend.
// Keep in sync with docs/frontend-backend-contract.md.

export const ECARD_SCHEMA_VERSION = '1.0.0' as const;

// ─── Enums & Literals ───

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

export type TemplateId = string;

export type ViewportMode = 'mobile' | 'tablet' | 'desktop';

// ─── Core Data Models ───

export interface EcardMetadata {
  id: string;
  female_name: string;
  male_name: string;
  love_start_date: string;
  has_pin: boolean;
  template_id: TemplateId;
  owner_name: string | null;
  owner_phone: string | null;
  owner_addr: string | null;
  owner_maps: string | null;
}

export interface HomepageData {
  avatar_female: string;
  avatar_male: string;
  homepage_image: string;
  tagline?: string;
}

export interface AlbumItem {
  id: string;
  ecard_id: string;
  image_url: string;
  caption: string;
  order?: number;
}

export interface LetterData {
  love_letters: string[];
  audio_url: string | null;
  avatars: string[];
  salutation?: string;
  signoff?: string;
}

export interface MusicItem {
  id: string;
  ecard_id: string;
  youtube_id: string;
  title: string;
  artist?: string;
  quote?: string;
  audio_url?: string | null;
  created_at: string;
  updated_at: string | null;
  image_url: string;
  caption: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface VideoData {
  video_url: string | null;
  caption?: string | null;
}

export interface SpecialDateMilestone {
  id: string;
  date: string;
  title: string;
  description: string;
  badge?: string;
}

export interface WelcomeConfig {
  heading?: string;
  subheading?: string;
  buttonLabel?: string;
  backgroundImage?: string;
}

export interface PinScreenConfig {
  heading?: string;
  subheading?: string;
  backgroundImage?: string;
}

export interface ThemeCustomization {
  primaryColor: string;
  accentColor: string;
  backgroundTint: string;
  enableFloatingHearts: boolean;
  enableSoundEffects: boolean;
}

// ─── Slide Configuration ───

export interface SlideDefinition {
  id: SlideId;
  title: string;
  content?: string;
  bgColor?: string;
  textColor?: string;
  images?: string[];
  backgroundImage?: string;
  enabled?: boolean;
}

// ─── Composite E-Card Data (Backward-Compatible with Original Renderer) ───

export interface EcardPreloadData {
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

// ─── Platform Configuration Schema (v1.0.0) ───

export interface EcardConfig extends EcardPreloadData {
  schemaVersion: string;
  title: string;
  description?: string;
  status: EcardStatus;
  createdAt: string;
  updatedAt: string;
  publicSlug?: string;
  publicUrl?: string;
  /** Ordered list of active slide IDs for this card */
  slideOrder: SlideId[];
  /** Map of slide visibility flags */
  slideVisibility: Partial<Record<SlideId, boolean>>;
}

export interface CardSummary {
  id: string;
  title: string;
  recipientName: string;
  senderName: string;
  specialDate: string;
  status: EcardStatus;
  templateId: TemplateId;
  templateName: string;
  hasPin: boolean;
  photoCount: number;
  createdAt: string;
  updatedAt: string;
  publicUrl?: string;
}

// ─── Public vs. Authorized Recipient Boundary ───

export interface PublicCardMetadata {
  id: string;
  title: string;
  templateId: TemplateId;
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

// ─── Admin Editor Payloads ───

export interface SaveCardDraftPayload {
  title: string;
  description?: string;
  recipientName: string;
  senderName: string;
  loveStartDate: string;
  templateId: TemplateId;
  hasPin: boolean;
  /**
   * Optional write-only PIN update payload sent over HTTPS to the backend.
   * Never persisted in frontend storage, mock DBs, or public bundles.
   */
  newPin?: string;
  homepageData: HomepageData;
  albumData: AlbumItem[];
  letterData: LetterData;
  musicData: MusicItem[];
  videoData: VideoData;
  hasVoice: boolean;
  hasVideo: boolean;
  specialDates: SpecialDateMilestone[];
  welcomeConfig: WelcomeConfig;
  pinScreenConfig: PinScreenConfig;
  themeCustomization: ThemeCustomization;
  slideOrder: SlideId[];
  slideVisibility: Partial<Record<SlideId, boolean>>;
}

export interface PublishCardResult {
  id: string;
  status: 'published';
  publishedAt: string;
  publicUrl: string | null;
  integrationPending: boolean;
  message: string;
}

// ─── Template Definitions ───

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  tagline: string;
  description: string;
  previewImageUrl: string;
  accentColor: string;
  supportedSlides: SlideId[];
  isDefault?: boolean;
}

// ─── Media Upload ───

export interface MediaAsset {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  mediaType: 'image' | 'audio' | 'video';
  sizeBytes: number;
  createdAt: string;
  isLocalPreview: boolean;
}

export interface MediaUploadValidation {
  valid: boolean;
  error?: string;
}

// ─── Standard API Envelope & Error ───

export interface ApiError {
  error: string;
  code:
    | 'UNAUTHORIZED'
    | 'INVALID_PIN'
    | 'CARD_NOT_FOUND'
    | 'CARD_NOT_PUBLISHED'
    | 'VALIDATION_ERROR'
    | 'MEDIA_TOO_LARGE'
    | 'UNSUPPORTED_MEDIA_TYPE'
    | 'INTEGRATION_PENDING';
  details?: Record<string, string>;
}
