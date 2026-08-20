import type { Category, Video, Word } from '../types';

/*
 * 프로토타입(일상영어.dc.html)의 데이터 그대로.
 * Supabase seed.sql (mds/04 §5) 과 같은 내용이어야 한다 —
 * 그래야 mock ↔ supabase 를 전환해도 화면이 안 바뀐다.
 */

export const WORDS: Word[] = [
  {
    id: 'grocery',
    en: 'grocery',
    ipa: '[ˈɡroʊ.sər.i]',
    ko: '식료품',
    exEn: 'I need to buy a few grocery items.',
    exKo: '식료품 몇 가지를 사야 해요.',
  },
  {
    id: 'appointment',
    en: 'appointment',
    ipa: '[əˈpɔɪnt.mənt]',
    ko: '약속, 예약',
    exEn: 'I have an appointment at three.',
    exKo: '3시에 예약이 있어요.',
  },
  {
    id: 'receipt',
    en: 'receipt',
    ipa: '[rɪˈsiːt]',
    ko: '영수증',
    exEn: 'Could I get a receipt, please?',
    exKo: '영수증 좀 받을 수 있을까요?',
  },
  {
    id: 'neighbor',
    en: 'neighbor',
    ipa: '[ˈneɪ.bɚ]',
    ko: '이웃',
    exEn: 'My neighbor helped me this morning.',
    exKo: '오늘 아침에 이웃이 저를 도와줬어요.',
  },
  {
    id: 'refreshing',
    en: 'refreshing',
    ipa: '[rɪˈfreʃ.ɪŋ]',
    ko: '상쾌한',
    exEn: 'The morning air feels refreshing.',
    exKo: '아침 공기가 상쾌해요.',
  },
  {
    id: 'refund',
    en: 'refund',
    ipa: '[ˈriː.fʌnd]',
    ko: '환불',
    exEn: 'Can I get a refund for this?',
    exKo: '이거 환불받을 수 있을까요?',
  },
  {
    id: 'pharmacy',
    en: 'pharmacy',
    ipa: '[ˈfɑːr.mə.si]',
    ko: '약국',
    exEn: 'The pharmacy is next to the bank.',
    exKo: '약국은 은행 옆에 있어요.',
  },
  {
    id: 'borrow',
    en: 'borrow',
    ipa: '[ˈbɑː.roʊ]',
    ko: '빌리다',
    exEn: 'May I borrow your pen?',
    exKo: '펜 좀 빌려도 될까요?',
  },
  {
    id: 'crowded',
    en: 'crowded',
    ipa: '[ˈkraʊ.dɪd]',
    ko: '붐비는',
    exEn: 'The bus was very crowded today.',
    exKo: '오늘 버스가 아주 붐볐어요.',
  },
  {
    id: 'leftover',
    en: 'leftover',
    ipa: '[ˈleft.oʊ.vər]',
    ko: '남은 음식',
    exEn: 'I ate the leftover soup.',
    exKo: '남은 국을 먹었어요.',
  },
  {
    id: 'on-time',
    en: 'on time',
    ipa: '[ɑːn taɪm]',
    ko: '제시간에',
    exEn: 'The train arrived on time.',
    exKo: '기차가 제시간에 도착했어요.',
  },
  {
    id: 'chilly',
    en: 'chilly',
    ipa: '[ˈtʃɪl.i]',
    ko: '쌀쌀한',
    exEn: 'It gets chilly at night.',
    exKo: '밤에는 쌀쌀해져요.',
  },
];

export const CATEGORIES: Category[] = [
  { id: 'all', label: '전체', sortOrder: 0 },
  { id: 'daily', label: '일상', sortOrder: 1 },
  { id: 'travel', label: '여행', sortOrder: 2 },
  { id: 'restaurant', label: '식당', sortOrder: 3 },
  { id: 'shopping', label: '쇼핑', sortOrder: 4 },
  { id: 'hospital', label: '병원', sortOrder: 5 },
];

export const VIDEOS: Video[] = [
  {
    id: 'v1',
    youtubeId: null,
    categoryId: 'daily',
    title: '아침에 쓰는 인사 표현 10가지',
    channel: 'Everyday English',
    durationSec: 480,
    thumbnailUrl: null,
  },
  {
    id: 'v2',
    youtubeId: null,
    categoryId: 'travel',
    title: '공항에서 바로 쓰는 문장',
    channel: 'Travel Talk',
    durationSec: 720,
    thumbnailUrl: null,
  },
  {
    id: 'v3',
    youtubeId: null,
    categoryId: 'restaurant',
    title: '카페에서 주문하기',
    channel: 'Slow English',
    durationSec: 360,
    thumbnailUrl: null,
  },
  {
    id: 'v4',
    youtubeId: null,
    categoryId: 'shopping',
    title: '마트에서 물건 찾을 때',
    channel: 'Daily Phrases',
    durationSec: 540,
    thumbnailUrl: null,
  },
  {
    id: 'v5',
    youtubeId: null,
    categoryId: 'daily',
    title: '날씨 이야기로 대화 시작하기',
    channel: 'Small Talk',
    durationSec: 420,
    thumbnailUrl: null,
  },
  {
    id: 'v6',
    youtubeId: null,
    categoryId: 'hospital',
    title: '병원에서 증상 말하기',
    channel: 'Real Life English',
    durationSec: 600,
    thumbnailUrl: null,
  },
];

/** 프로토타입 기본 즐겨찾기 (receipt, appointment / v2) */
export const SEED_FAVORITES = {
  words: ['receipt', 'appointment'],
  videos: ['v2'],
};

/** 가입월 — 캘린더 이동 하한 */
export const JOINED_AT = '2026-05-01';
