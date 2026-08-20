import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { repo } from '@/data';
import type { CategoryFilter, DateStr, Favorites } from '@/data/types';
import { kstToday, parseDate } from '@/lib/date';
import { computeStreak } from '@/lib/streak';
import { qk } from '@/query/keys';

/* ── 읽기 ────────────────────────────────────────────── */

export function useTodayWords() {
  return useQuery({
    queryKey: qk.todayWords(),
    queryFn: () => repo.getTodayWords(),
  });
}

export function useWordsByDate(date: DateStr | null) {
  return useQuery({
    queryKey: qk.wordsByDate(date ?? ''),
    queryFn: () => repo.getWordsByDate(date!),
    enabled: date !== null,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: qk.categories(),
    queryFn: () => repo.getCategories(),
    staleTime: Infinity, // 카테고리는 사실상 상수
  });
}

export function useVideos(category: CategoryFilter) {
  return useQuery({
    queryKey: qk.videos(category),
    queryFn: () => repo.getVideos(category),
  });
}

export function useAttendance(year: number, month: number) {
  return useQuery({
    queryKey: qk.attendance(year, month),
    queryFn: () => repo.getAttendance(year, month),
  });
}

export function useProfile() {
  return useQuery({
    queryKey: qk.profile(),
    queryFn: () => repo.getProfile(),
  });
}

/** 스트릭 — 프로토타입의 상수 12 를 대체. 출석 기록에서 파생된다 */
export function useStreak() {
  return useQuery({
    queryKey: qk.recentAttendance(),
    queryFn: () => repo.getRecentAttendance(),
    select: (dates) => computeStreak(dates),
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: qk.favorites(),
    queryFn: () => repo.getFavorites(),
  });
}

/* ── 쓰기 ────────────────────────────────────────────── */

type ToggleArgs = { kind: 'words' | 'videos'; id: string; on: boolean };

function applyToggle(favorites: Favorites, { kind, id, on }: ToggleArgs): Favorites {
  const list = favorites[kind];
  const next = on ? (list.includes(id) ? list : [...list, id]) : list.filter((x) => x !== id);
  return { ...favorites, [kind]: next };
}

/**
 * 즐겨찾기 토글 — 낙관적 갱신.
 * 서버 응답을 기다리면 별이 늦게 켜져서 두 번 누르게 된다.
 * 실패하면 되돌리고 토스트로 알린다.
 */
export function useToggleFavorite() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ kind, id, on }: ToggleArgs) =>
      kind === 'words' ? repo.setFavoriteWord(id, on) : repo.setFavoriteVideo(id, on),

    onMutate: async (args) => {
      await qc.cancelQueries({ queryKey: qk.favorites() });
      const prev = qc.getQueryData<Favorites>(qk.favorites());
      if (prev) qc.setQueryData<Favorites>(qk.favorites(), applyToggle(prev, args));
      return { prev };
    },

    onError: (_err, _args, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.favorites(), ctx.prev);
    },

    onSettled: () => {
      void qc.invalidateQueries({ queryKey: qk.favorites() });
    },
  });
}

/** 앱 진입 시 오늘 출석 기록 — 실패해도 UI 를 막지 않는다 */
export function useMarkAttendance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: () => repo.markAttendanceToday(),
    onSuccess: () => {
      const { year, month } = parseDate(kstToday());
      void qc.invalidateQueries({ queryKey: qk.attendance(year, month) });
      void qc.invalidateQueries({ queryKey: qk.recentAttendance() });
    },
  });
}

export { applyToggle };
