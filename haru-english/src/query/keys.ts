import type { CategoryFilter, DateStr } from '@/data/types';

/** 쿼리 키 팩토리 — 문자열 오타로 캐시가 갈리는 걸 막는다 */
export const qk = {
  wordsByDate: (date: DateStr) => ['words', 'date', date] as const,
  // 즐겨찾기 해석 — id 목록이 키의 일부라 별을 껐다 켜면 새로 받는다
  wordsByIds: (ids: string[]) => ['words', 'ids', [...ids].sort().join(',')] as const,
  videosByIds: (ids: string[]) => ['videos', 'ids', [...ids].sort().join(',')] as const,
  categories: () => ['categories'] as const,
  videos: (category: CategoryFilter) => ['videos', category] as const,
  videosByDate: (date: DateStr, count: number) => ['videos', 'date', date, count] as const,
  attendance: (year: number, month: number) => ['attendance', year, month] as const,
  recentAttendance: () => ['attendance', 'recent'] as const,
  profile: () => ['profile'] as const,
  favorites: () => ['favorites'] as const,
};
