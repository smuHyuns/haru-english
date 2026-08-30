import type { CategoryFilter, DateStr } from '@/data/types';

/** 쿼리 키 팩토리 — 문자열 오타로 캐시가 갈리는 걸 막는다 */
export const qk = {
  todayWords: () => ['words', 'today'] as const,
  wordsByDate: (date: DateStr) => ['words', 'date', date] as const,
  categories: () => ['categories'] as const,
  videos: (category: CategoryFilter) => ['videos', category] as const,
  videoByDate: (date: DateStr) => ['videos', 'date', date] as const,
  attendance: (year: number, month: number) => ['attendance', year, month] as const,
  recentAttendance: () => ['attendance', 'recent'] as const,
  profile: () => ['profile'] as const,
  favorites: () => ['favorites'] as const,
};
