import {
  AVAILABLE_TEMPLATES,
  DEFAULT_ECARD_CONFIG,
  DEFAULT_SLIDE_ORDER,
  DEFAULT_THEME_CUSTOMIZATION,
} from '../../data/ecardData';
import {
  CardSummary,
  EcardConfig,
  ECARD_SCHEMA_VERSION,
  PublishCardResult,
  SaveCardDraftPayload,
  TemplateDefinition,
} from '../../types/ecard';
import { CardFilterOptions, CardRepository } from '../CardRepository';

function createDemoCard(
  id: string,
  title: string,
  femaleName: string,
  maleName: string,
  loveStartDate: string,
  status: 'draft' | 'published' | 'archived',
  templateId: string,
  createdAt: string,
  updatedAt: string,
  hasPin: boolean
): EcardConfig {
  return {
    schemaVersion: ECARD_SCHEMA_VERSION,
    title,
    description: `Thiệp kỷ niệm tình yêu dành cho ${femaleName} & ${maleName}`,
    status,
    createdAt,
    updatedAt,
    publicSlug: id,
    publicUrl: status === 'published' ? `/ecd/game/${id}` : undefined,
    slideOrder: [...DEFAULT_SLIDE_ORDER],
    slideVisibility: {
      homepage: true,
      album: true,
      music: true,
      letter: true,
      timeline: true,
      game: true,
      video: false,
      setting: true,
    },
    ecardData: {
      id,
      female_name: femaleName,
      male_name: maleName,
      love_start_date: loveStartDate,
      has_pin: hasPin,
      template_id: templateId,
      owner_name: null,
      owner_phone: null,
      owner_addr: null,
      owner_maps: null,
    },
    homepageData: {
      avatar_female: '/template/image-1.jpg',
      avatar_male: '/template/image-2.jpg',
      homepage_image: '/template/image-3.jpg',
      tagline: 'Lưu giữ từng khoảnh khắc bên nhau',
    },
    albumData: [
      {
        id: `${id}-img-1`,
        ecard_id: id,
        image_url: '/template/image-1.jpg',
        caption: 'Buổi hẹn hò đầu tiên 💖',
        order: 0,
      },
      {
        id: `${id}-img-2`,
        ecard_id: id,
        image_url: '/template/image-2.jpg',
        caption: 'Nắm tay nhau đi khắp thế gian',
        order: 1,
      },
      {
        id: `${id}-img-3`,
        ecard_id: id,
        image_url: '/template/image-3.jpg',
        caption: 'Kỷ niệm ngọt ngào bên cậu',
        order: 2,
      },
      {
        id: `${id}-img-4`,
        ecard_id: id,
        image_url: '/template/image-4.jpg',
        caption: 'Mùa thu đáng nhớ',
        order: 3,
      },
    ],
    provinceImages: [],
    letterData: {
      love_letters: [
        `Gửi ${maleName} thương yêu,`,
        'Cảm ơn anh vì đã luôn dịu dàng, kiên nhẫn và đồng hành cùng em qua mọi cung bậc cảm xúc.',
        'Mỗi ngày bên anh đều là một món quà quý giá mà em luôn trân trọng.',
        'Chúc cho hành trình của tụi mình luôn tràn ngập tiếng cười và hạnh phúc nhé! ❤️',
      ],
      audio_url: null,
      avatars: ['/template/image-1.jpg', '/template/image-2.jpg'],
    },
    musicData: [
      {
        id: `${id}-music-1`,
        ecard_id: id,
        youtube_id: 'JgTZvDbaTtg',
        title: 'Một Đời',
        artist: 'Duni',
        quote: 'Love you to the saturn and back',
        created_at: createdAt,
        updated_at: null,
        image_url: '/template/image-5.jpg',
        caption: null,
        is_deleted: false,
        deleted_at: null,
      },
    ],
    hasVoice: false,
    hasVideo: false,
    videoData: {
      video_url: null,
    },
    injectionData: [],
    wishboxData: [],
    specialDates: [
      {
        id: `${id}-ms-1`,
        date: loveStartDate.slice(0, 10),
        title: 'Ngày bắt đầu yêu',
        description: 'Cột mốc mở đầu câu chuyện tình yêu của hai đứa mình.',
        badge: 'Kỷ niệm',
      },
      {
        id: `${id}-ms-2`,
        date: '2025-12-24',
        title: 'Mùa Giáng sinh đầu tiên',
        description: 'Cùng nhau dạo phố đêm đông và trao nhau chiếc khăn ấm.',
        badge: 'Lễ hội',
      },
    ],
    welcomeConfig: {
      heading: 'Món quà bí mật',
      subheading: `Dành tặng ${maleName}`,
      buttonLabel: 'Bắt đầu',
      backgroundImage: '/template/background-welcome.png',
    },
    pinScreenConfig: {
      heading: 'Mở khóa kỷ niệm',
      subheading: 'Bất ngờ cho cậu nà 😜',
      backgroundImage: '/template/background-template.jpg',
    },
    themeCustomization: { ...DEFAULT_THEME_CUSTOMIZATION },
  };
}

