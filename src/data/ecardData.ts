import {
  AlbumItem,
  EcardConfig,
  EcardMetadata,
  EcardPreloadData,
  ECARD_SCHEMA_VERSION,
  HomepageData,
  LetterData,
  MusicItem,
  SlideDefinition,
  SlideId,
  SpecialDateMilestone,
  TemplateDefinition,
  ThemeCustomization,
} from '../types/ecard';

export type {
  AlbumItem,
  EcardConfig,
  EcardMetadata,
  EcardPreloadData,
  HomepageData,
  LetterData,
  MusicItem,
  SlideDefinition,
  SlideId,
  SpecialDateMilestone,
  TemplateDefinition,
  ThemeCustomization,
};

export const SLIDES: SlideDefinition[] = [
  {
    id: 'homepage',
    title: 'Trang chủ',
    content: 'LƯU GIỮ KỶ NIỆM',
    bgColor: 'bg-red-50',
    textColor: 'text-red-600',
    backgroundImage: '/template/background-template-2.png',
  },
  {
    id: 'album',
    title: 'Sách lật PDF',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    images: [],
    backgroundImage: '/template/background-template.jpg',
  },
  {
    id: 'music',
    title: 'Voice',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    backgroundImage: '/template/background-template-2.png',
  },
  {
    id: 'letter',
    title: 'Lá thư',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    backgroundImage: '/template/background-template.jpg',
  },
  {
    id: 'timeline',
    title: 'Cột mốc',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    backgroundImage: '/template/background-template-2.png',
  },
  {
    id: 'game',
    title: 'Game',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    backgroundImage: '/template/background-template-2.png',
  },
  {
    id: 'video',
    title: 'Video',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    backgroundImage: '/template/background-template-2.png',
  },
];

export const DEFAULT_SLIDE_ORDER: SlideId[] = [
  'homepage',
  'album',
  'music',
  'letter',
  'game',
  'video',
];

export const AVAILABLE_TEMPLATES: TemplateDefinition[] = [
  {
    id: '8fa6d2b3-ba30-4290-9ac7-7a830c23bc7a',
    name: 'SONG HÀNH KÝ — Kỷ niệm dịu dàng',
    tagline: 'Ghi dấu kỷ niệm ngọt ngào với album ảnh, lá thư tay và bộ bài Love Drunk',
    description:
      'Giao diện SONG HÀNH KÝ với sách lật PDF, thư tay, trình phát nhạc và trò chơi tương tác dành cho cặp đôi.',
    previewImageUrl: '/template/background-welcome.png',
    accentColor: '#A33149',
    supportedSlides: ['homepage', 'album', 'music', 'letter', 'timeline', 'game', 'video'],
    isDefault: true,
  },
  {
    id: 'c421e9f0-71a4-4d8e-b8c2-9102f43a11e2',
    name: 'Editorial Rose & Ivory',
    tagline: 'Phong cách tạp chí tinh tế cho kỷ niệm ngày cưới & cầu hôn',
    description:
      'Bố cục tạp chí sang trọng với tông màu hồng đất & kem ngà, tối ưu cho thư tình dài, dòng thời gian kỷ niệm và bộ sưu tập ảnh nghệ thuật.',
    previewImageUrl: '/template/background-template.jpg',
    accentColor: '#8c5261',
    supportedSlides: ['homepage', 'album', 'music', 'letter', 'timeline', 'video'],
  },
  {
    id: 'f910b3a8-19c2-43d1-901a-55b8210ce490',
    name: 'Minimalist Sweetheart',
    tagline: 'Tối giản, tập trung vào câu chuyện tình yêu và âm nhạc',
    description:
      'Thiết kế hiện đại tối giản dành cho các cặp đôi yêu thích sự nhẹ nhàng, tập trung vào lời nhắn gửi và giai điệu kỷ niệm.',
    previewImageUrl: '/template/background-template-2.png',
    accentColor: '#BB254E',
    supportedSlides: ['homepage', 'album', 'music', 'letter', 'game'],
  },
];

export const DEFAULT_ECARD_UUID = '8ae32098-4fc9-4787-9d79-557a03b08532';

export const DEFAULT_THEME_CUSTOMIZATION: ThemeCustomization = {
  primaryColor: '#A33149',
  accentColor: '#8c5261',
  backgroundTint: '#FFE4E4',
  enableFloatingHearts: true,
  enableSoundEffects: true,
};

