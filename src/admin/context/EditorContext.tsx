import React, { createContext, useCallback, useContext, useState } from 'react';
import {
  AVAILABLE_TEMPLATES,
  DEFAULT_ECARD_CONFIG,
  DEFAULT_SLIDE_ORDER,
  DEFAULT_THEME_CUSTOMIZATION,
} from '../../data/ecardData';
import {
  EcardConfig,
  ECARD_SCHEMA_VERSION,
  SaveCardDraftPayload,
  SlideId,
} from '../../types/ecard';

export type EditorTabId =
  | 'basic'
  | 'media'
  | 'content'
  | 'template'
  | 'access'
  | 'publish';

export interface PinFormState {
  pin: string;
  confirmPin: string;
  touched: boolean;
}

interface EditorContextValue {
  editingCardId: string | null;
  draft: SaveCardDraftPayload;
  pinForm: PinFormState;
  activeTab: EditorTabId;
  isDirty: boolean;
  lastSavedAt: string | null;
  setActiveTab: (tab: EditorTabId) => void;
  setPinForm: React.Dispatch<React.SetStateAction<PinFormState>>;
  initializeNewCard: () => void;
  initializeFromCard: (card: EcardConfig) => void;
  updateDraft: (updater: (prev: SaveCardDraftPayload) => SaveCardDraftPayload) => void;
  markSaved: (cardId: string) => void;
  toPreviewConfig: () => EcardConfig;
}

function createEmptyDraft(): SaveCardDraftPayload {
  return {
    title: 'Kỷ niệm Tình yêu — Thiệp mới',
    description: 'Món quà kỹ thuật số lưu giữ những khoảnh khắc ngọt ngào',
    recipientName: 'Người nhận',
    senderName: 'Người gửi',
    loveStartDate: '2025-02-14',
    templateId: AVAILABLE_TEMPLATES[0].id,
    hasPin: true,
    homepageData: {
      avatar_female: '/template/image-1.jpg',
      avatar_male: '/template/image-2.jpg',
      homepage_image: '/template/image-3.jpg',
      tagline: 'Lưu giữ từng khoảnh khắc bên nhau',
    },
    albumData: [
      {
        id: 'draft-img-1',
        ecard_id: 'draft-preview',
        image_url: '/template/image-1.jpg',
        caption: 'Ngày đầu tiên bên nhau 💖',
        order: 0,
      },
      {
        id: 'draft-img-2',
        ecard_id: 'draft-preview',
        image_url: '/template/image-2.jpg',
        caption: 'Nụ cười ấm áp của cậu',
        order: 1,
      },
      {
        id: 'draft-img-3',
        ecard_id: 'draft-preview',
        image_url: '/template/image-3.jpg',
        caption: 'Chuyến đi đáng nhớ',
        order: 2,
      },
    ],
    letterData: {
      love_letters: [
        'Cảm ơn cậu vì đã bước vào cuộc đời tớ và mang theo thật nhiều niềm vui.',
        'Mỗi khoảnh khắc bên cậu đều trở thành kỷ niệm đẹp đẽ mà tớ muốn lưu giữ mãi.',
        'Chúc cho tụi mình luôn nắm chặt tay nhau trên mọi chặng đường sắp tới nhé! ❤️',
      ],
      audio_url: null,
      avatars: ['/template/image-1.jpg', '/template/image-2.jpg'],
    },
    musicData: [
      {
        id: 'draft-music-1',
        ecard_id: 'draft-preview',
        youtube_id: 'JgTZvDbaTtg',
        title: 'Một Đời',
        artist: 'Duni',
        quote: 'Love you to the saturn and back',
        audio_url: null,
        created_at: new Date().toISOString(),
        updated_at: null,
        image_url: '/template/image-4.jpg',
        caption: null,
        is_deleted: false,
        deleted_at: null,
      },
    ],
    videoData: {
      video_url: null,
    },
    hasVoice: false,
    hasVideo: false,
    specialDates: [
      {
        id: 'draft-ms-1',
        date: '2025-02-14',
        title: 'Ngày bắt đầu yêu',
        description: 'Cột mốc đầu tiên mở ra hành trình hạnh phúc của hai đứa.',
        badge: 'Kỷ niệm',
      },
    ],
    welcomeConfig: {
      heading: 'Món quà bí mật',
      subheading: 'Dành tặng riêng cho người đặc biệt nhất',
      buttonLabel: 'Bắt đầu',
      backgroundImage: '/template/background-welcome.png',
    },
    pinScreenConfig: {
      heading: 'Mở khóa kỷ niệm',
      subheading: 'Bất ngờ cho cậu nà 😜',
      backgroundImage: '/template/background-template.jpg',
    },
    themeCustomization: { ...DEFAULT_THEME_CUSTOMIZATION },
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
  };
}

