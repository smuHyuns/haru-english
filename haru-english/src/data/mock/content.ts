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
  { id: 'daily', label: '생활회화', sortOrder: 1 },
  { id: 'pack', label: '몰아듣기', sortOrder: 2 },
  { id: 'speaking', label: '말하기', sortOrder: 3 },
  { id: 'study', label: '공부법', sortOrder: 4 },
];

/*
 * 실제 콘텐츠(439개)의 축소판. supabase 시드에서 카테고리마다 앞쪽 몇 개를 그대로 뽑았다.
 * 목표는 '적당한 가짜'가 아니라 '진짜의 일부' — 제목 길이·회차 표기·유튜브 ID 형식이
 * 실물과 같아야 목으로 개발한 화면이 배포에서 안 깨진다.
 */
export const VIDEOS: Video[] = [
  {
    id: 'GGvsQdnGg_E',
    youtubeId: 'GGvsQdnGg_E',
    categoryId: 'daily',
    title: '1강 쉽고 짧은 영어 듣다보면 외워져요',
    channel: '1일1영어',
    durationSec: 1197,
    thumbnailUrl: null,
  },
  {
    id: 'w15gqcNBJ2Q',
    youtubeId: 'w15gqcNBJ2Q',
    categoryId: 'daily',
    title: '2강 짧은 문장으로 영어로 대화 할 수 있어요',
    channel: '1일1영어',
    durationSec: 1142,
    thumbnailUrl: null,
  },
  {
    id: 'HmhlNSLTrHE',
    youtubeId: 'HmhlNSLTrHE',
    categoryId: 'daily',
    title: '3강 꾸준히 듣고 따라하면 영어 말할 수 있어요',
    channel: '1일1영어',
    durationSec: 1175,
    thumbnailUrl: null,
  },
  {
    id: 'KbrHRTzpO-k',
    youtubeId: 'KbrHRTzpO-k',
    categoryId: 'pack',
    title: '영어회화 1000문장 영어 잘하고 싶으면 꼭 들으세요',
    channel: '1일1영어',
    durationSec: 19151,
    thumbnailUrl: null,
  },
  {
    id: 'cgQK_ylwiEY',
    youtubeId: 'cgQK_ylwiEY',
    categoryId: 'pack',
    title: '해외여행 영어회화 몰아보기',
    channel: '주아쌤_소리튠영어',
    durationSec: 3383,
    thumbnailUrl: null,
  },
  {
    id: 'CzpI0bgBXU0',
    youtubeId: 'CzpI0bgBXU0',
    categoryId: 'speaking',
    title: '영어 소리튜닝 프로젝트 Day 1',
    channel: '주아쌤_소리튠영어',
    durationSec: 959,
    thumbnailUrl: null,
  },
  {
    id: 'q88YW7elHOM',
    youtubeId: 'q88YW7elHOM',
    categoryId: 'study',
    title: '영어 단어 1500개 · 중등 필수 영단어',
    channel: '기초영어 Step by Step',
    durationSec: 12392,
    thumbnailUrl: null,
  },
];

/** 프로토타입 기본 즐겨찾기 (단어 2개 + 영상 1개) */
export const SEED_FAVORITES = {
  words: ['receipt', 'appointment'],
  videos: ['cgQK_ylwiEY'],
};

/** 가입월 — 캘린더 이동 하한 */
export const JOINED_AT = '2026-05-01';