const INITIAL_DEMO_CARDS: EcardConfig[] = [
  DEFAULT_ECARD_CONFIG,
  createDemoCard(
    'demo-anniversary-2025',
    'Kỷ niệm 1 Năm Ngày Cưới — Minh Anh & Quốc Bảo',
    'Minh Anh',
    'Quốc Bảo',
    '2024-10-12T00:00:00.000Z',
    'published',
    'c421e9f0-71a4-4d8e-b8c2-9102f43a11e2',
    '2025-09-10T08:00:00.000Z',
    '2025-10-01T15:45:00.000Z',
    true
  ),
  createDemoCard(
    'demo-valentine-draft',
    'Món quà Valentine — Thảo Nguyên & Gia Huy',
    'Thảo Nguyên',
    'Gia Huy',
    '2025-02-14T00:00:00.000Z',
    'draft',
    '8fa6d2b3-ba30-4290-9ac7-7a830c23bc7a',
    '2025-10-05T11:20:00.000Z',
    '2025-10-10T16:10:00.000Z',
    true
  ),
  createDemoCard(
    'demo-confession-archived',
    'Lời Tỏ Tình Mùa Thu — Lan Chi & Hoàng Nam',
    'Lan Chi',
    'Hoàng Nam',
    '2023-11-20T00:00:00.000Z',
    'archived',
    'f910b3a8-19c2-43d1-901a-55b8210ce490',
    '2024-11-18T09:00:00.000Z',
    '2025-01-15T10:00:00.000Z',
    false
  ),
];

function toSummary(card: EcardConfig): CardSummary {
  const tpl = AVAILABLE_TEMPLATES.find((t) => t.id === card.ecardData.template_id);
  return {
    id: card.ecardData.id,
    title: card.title,
    recipientName: card.ecardData.male_name,
    senderName: card.ecardData.female_name,
    specialDate: card.ecardData.love_start_date,
    status: card.status,
    templateId: card.ecardData.template_id,
    templateName: tpl ? tpl.name : 'By.Duni Classic Scrapbook',
    hasPin: card.ecardData.has_pin,
    photoCount: card.albumData.length,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
    publicUrl: card.publicUrl,
  };
}

export class MockCardRepository implements CardRepository {
  public readonly isMockMode = true;
  private store: Map<string, EcardConfig>;

  constructor() {
    this.store = new Map();
    for (const card of INITIAL_DEMO_CARDS) {
      this.store.set(card.ecardData.id, structuredClone(card));
    }
  }

  public getCardSync(id: string): EcardConfig | undefined {
    const found = this.store.get(id);
    return found ? structuredClone(found) : undefined;
  }

  async listCards(filter?: CardFilterOptions): Promise<CardSummary[]> {
    let items = Array.from(this.store.values());

    if (filter?.status && filter.status !== 'all') {
      items = items.filter((c) => c.status === filter.status);
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const q = filter.search.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.ecardData.female_name.toLowerCase().includes(q) ||
          c.ecardData.male_name.toLowerCase().includes(q) ||
          c.ecardData.id.toLowerCase().includes(q)
      );
    }