export function cardConfigToDraftPayload(card: EcardConfig): SaveCardDraftPayload {
  return {
    title: card.title,
    description: card.description || '',
    recipientName: card.ecardData.male_name,
    senderName: card.ecardData.female_name,
    loveStartDate: card.ecardData.love_start_date.slice(0, 10),
    templateId: card.ecardData.template_id,
    hasPin: card.ecardData.has_pin,
    homepageData: structuredClone(card.homepageData),
    albumData: structuredClone(card.albumData),
    letterData: structuredClone(card.letterData),
    musicData: structuredClone(card.musicData),
    videoData: structuredClone(card.videoData),
    hasVoice: card.hasVoice,
    hasVideo: card.hasVideo,
    specialDates: structuredClone(card.specialDates || []),
    welcomeConfig: structuredClone(
      card.welcomeConfig || {
        heading: 'Món quà bí mật',
        subheading: 'Dành tặng người đặc biệt',
        buttonLabel: 'Bắt đầu',
        backgroundImage: '/template/background-welcome.png',
      }
    ),
    pinScreenConfig: structuredClone(
      card.pinScreenConfig || {
        heading: 'Mở khóa kỷ niệm',
        subheading: 'Bất ngờ cho cậu nà 😜',
        backgroundImage: '/template/background-template.jpg',
      }
    ),
    themeCustomization: structuredClone(
      card.themeCustomization || DEFAULT_THEME_CUSTOMIZATION
    ),
    slideOrder:
      card.slideOrder && card.slideOrder.length > 0
        ? [...card.slideOrder]
        : [...DEFAULT_SLIDE_ORDER],
    slideVisibility: {
      homepage: true,
      album: true,
      music: true,
      letter: true,
      timeline: false,
      game: true,
      video: card.hasVideo,
      setting: true,
      ...(card.slideVisibility || {}),
    },
  };
}

const EditorContext = createContext<EditorContextValue | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SaveCardDraftPayload>(() => createEmptyDraft());
  const [pinForm, setPinForm] = useState<PinFormState>({
    pin: '',
    confirmPin: '',
    touched: false,
  });
  const [activeTab, setActiveTab] = useState<EditorTabId>('basic');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const initializeNewCard = useCallback(() => {
    setEditingCardId('new');
    setDraft(createEmptyDraft());
    setPinForm({ pin: '', confirmPin: '', touched: false });
    setActiveTab('basic');
    setIsDirty(false);
    setLastSavedAt(null);
  }, []);

  const initializeFromCard = useCallback((card: EcardConfig) => {
    setEditingCardId(card.ecardData.id);
    setDraft(cardConfigToDraftPayload(card));
    setPinForm({ pin: '', confirmPin: '', touched: false });
    setIsDirty(false);
    setLastSavedAt(card.updatedAt);
  }, []);

  const updateDraft = useCallback(
    (updater: (prev: SaveCardDraftPayload) => SaveCardDraftPayload) => {
      setDraft((prev) => updater(prev));
      setIsDirty(true);
    },
    []
  );

  const markSaved = useCallback((cardId: string) => {
    setEditingCardId(cardId);
    setIsDirty(false);
    setLastSavedAt(new Date().toISOString());
  }, []);

  const toPreviewConfig = useCallback((): EcardConfig => {
    const id =
      editingCardId && editingCardId !== 'new' ? editingCardId : DEFAULT_ECARD_CONFIG.ecardData.id;
    const now = new Date().toISOString();
    const slideOrder: SlideId[] =
      draft.slideOrder && draft.slideOrder.length > 0
        ? draft.slideOrder
        : [...DEFAULT_SLIDE_ORDER];

    return {
      schemaVersion: ECARD_SCHEMA_VERSION,
      title: draft.title || 'Thiệp Xem Trước',
      description: draft.description,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      slideOrder,
      slideVisibility: draft.slideVisibility,
      ecardData: {
        id,
        female_name: draft.senderName || 'Người gửi',
        male_name: draft.recipientName || 'Người nhận',
        love_start_date: draft.loveStartDate || now,
        has_pin: draft.hasPin,
        template_id: draft.templateId,
        owner_name: null,
        owner_phone: null,
        owner_addr: null,
        owner_maps: null,
      },
      homepageData: draft.homepageData,
      albumData: draft.albumData,
      provinceImages: [],
      letterData: draft.letterData,
      musicData: draft.musicData,
      hasVoice: draft.hasVoice,
      hasVideo: draft.hasVideo,
      videoData: draft.videoData,
      injectionData: [],
      wishboxData: [],
      specialDates: draft.specialDates,
      welcomeConfig: draft.welcomeConfig,
      pinScreenConfig: draft.pinScreenConfig,
      themeCustomization: draft.themeCustomization,
    };
  }, [draft, editingCardId]);

  return (
    <EditorContext.Provider
      value={{
        editingCardId,
        draft,
        pinForm,
        activeTab,
        isDirty,
        lastSavedAt,
        setActiveTab,
        setPinForm,
        initializeNewCard,
        initializeFromCard,
        updateDraft,
        markSaved,
        toPreviewConfig,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export function useEditor(): EditorContextValue {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return ctx;
}
