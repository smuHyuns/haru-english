import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { repo } from '@/data';
import type { Favorites } from '@/data/types';
import { qk } from '@/query/keys';

import { applyToggle, useFavorites, useToggleFavorite } from './useData';

describe('applyToggle', () => {
  const base: Favorites = { words: ['receipt'], videos: ['v2'] };

  it('켜면 추가된다', () => {
    expect(applyToggle(base, { kind: 'words', id: 'grocery', on: true }).words).toEqual([
      'receipt',
      'grocery',
    ]);
  });

  it('끄면 빠진다', () => {
    expect(applyToggle(base, { kind: 'words', id: 'receipt', on: false }).words).toEqual([]);
  });

  it('이미 있는 걸 또 켜도 중복되지 않는다', () => {
    expect(applyToggle(base, { kind: 'words', id: 'receipt', on: true }).words).toEqual(['receipt']);
  });

  it('다른 종류는 건드리지 않는다', () => {
    const next = applyToggle(base, { kind: 'words', id: 'grocery', on: true });
    expect(next.videos).toEqual(['v2']);
  });

  it('원본을 변형하지 않는다', () => {
    applyToggle(base, { kind: 'words', id: 'grocery', on: true });
    expect(base.words).toEqual(['receipt']);
  });
});

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  return { qc, wrapper };
}

describe('useToggleFavorite — 낙관적 갱신', () => {
  afterEach(() => vi.restoreAllMocks());

  it('서버 응답 전에 즉시 UI 에 반영된다', async () => {
    const { qc, wrapper } = makeWrapper();

    // 서버 응답을 붙잡아 둔다
    let release!: () => void;
    const pending = new Promise<void>((r) => {
      release = r;
    });
    vi.spyOn(repo, 'setFavoriteWord').mockReturnValue(pending);

    const fav = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(fav.result.current.isSuccess).toBe(true));
    expect(fav.result.current.data?.words).not.toContain('grocery');

    const toggle = renderHook(() => useToggleFavorite(), { wrapper });
    act(() => toggle.result.current.mutate({ kind: 'words', id: 'grocery', on: true }));

    // 아직 서버는 응답하지 않았는데 캐시는 이미 바뀌어 있어야 한다
    await waitFor(() =>
      expect(qc.getQueryData<Favorites>(qk.favorites())?.words).toContain('grocery'),
    );

    release();
  });

  it('실패하면 이전 상태로 되돌린다', async () => {
    const { qc, wrapper } = makeWrapper();
    vi.spyOn(repo, 'setFavoriteWord').mockRejectedValue(new Error('네트워크 끊김'));

    const fav = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(fav.result.current.isSuccess).toBe(true));
    const before = qc.getQueryData<Favorites>(qk.favorites())!.words;

    const toggle = renderHook(() => useToggleFavorite(), { wrapper });
    act(() => toggle.result.current.mutate({ kind: 'words', id: 'grocery', on: true }));

    await waitFor(() => expect(toggle.result.current.isError).toBe(true));
    await waitFor(() =>
      expect(qc.getQueryData<Favorites>(qk.favorites())?.words).toEqual(before),
    );
  });

  it('영상 토글은 단어 목록을 건드리지 않는다', async () => {
    const { qc, wrapper } = makeWrapper();
    vi.spyOn(repo, 'setFavoriteVideo').mockResolvedValue(undefined);

    const fav = renderHook(() => useFavorites(), { wrapper });
    await waitFor(() => expect(fav.result.current.isSuccess).toBe(true));
    const words = qc.getQueryData<Favorites>(qk.favorites())!.words;

    const toggle = renderHook(() => useToggleFavorite(), { wrapper });
    act(() => toggle.result.current.mutate({ kind: 'videos', id: 'v1', on: true }));

    await waitFor(() => expect(toggle.result.current.isSuccess).toBe(true));
    expect(qc.getQueryData<Favorites>(qk.favorites())?.words).toEqual(words);
  });
});
