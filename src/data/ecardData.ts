export interface EcardMetadata {
  id: string;
  female_name: string;
  male_name: string;
  love_start_date: string;
  has_pin: boolean;
  template_id: string;
  owner_name: string | null;
  owner_phone: string | null;
  owner_addr: string | null;
  owner_maps: string | null;
}

export interface HomepageData {
  avatar_female: string;
  avatar_male: string;
  homepage_image: string;
}

export interface AlbumItem {
  id: string;
  ecard_id: string;
  image_url: string;
  caption: string;
}

export interface LetterData {
  love_letters: string[];
  audio_url: string | null;
  avatars: string[];
}

export interface MusicItem {
  id: string;
  ecard_id: string;
  youtube_id: string;
  title: string;
  created_at: string;
  updated_at: string | null;
  image_url: string;
  caption: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface EcardPreloadData {
  ecardData: EcardMetadata;
  homepageData: HomepageData;
  albumData: AlbumItem[];
  provinceImages: string[];
  letterData: LetterData;
  musicData: MusicItem[];
  hasVoice: boolean;
  hasVideo: boolean;
  videoData: {
    video_url: string | null;
  };
  injectionData: unknown[];
  wishboxData: unknown[];
}

export interface SlideDefinition {
  id: 'homepage' | 'album' | 'music' | 'letter' | 'game' | 'video' | 'setting';
  title: string;
  content?: string;
  bgColor?: string;
  textColor?: string;
  images?: string[];
  backgroundImage?: string;
}

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
    title: 'Ảnh',
    bgColor: 'bg-white',
    textColor: 'text-gray-800',
    images: [],
    backgroundImage: '/template/background-template.jpg',
  },
  {
    id: 'music',
    title: 'Nhạc',
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
  {
    id: 'setting',
    title: 'Cài đặt',
  },
];

export const DEFAULT_ECARD_UUID = '8ae32098-4fc9-4787-9d79-557a03b08532';

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
};

/**
 * Resolves Google Drive image URLs to local cached copies in /user-media/<id>.jpg
 * (matching https://lh3.googleusercontent.com/d/<id>=w1000 byte-for-byte).
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
 * Verifies the 4-digit PIN using dual non-reversible hashes (FNV-1a & DJB2)
 * so the plaintext credential is never stored in source code, logs, or VCS.
 */
const PIN_HASH_FNV1A = 3162167318;
const PIN_HASH_DJB2 = 2088294964;

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
  return h1 === PIN_HASH_FNV1A && h2 === PIN_HASH_DJB2;
}

export function calculateLoveDays(loveStartDate?: string): number {
  const start = new Date(loveStartDate || '2024-06-21');
  const now = new Date();
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diff = now.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
