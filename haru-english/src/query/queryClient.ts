import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { persistQueryClient } from '@tanstack/react-query-persist-client';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      gcTime: WEEK_MS,
      retry: 2,
      refetchOnWindowFocus: false,
      /*
       * Supabase 는 오프라인 기능이 없다.
       * offlineFirst 로 두면 네트워크가 없어도 캐시된 값을 그대로 렌더한다
       * — 핸드오프 README 의 "오프라인 시 즐겨찾기 로컬 캐시 우선 표시" 요구.
       */
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 2,
    },
  },
});

/**
 * 마지막 성공 응답을 localStorage 에 남긴다 → 지하철에서도 앱이 빈 화면이 아니다.
 * 스키마가 바뀌면 buster 를 올려 캐시를 폐기한다.
 */
export function setupPersistence() {
  if (typeof window === 'undefined') return;

  persistQueryClient({
    queryClient,
    persister: createSyncStoragePersister({
      storage: window.localStorage,
      key: 'haru:query:v1',
    }),
    maxAge: WEEK_MS,
    buster: import.meta.env.VITE_APP_VERSION ?? 'dev',
  });
}

/** 로그아웃 시 — 다른 계정에 이전 사용자 데이터가 비치면 안 된다 */
export function clearAllCaches() {
  queryClient.clear();
  try {
    window.localStorage.removeItem('haru:query:v1');
  } catch {
    // 프라이빗 모드 등에서 localStorage 가 막혀 있어도 무시
  }
}
