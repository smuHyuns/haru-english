import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import ToastProvider from '@/components/ToastProvider';
import { VIDEOS } from '@/data/mock/content';
import { videoMeta } from '@/data/types';
import { CURRICULUM_START } from '@/lib/constants';
import { deriveVideoForDay } from '@/lib/curriculum';
import { kstToday } from '@/lib/date';

import Today from './Today';

/*
 * '오늘'을 커리큘럼 시작일로 고정한다.
 * 오늘의 단어가 날짜에서 나오도록 바뀌면서, 고정하지 않으면 이 파일의 기대값이
 * 매일 달라진다. kstToday() 가 이 환경변수를 먼저 본다 (lib/date.ts).
 */
beforeAll(() => vi.stubEnv('VITE_MOCK_TODAY', CURRICULUM_START));
afterAll(() => vi.unstubAllEnvs());

function renderToday() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter>{children}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
  return render(<Today />, { wrapper });
}

describe('오늘 화면', () => {
  it('첫 단어와 카운터를 보여준다', async () => {
    renderToday();
    expect(await screen.findByText('grocery')).toBeInTheDocument();
    expect(screen.getByText('식료품')).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument(); // 하루 세 단어
  });

  it('다음 단어로 넘어간다', async () => {
    renderToday();
    await screen.findByText('grocery');

    await userEvent.click(screen.getByRole('button', { name: '다음 단어' }));
    expect(await screen.findByText('appointment')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });

  it('첫 단어에서 이전을 누르면 마지막 단어로 순환한다', async () => {
    renderToday();
    await screen.findByText('grocery');

    await userEvent.click(screen.getByRole('button', { name: '이전 단어' }));
    expect(await screen.findByText('receipt')).toBeInTheDocument();
    expect(screen.getByText('3 / 3')).toBeInTheDocument();
  });

  it('즐겨찾기를 토글하면 즉시 반영되고 토스트가 뜬다', async () => {
    renderToday();
    await screen.findByText('grocery');

    // grocery 는 시드에 없으므로 처음엔 OFF
    const star = screen.getByRole('button', { name: 'grocery 즐겨찾기' });
    await userEvent.click(star);

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'grocery 즐겨찾기 해제' })).toBeInTheDocument(),
    );
  });

  it('시드 즐겨찾기(receipt)는 켜진 상태로 보인다', async () => {
    renderToday();
    await screen.findByText('grocery');

    // receipt = 3번째 단어
    await userEvent.click(screen.getByRole('button', { name: '다음 단어' }));
    await userEvent.click(screen.getByRole('button', { name: '다음 단어' }));

    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'receipt 즐겨찾기 해제' })).toBeInTheDocument(),
    );
  });

  it('발음 듣기를 누르면 토스트가 뜬다 (jsdom 은 speechSynthesis 미지원)', async () => {
    renderToday();
    await screen.findByText('grocery');

    await userEvent.click(screen.getByRole('button', { name: '발음 듣기' }));
    expect(await screen.findByRole('status')).toHaveTextContent(
      '이 기기는 소리 재생을 지원하지 않아요',
    );
  });

  it('오늘 볼 영상은 날짜로 정해지고, 단어를 넘겨도 바뀌지 않는다', async () => {
    // 예전엔 videos[0] 고정이라 매일 같은 영상이 떴다. 이제 커리큘럼이 날짜를 따라간다.
    const expected = deriveVideoForDay(
      kstToday(),
      VIDEOS.filter((v) => v.categoryId === 'daily'),
    )!;

    renderToday();
    expect(await screen.findByText(expected.title)).toBeInTheDocument();
    expect(screen.getByText(videoMeta(expected))).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '다음 단어' }));
    expect(screen.getByText(expected.title)).toBeInTheDocument();
  });

  it('오늘 볼 영상을 누르면 재생 오버레이가 열린다', async () => {
    const expected = deriveVideoForDay(
      kstToday(),
      VIDEOS.filter((v) => v.categoryId === 'daily'),
    )!;

    renderToday();
    await userEvent.click(await screen.findByRole('button', { name: `${expected.title} 재생` }));
    expect(await screen.findByRole('dialog', { name: expected.title })).toBeInTheDocument();
  });
});