    items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return items.map(toSummary);
  }

  async getCard(id: string): Promise<EcardConfig> {
    const found = this.store.get(id);
    if (!found) {
      throw new Error(`Không tìm thấy thiệp với mã ID: ${id}`);
    }
    return structuredClone(found);
  }

  async createCard(payload: SaveCardDraftPayload): Promise<EcardConfig> {
    const now = new Date().toISOString();
    const id = `ecard-${Date.now().toString(36)}`;
    const newCard = this.applyPayloadToConfig(id, payload, 'draft', now, now);
    this.store.set(id, newCard);
    return structuredClone(newCard);
  }

  async updateCard(id: string, payload: Partial<SaveCardDraftPayload>): Promise<EcardConfig> {
    const existing = await this.getCard(id);
    const mergedPayload: SaveCardDraftPayload = {
      title: payload.title ?? existing.title,
      description: payload.description ?? existing.description,
      recipientName: payload.recipientName ?? existing.ecardData.male_name,
      senderName: payload.senderName ?? existing.ecardData.female_name,
      loveStartDate: payload.loveStartDate ?? existing.ecardData.love_start_date,
      templateId: payload.templateId ?? existing.ecardData.template_id,
      hasPin: payload.hasPin ?? existing.ecardData.has_pin,
      homepageData: payload.homepageData ?? existing.homepageData,
      albumData: payload.albumData ?? existing.albumData,
      letterData: payload.letterData ?? existing.letterData,
      musicData: payload.musicData ?? existing.musicData,
      videoData: payload.videoData ?? existing.videoData,
      hasVoice: payload.hasVoice ?? existing.hasVoice,
      hasVideo: payload.hasVideo ?? existing.hasVideo,
      specialDates: payload.specialDates ?? existing.specialDates ?? [],
      welcomeConfig: payload.welcomeConfig ?? existing.welcomeConfig ?? {},
      pinScreenConfig: payload.pinScreenConfig ?? existing.pinScreenConfig ?? {},
      themeCustomization:
        payload.themeCustomization ?? existing.themeCustomization ?? DEFAULT_THEME_CUSTOMIZATION,
      slideOrder: payload.slideOrder ?? existing.slideOrder,
      slideVisibility: payload.slideVisibility ?? existing.slideVisibility,
    };
    const updated = this.applyPayloadToConfig(
      id,
      mergedPayload,
      existing.status,
      existing.createdAt,
      new Date().toISOString()
    );
    this.store.set(id, updated);
    return structuredClone(updated);
  }

  async saveDraft(id: string, payload: SaveCardDraftPayload): Promise<EcardConfig> {
    if (!this.store.has(id)) {
      return this.createCard(payload);
    }
    return this.updateCard(id, payload);
  }

  async publishCard(id: string): Promise<PublishCardResult> {
    const existing = await this.getCard(id);
    const now = new Date().toISOString();
    existing.status = 'published';
    existing.updatedAt = now;
    existing.publicUrl = `/ecd/game/${id}`;
    this.store.set(id, existing);

    // Note: Explicitly flags integrationPending so the UI never pretends a live server URL was created.
    return {
      id,
      status: 'published',
      publishedAt: now,
      publicUrl: `/ecd/game/${id}`,
      integrationPending: true,
      message:
        '[Chế độ Demo Frontend] Trạng thái thiệp đã chuyển sang Published trong bộ nhớ tạm. Việc khởi tạo đường dẫn công khai thực tế và lưu trữ mã PIN sẽ do hệ thống Backend (Codex) xử lý.',
    };
  }

  async archiveCard(id: string): Promise<CardSummary> {
    const existing = await this.getCard(id);
    existing.status = 'archived';
    existing.updatedAt = new Date().toISOString();
    this.store.set(id, existing);
    return toSummary(existing);
  }

  async listTemplates(): Promise<TemplateDefinition[]> {
    return structuredClone(AVAILABLE_TEMPLATES);
  }

  private applyPayloadToConfig(
    id: string,
    payload: SaveCardDraftPayload,
    status: EcardConfig['status'],
    createdAt: string,
    updatedAt: string
  ): EcardConfig {
    // Note: payload.newPin is intentionally discarded here in frontend mock mode
    // so plaintext PINs are never persisted in memory, localStorage, or state.
    return {
      schemaVersion: ECARD_SCHEMA_VERSION,
      title: payload.title.trim() || 'Thiệp chưa đặt tên',
      description: payload.description,
      status,
      createdAt,
      updatedAt,
      publicSlug: id,
      publicUrl: status === 'published' ? `/ecd/game/${id}` : undefined,
      slideOrder: payload.slideOrder.length > 0 ? payload.slideOrder : [...DEFAULT_SLIDE_ORDER],
      slideVisibility: payload.slideVisibility,
      ecardData: {
        id,
        female_name: payload.senderName.trim() || 'Người gửi',
        male_name: payload.recipientName.trim() || 'Người nhận',
        love_start_date: payload.loveStartDate || new Date().toISOString(),
        has_pin: payload.hasPin,
        template_id: payload.templateId,
        owner_name: null,
        owner_phone: null,
        owner_addr: null,
        owner_maps: null,
      },
      homepageData: payload.homepageData,
      albumData: payload.albumData.map((item, index) => ({
        ...item,
        ecard_id: id,
        order: index,
      })),
      provinceImages: [],
      letterData: payload.letterData,
      musicData: payload.musicData.map((m) => ({
        ...m,
        ecard_id: id,
      })),
      hasVoice: payload.hasVoice,
      hasVideo: payload.hasVideo,
      videoData: payload.videoData,
      injectionData: [],
      wishboxData: [],
      specialDates: payload.specialDates,
      welcomeConfig: payload.welcomeConfig,
      pinScreenConfig: payload.pinScreenConfig,
      themeCustomization: payload.themeCustomization,
    };
  }
}
