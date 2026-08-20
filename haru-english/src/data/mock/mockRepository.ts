import { PER_DAY } from '@/lib/constants';
import { addDays, daysInMonth, kstToday, parseDate } from '@/lib/date';

import type { Repository } from '../repository';
import type {
  AttendanceMonth,
  Category,
  CategoryFilter,
  DateStr,
  Favorites,
  Profile,
  Video,
  Word,
} from '../types';
import { CATEGORIES, JOINED_AT, SEED_FAVORITES, VIDEOS, WORDS } from './content';

/*
 * 목 어댑터.
 *
 * Supabase 프로젝트 없이 Phase 5(화면 구현)까지 완주하기 위한 것이고,
 * 테스트에서도 계속 쓴다. 쓰기는 메모리에만 반영된다 (새로고침하면 시드로 복귀).
 */

/** 프로토타입과 같은 결정론적 규칙: WORDS[(일자 * 3 + slot) % 12] */
function wordsForDay(date: DateStr): Word[] {
  const { day } = parseDate(date);
  return Array.from({ length: PER_DAY }, (_, slot) => {
    const w = WORDS[(day * PER_DAY + slot) % WORDS.length];
    // WORDS 는 비어 있지 않으므로 항상 존재한다
    return w!;
  });
}

/**
 * 출석 시드.
 *   미래월 / 가입월 이전 → 없음
 *   그 외 → (일자*7 + 월*3) % 5 !== 0 인 날 (프로토타입 의사난수 규칙)
 *   현재월은 오늘까지만, 그리고 오늘은 항상 출석으로 친다.
 */
function seedAttendance(year: number, month: number): number[] {
  const today = parseDate(kstToday());
  const joined = parseDate(JOINED_AT);

  const cmp = (y: number, m: number) => y * 12 + m;
  if (cmp(year, month) > cmp(today.year, today.month)) return [];
  if (cmp(year, month) < cmp(joined.year, joined.month)) return [];

  const isCurrent = year === today.year && month === today.month;
  const last = isCurrent ? today.day : daysInMonth(year, month);

  const days: number[] = [];
  for (let d = 1; d <= last; d++) {
    if ((d * 7 + month * 3) % 5 !== 0) days.push(d);
  }
  if (isCurrent && !days.includes(today.day)) days.push(today.day);
  return days;
}

/** 테스트에서 시드 상태로 되돌릴 수 있게 __reset 을 달아 둔다 (앱 코드에는 노출 안 됨) */
export type MockRepository = Repository & { __reset(): void };

function createMockRepository(): MockRepository {
  // 메모리 상태 — 모듈 스코프가 아니라 클로저에 둬서 인스턴스끼리 격리된다
  let favorites: Favorites = { words: [], videos: [] };
  let attendance = new Map<string, number[]>();

  function reset() {
    favorites = {
      words: [...SEED_FAVORITES.words],
      videos: [...SEED_FAVORITES.videos],
    };
    attendance = new Map<string, number[]>();
  }
  reset();

  const monthKey = (y: number, m: number) => `${y}-${m}`;

  function daysOf(year: number, month: number): number[] {
    const key = monthKey(year, month);
    let days = attendance.get(key);
    if (!days) {
      days = seedAttendance(year, month);
      attendance.set(key, days);
    }
    return days;
  }

  function toggle(list: string[], id: string, on: boolean) {
    const i = list.indexOf(id);
    if (on && i < 0) list.push(id);
    if (!on && i >= 0) list.splice(i, 1);
  }

  return {
    __reset: reset,

    async getTodayWords(): Promise<Word[]> {
      return WORDS;
    },

    async getWordsByDate(date: DateStr): Promise<Word[]> {
      return wordsForDay(date);
    },

    async getCategories(): Promise<Category[]> {
      return CATEGORIES;
    },

    async getVideos(category: CategoryFilter): Promise<Video[]> {
      return category === 'all' ? VIDEOS : VIDEOS.filter((v) => v.categoryId === category);
    },

    async getAttendance(year: number, month: number): Promise<AttendanceMonth> {
      return { year, month, days: [...daysOf(year, month)] };
    },

    async getRecentAttendance(days = 120): Promise<DateStr[]> {
      const today = kstToday();
      const out: DateStr[] = [];
      for (let i = 0; i < days; i++) {
        const date = addDays(today, -i);
        const { year, month, day } = parseDate(date);
        if (daysOf(year, month).includes(day)) out.push(date);
      }
      return out;
    },

    async markAttendanceToday(): Promise<void> {
      const { year, month, day } = parseDate(kstToday());
      const days = daysOf(year, month);
      if (!days.includes(day)) days.push(day);
    },

    async getProfile(): Promise<Profile> {
      return {
        userId: 'mock-user',
        username: null,
        joinedAt: JOINED_AT,
        isAnonymous: true,
      };
    },

    async getFavorites(): Promise<Favorites> {
      return { words: [...favorites.words], videos: [...favorites.videos] };
    },

    async setFavoriteWord(wordId: string, on: boolean): Promise<void> {
      toggle(favorites.words, wordId, on);
    },

    async setFavoriteVideo(videoId: string, on: boolean): Promise<void> {
      toggle(favorites.videos, videoId, on);
    },
  };
}

export const mockRepository = createMockRepository();

/** 테스트에서 깨끗한 인스턴스가 필요할 때 */
export { createMockRepository };

/** 시드 규칙을 테스트에서 직접 검증하려고 노출 */
export { seedAttendance, wordsForDay };
