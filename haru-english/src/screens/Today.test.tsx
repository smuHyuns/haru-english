import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import ToastProvider from '@/components/ToastProvider';
import { VIDEOS } from '@/data/mock/content';
import { CURRICULUM_START, TODAY_VIDEOS } from '@/lib/constants';
import { deriveVideosFromDay } from '@/lib/curriculum';
import { kstToday } from '@/lib/date';

import Today from './Today';

/*
 * '오늘'을 커리큘럼 시작일로 고정한다.
 * 오늘의 단어가 날짜에서 나오도록 바뀌면서, 고정하지 않으면 이 파일의 기대값이
 * 매일 달라진다. kstToday() 가 이 환경변수를 먼저 본다 (lib/date.ts).
 */
const DAILY_VIDEOS = VIDEOS.filter((v) => v.categoryId === 'daily');

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

  // 목의 생활회화가 3편뿐이라 TODAY_VIDEOS(5)보다 적다 — 있는 만큼만 나와야 한다
  const expected = () =>
    deriveVideosFromDay(kstToday(), DAILY_VIDEOS, TODAY_VIDEOS);

  it('오늘 볼 영상이 캐러셀로 여러 편 나온다', async () => {
    // 예전엔 videos[0] 한 편 고정이라 매일 같은 영상이 떴다
    const want = expected();
    expect(want).toHaveLength(Math.min(TODAY_VIDEOS, DAILY_VIDEOS.length));

    renderToday();
    await screen.findByText(want[0]!.title);
    for (const v of want) expect(screen.getByText(v.title)).toBeInTheDocument();
  });

  it('첫 카드는 오늘 날짜의 영상이고, 단어를 넘겨도 바뀌지 않는다', async () => {
    const first = expected()[0]!;
    renderToday();

    const track = await screen.findByRole('group', { name: /오늘 볼 영상/ });
    expect(within(track).getAllByRole('button')[0]).toHaveAccessibleName(`${first.title} 재생`);

    await userEvent.click(screen.getByRole('button', { name: '다음 단어' }));
    expect(within(track).getAllByRole('button')[0]).toHaveAccessibleName(`${first.title} 재생`);
  });

  it('점 인디케이터가 편 수만큼 나온다', async () => {
    renderToday();
    await screen.findByText(expected()[0]!.title);
    const dots = screen.getAllByRole('button', { name: /번째 영상 보기/ });
    expect(dots).toHaveLength(expected().length);
    expect(dots[0]).toHaveAttribute('aria-current', 'true');
  });

  it('아무 카드나 누르면 그 영상의 재생 오버레이가 열린다', async () => {
    const second = expected()[1]!;
    renderToday();

    await userEvent.click(await screen.findByRole('button', { name: `${second.title} 재생` }));
    expect(await screen.findByRole('dialog', { name: second.title })).toBeInTheDocument();
  });
});