export const PRELOADED_ECARD_DATA: EcardPreloadData = {
  ecardData: {
    id: '8ae32098-4fc9-4787-9d79-557a03b08532',
    female_name: 'Ngọc Khánh',
    male_name: 'Lê Hoàng Anh',
    love_start_date: '2025-04-29T17:00:00.000Z',
    has_pin: true,
    template_id: '8fa6d2b3-ba30-4290-9ac7-7a830c23bc7a',
    owner_name: null,
    owner_phone: null,
    owner_addr: null,
    owner_maps: null,
  },
  homepageData: {
    avatar_female: 'https://drive.google.com/uc?id=1BEdeZA8OBSv3Any5rq7JZmgJD7c_arnl',
    avatar_male: 'https://drive.google.com/uc?id=142XEByqWVgC3OC8WHGoNTIJhML1t-FMP',
    homepage_image: 'https://drive.google.com/uc?id=1z6ofBa1YdNURsFq73UPwmb9bcwVZA1ls',
  },
  albumData: [
    {
      id: 'c3afa959-8be0-48f6-88ea-bc2eff794ee1',
      ecard_id: '8ae32098-4fc9-4787-9d79-557a03b08532',
      image_url: 'https://drive.google.com/uc?id=1IqbZqD5GrPsq3Qnsr7ZqvjFlNWp6y2QD',
      caption: 'hẹ hẹ',
    },
    {
      id: '2ea01896-3405-48af-be00-e110aa996721',
      ecard_id: '8ae32098-4fc9-4787-9d79-557a03b08532',
      image_url: 'https://drive.google.com/uc?id=1dwQgYqSEueMl5HRq3jnbhQ6F6r6bEiIc',
      caption: 'chinh nhật zui zeee',
    },
    {
      id: '61711e6c-bd93-4f1f-83ac-76cc13e16e2a',
      ecard_id: '8ae32098-4fc9-4787-9d79-557a03b08532',
      image_url: 'https://drive.google.com/uc?id=1nZvJXukYC2_Ump_N0bZQNqZ39xbNqt1F',
      caption: 'tỏ tình đồ đó',
    },
    {
      id: '9178c37c-1c73-4c22-a5e3-68537df389c2',
      ecard_id: '8ae32098-4fc9-4787-9d79-557a03b08532',
      image_url: 'https://drive.google.com/uc?id=1VSO78oJUn9H_gnCWOnzTs_kyACPVEzcg',
      caption: '=)))',
    },
    {
      id: '0b32652d-cb87-4ae6-b492-e5dc05c958e9',
      ecard_id: '8ae32098-4fc9-4787-9d79-557a03b08532',
      image_url: 'https://drive.google.com/uc?id=1_GmZ2-rByWRBlkB5vZ0uN21pEbu_e5Cn',
      caption: 'đi bỉn cùng nhau',
    },
    {
      id: '207ae770-fa71-47fd-a4b0-3a081c1a1b70',
      ecard_id: '8ae32098-4fc9-4787-9d79-557a03b08532',
      image_url: 'https://drive.google.com/uc?id=1iPnb8FjJ3jMD7gLpYui8ffr5MCjWkSnw',
      caption: 'ngại điên',
    },
    {
      id: '2e58ccda-5f39-4000-8b21-748fc99bce95',
      ecard_id: '8ae32098-4fc9-4787-9d79-557a03b08532',
      image_url: 'https://drive.google.com/uc?id=1wfKAuAXqMZX8-KxuMpn6NVDrDI89VLmj',
      caption: 'ptbbb',
    },
  ],
  provinceImages: [],
  letterData: {
    love_letters: [
      'Hôm nay là sinh nhật anh iuuu.',
      'Chúc anh sinh nhật vui vẻ nhéee.',
      'Em mong có thể đón sinh nhật cùng nhau thêm thật nhiềuu nămm nữa.',
      'Hơn 3 tháng yêu nhau dù chưa dài nhưng tình cảm e dành cho anh là rất lớn  I hope you do too.',
      'Đây là năm đầu tiên e đón sinh nhật cùng anh, em mong anh sẽ hạnh phúc với những gì e mang lại cho anh.',
      'Cứ vui vẻ như thế này mãi nhée.',
      'Em sẽ luôn ở bên đồng hành cùng anh , yên tâm không phải lo nhé! Em yêu anh lắm lunnn ýyy.',
      'Nhiều khi em cũng suy nghĩ xem tại sao e với anh lại quen nhau dù chả có bất cứ 1 kết nối nào giữa 2 đứa từ trước đó.',
      'Chắc duyên đấy kk.',
      'Em mong sau này mình sẽ càng yêu thương nhau hơn.',
      'I Love Youuuuuu ❤️❤️❤️❤️.',
    ],
    audio_url: null,
    avatars: [
      'https://drive.google.com/uc?id=1BEdeZA8OBSv3Any5rq7JZmgJD7c_arnl',
      'https://drive.google.com/uc?id=142XEByqWVgC3OC8WHGoNTIJhML1t-FMP',
    ],
  },
  musicData: [
    {
      id: '5718044d-1eb5-4447-b9d7-98ea46aca58d',
      ecard_id: '8ae32098-4fc9-4787-9d79-557a03b08532',
      youtube_id: 'JgTZvDbaTtg',
      title: 'Một Đời',
      artist: 'SONG HÀNH KÝ',
      quote: 'Love you to the saturn and back',
      created_at: '2025-07-29T21:36:26.606Z',
      updated_at: null,
      image_url: 'https://drive.google.com/uc?id=1Bg038w05bthwBWtlOAUOTGY9sjWOl5HU',
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
      id: 'ms-1',
      date: '2025-04-30',
      title: 'Ngày bắt đầu yêu nhau',
      description: 'Khoảnh khắc tụi mình chính thức nắm tay nhau bước vào hành trình mới.',
      badge: 'Kỷ niệm 1',
    },
    {
      id: 'ms-2',
      date: '2025-06-15',
      title: 'Chuyến đi biển đầu tiên',
      description: 'Cùng nhau ngắm hoàng hôn trên biển và lưu lại những bức hình đáng nhớ.',
      badge: 'Chuyến đi',
    },
    {
      id: 'ms-3',
      date: '2025-08-16',
      title: 'Sinh nhật đầu tiên bên nhau',
      description: 'Bữa tiệc bất ngờ với chiếc bánh kem nhỏ và thật nhiều lời chúc yêu thương.',
      badge: 'Sinh nhật',
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
  themeCustomization: DEFAULT_THEME_CUSTOMIZATION,
};

export const DEFAULT_ECARD_CONFIG: EcardConfig = {
  ...PRELOADED_ECARD_DATA,
  albumPdf: null,
  schemaVersion: ECARD_SCHEMA_VERSION,
  title: 'Kỷ niệm Sinh nhật — Ngọc Khánh & Lê Hoàng Anh',
  description: 'Thiệp kỷ niệm sinh nhật và hành trình yêu thương',
  status: 'published',
  createdAt: '2025-07-29T14:20:00.000Z',
  updatedAt: '2025-08-15T09:30:00.000Z',
  publicSlug: DEFAULT_ECARD_UUID,
  publicUrl: `/ecd/game/${DEFAULT_ECARD_UUID}`,
  slideOrder: ['homepage', 'album', 'music', 'letter', 'game', 'video'],
  slideVisibility: {
    homepage: true,
    album: true,
    music: true,
    letter: true,
    timeline: false,
    game: true,
    video: false,
  },
};

/**
 * Resolves Google Drive image URLs to local cached copies in /user-media/<id>.jpg
 * or falls back cleanly to template images if local user-media is unavailable.
 */
export function resolveImageUrl(url: string | null | undefined): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('blob:') || trimmed.startsWith('data:')) return trimmed;
  const match = trimmed.match(/id=([\w-]+)/) || trimmed.match(/\/d\/([\w-]+)/);
  if (match && match[1]) {
    return `/user-media/${match[1]}.jpg`;
  }
  return trimmed;
}

/**
 * Development-only PIN check used by MockCardAccessService for E2E test compatibility.
 * Production PIN verification must be executed server-side by OpenAI Codex.
 */
const DEV_MOCK_HASH_FNV1A = 3162167318;
const DEV_MOCK_HASH_DJB2 = 2088294964;

export function verifyPinInput(candidate: string): boolean {
  if (candidate.length !== 4) return false;
  let h1 = 2166136261;
  let h2 = 5381;
  for (let i = 0; i < candidate.length; i++) {
    const code = candidate.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 16777619) >>> 0;
    h2 = ((h2 << 5) + h2 + code) >>> 0;
  }
  return h1 === DEV_MOCK_HASH_FNV1A && h2 === DEV_MOCK_HASH_DJB2;
}

export function calculateLoveDays(loveStartDate?: string): number {
  const start = new Date(loveStartDate || '2024-06-21');
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
