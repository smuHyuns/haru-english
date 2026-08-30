import type { DateStr } from '@/lib/date';

export type { DateStr, MonthStr } from '@/lib/date';

export interface Word {
  /** slug PK. "on time" → "on-time" */
  id: string;
  en: string;
  /** "[ˈɡroʊ.sər.i]" */
  ipa: string;
  ko: string;
  exEn: string;
  exKo: string;
}

/*
 * 수집한 유튜브 콘텐츠의 성격별 분류 (mds/youtube.md).
 * 프로토타입은 주제별(일상/여행/식당/쇼핑/병원)이었지만, 실제로 확보한 영상 439개가
 * 전부 '생활영어 회화 듣기' 한 종류라 주제 분류가 성립하지 않았다.
 */
export type CategoryId = 'daily' | 'pack' | 'speaking' | 'study';
export type CategoryFilter = CategoryId | 'all';

export interface Category {
  id: CategoryFilter;
  label: string;
  sortOrder: number;
}

export interface Video {
  id: string;
  youtubeId: string | null;
  categoryId: CategoryId;
  title: string;
  /** "Everyday English" */
  channel: string;
  durationSec: number;
  /** null 이면 youtubeId 로 파생한다 (thumbnailUrl 참고) */
  thumbnailUrl: string | null;
}

/**
 * 썸네일 주소. DB 에 담지 않고 영상 ID 로 파생한다 — 유튜브가 규칙을 보장하고,
 * 439행마다 100자짜리 URL 을 중복 저장할 이유가 없다.
 *
 * mqdefault(320×180)를 쓴다. 목록 썸네일이 최대 160px 라 hqdefault(480×360)는
 * 낭비고, default(120×90)는 2배 화면에서 뭉갠다.
 */
export function thumbnailUrl(v: Video): string | null {
  if (v.thumbnailUrl) return v.thumbnailUrl;
  return v.youtubeId ? `https://i.ytimg.com/vi/${v.youtubeId}/mqdefault.jpg` : null;
}

/** 앱 안에서 재생할 때 쓰는 임베드 주소 */
export function youtubeEmbedUrl(youtubeId: string): string {
  // playsinline=1 이 없으면 iOS 가 전체화면 네이티브 플레이어를 띄워 앱 밖으로 나간다
  return `https://www.youtube-nocookie.com/embed/${youtubeId}?playsinline=1&rel=0&modestbranding=1`;
}

/** 유튜브 앱·웹으로 나가는 주소 (임베드가 막힌 영상용 대체 경로) */
export function youtubeWatchUrl(youtubeId: string): string {
  return `https://www.youtube.com/watch?v=${youtubeId}`;
}

/** 표시용 meta 는 저장하지 않고 파생: "8분 · Everyday English" */
export function videoMeta(v: Video): string {
  const min = Math.round(v.durationSec / 60);
  // 몰아듣기는 3시간짜리도 있어 '206분' 으로 적으면 읽히지 않는다
  const h = Math.floor(min / 60);
  const m = min % 60;
  const dur = h === 0 ? `${m}분` : m === 0 ? `${h}시간` : `${h}시간 ${m}분`;
  return `${dur} · ${v.channel}`;
}

export interface AttendanceMonth {
  year: number;
  /** 1~12 */
  month: number;
  /** 출석한 일자 */
  days: number[];
}

export interface Profile {
  userId: string;
  username: string | null;
  /** 캘린더 하한월의 근거 */
  joinedAt: DateStr;
  /** 게스트(익명 로그인) 여부 */
  isAnonymous: boolean;
}

export interface Favorites {
  /** Word.id (slug) */
  words: string[];
  /** Video.id */
  videos: string[];
}
