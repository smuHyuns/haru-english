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

export type CategoryId = 'daily' | 'travel' | 'restaurant' | 'shopping' | 'hospital';
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
  /** null 이면 스트라이프 플레이스홀더를 그린다 */
  thumbnailUrl: string | null;
}

/** 표시용 meta 는 저장하지 않고 파생: "8분 · Everyday English" */
export function videoMeta(v: Video): string {
  return `${Math.round(v.durationSec / 60)}분 · ${v.channel}`;
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
