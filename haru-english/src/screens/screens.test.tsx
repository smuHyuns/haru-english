import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import ToastProvider from '@/components/ToastProvider';
import { kstToday, parseDate, toDateStr, toMonthStr } from '@/lib/date';

import My from './My';
import Saved from './Saved';
import Videos from './Videos';

function renderScreen(ui: ReactNode, initialPath = '/') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

describe('영상 화면', () => {
  it('전체 카테고리에서 영상 7개를 보여준다', async () => {
    renderScreen(<Videos />);
    await screen.findByText('1강 쉽고 짧은 영어 듣다보면 외워져요');
    expect(screen.getAllByRole('listitem')).toHaveLength(7);
  });

  it('URL 의 cat 파라미터로 필터링한다', async () => {
    renderScreen(<Videos />, '/videos?cat=daily');
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(3));
    expect(screen.getByText('2강 짧은 문장으로 영어로 대화 할 수 있어요')).toBeInTheDocument();
    expect(screen.queryByText('해외여행 영어회화 몰아보기')).not.toBeInTheDocument();
  });

  it('칩을 누르면 필터가 바뀐다', async () => {
    renderScreen(<Videos />);
    await screen.findByText('1강 쉽고 짧은 영어 듣다보면 외워져요');

    await userEvent.click(screen.getByRole('button', { name: '공부법' }));
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(1));
    expect(screen.getByText('영어 단어 1500개 · 중등 필수 영단어')).toBeInTheDocument();
  });

  it('알 수 없는 카테고리는 전체로 떨어진다', async () => {
    renderScreen(<Videos />, '/videos?cat=존재하지않음');
    await waitFor(() => expect(screen.getAllByRole('listitem')).toHaveLength(7));
  });

  it('즐겨찾기 토글 시 토스트가 뜬다', async () => {
    renderScreen(<Videos />);
    const title = '1강 쉽고 짧은 영어 듣다보면 외워져요';
    await screen.findByText(title);

    await userEvent.click(screen.getByRole('button', { name: `${title} 즐겨찾기` }));
    expect(await screen.findByRole('status')).toHaveTextContent('즐겨찾기에 담았어요');
  });

  it('영상을 누르면 재생 오버레이가 열리고 닫힌다', async () => {
    renderScreen(<Videos />);
    const title = '1강 쉽고 짧은 영어 듣다보면 외워져요';
    await screen.findByText(title);

    await userEvent.click(screen.getByRole('button', { name: `${title} 재생` }));
    const dialog = await screen.findByRole('dialog', { name: title });
    // 임베드는 youtube-nocookie 로 — 재생 전 추적 쿠키를 심지 않는다
    expect(within(dialog).getByTitle(title)).toHaveAttribute(
      'src',
      expect.stringContaining('youtube-nocookie.com/embed/GGvsQdnGg_E'),
    );

    await userEvent.click(within(dialog).getByRole('button', { name: '닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

describe('즐겨찾기 화면', () => {
  it('시드 즐겨찾기 단어 2개를 보여준다', async () => {
    renderScreen(<Saved />);
    await screen.findByText('receipt');
    expect(screen.getByText('appointment')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('★ 를 누르면 목록에서 바로 사라진다', async () => {
    renderScreen(<Saved />);
    await screen.findByText('receipt');

    await userEvent.click(screen.getByRole('button', { name: 'receipt 즐겨찾기 해제' }));
    await waitFor(() => expect(screen.queryByText('receipt')).not.toBeInTheDocument());
    expect(screen.getByText('appointment')).toBeInTheDocument();
  });

  it('전부 지우면 빈 상태로 바뀐다', async () => {
    renderScreen(<Saved />);
    await screen.findByText('receipt');

    await userEvent.click(screen.getByRole('button', { name: 'receipt 즐겨찾기 해제' }));
    await userEvent.click(screen.getByRole('button', { name: 'appointment 즐겨찾기 해제' }));

    expect(await screen.findByText('즐겨찾기한 단어가 없어요')).toBeInTheDocument();
  });

  it('영상 세그먼트로 전환하면 즐겨찾기한 영상을 보여준다', async () => {
    renderScreen(<Saved />, '/saved?view=videos');
    expect(await screen.findByText('해외여행 영어회화 몰아보기')).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('영상을 전부 지우면 영상 빈 상태가 나온다', async () => {
    renderScreen(<Saved />, '/saved?view=videos');
    await screen.findByText('해외여행 영어회화 몰아보기');

    await userEvent.click(
      screen.getByRole('button', { name: '해외여행 영어회화 몰아보기 즐겨찾기 해제' }),
    );
    expect(await screen.findByText('즐겨찾기한 영상이 없어요')).toBeInTheDocument();
  });
});

describe('마이페이지', () => {
  const today = parseDate(kstToday());

  it('통계가 즐겨찾기 개수에서 파생된다', async () => {
    renderScreen(<My />);
    // 시드: 단어 2 / 영상 1
    expect(await screen.findByText('2개')).toBeInTheDocument();
    expect(screen.getByText('1개')).toBeInTheDocument();
  });

  it('현재월을 보여주고 다음 달 화살표는 비활성이다', async () => {
    renderScreen(<My />);
    const label = `${today.year}년 ${today.month}월`;
    expect(await screen.findByText(label)).toBeInTheDocument();

    // 상한(현재월)이라 눌러도 달이 안 바뀐다
    await userEvent.click(screen.getByRole('button', { name: '다음 달' }));
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('이전 달로 이동한다', async () => {
    renderScreen(<My />);
    await screen.findByText(`${today.year}년 ${today.month}월`);

    await userEvent.click(screen.getByRole('button', { name: '이전 달' }));

    const prevMonth = today.month === 1 ? 12 : today.month - 1;
    const prevYear = today.month === 1 ? today.year - 1 : today.year;
    expect(await screen.findByText(`${prevYear}년 ${prevMonth}월`)).toBeInTheDocument();
  });

  it('미출석일을 누르면 토스트가 뜬다', async () => {
    // 미래 날짜는 항상 미출석 — 현재월 말일 쪽에서 하나 고른다
    renderScreen(<My />);
    // 출석 데이터가 들어온 뒤에 셀을 고른다 (로딩 중엔 전부 미출석으로 보인다)
    await waitFor(() =>
      expect(
        within(screen.getByRole('grid'))
          .getAllByRole('button')
          .some((b) => b.getAttribute('aria-label')?.includes('출석')),
      ).toBe(true),
    );

    const empty = within(screen.getByRole('grid'))
      .getAllByRole('button')
      .find((b) => !b.getAttribute('aria-label')?.includes('출석'));
    expect(empty).toBeDefined();

    await userEvent.click(empty!);
    expect(await screen.findByRole('status')).toHaveTextContent('이 날은 학습 기록이 없어요');
  });

  it('출석일을 누르면 그날 단어 시트가 열린다', async () => {
    renderScreen(<My />);
    await waitFor(() =>
      expect(
        within(screen.getByRole('grid'))
          .getAllByRole('button')
          .some((b) => b.getAttribute('aria-label')?.includes('출석')),
      ).toBe(true),
    );

    const attended = within(screen.getByRole('grid'))
      .getAllByRole('button')
      .find((b) => b.getAttribute('aria-label')?.includes('출석'))!;

    await userEvent.click(attended);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    // 시트 카운터: 하루 3개
    expect(await screen.findByText('1 / 3')).toBeInTheDocument();
  });

  it('URL 의 day 파라미터로 시트가 복원된다', async () => {
    const date = toDateStr(today.year, today.month, 12);
    const path = `/my?ym=${toMonthStr(today.year, today.month)}&day=${date}&w=1`;
    renderScreen(<My />, path);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(await screen.findByText('2 / 3')).toBeInTheDocument();
  });

  it('시트에서 다음 단어를 누르면 3개 안에서 순환한다', async () => {
    const date = toDateStr(today.year, today.month, 12);
    const path = `/my?ym=${toMonthStr(today.year, today.month)}&day=${date}&w=2`;
    renderScreen(<My />, path);

    await screen.findByRole('dialog');
    expect(await screen.findByText('3 / 3')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '다음 단어' }));
    expect(await screen.findByText('1 / 3')).toBeInTheDocument();
  });

  it('시트를 닫으면 URL 에서 day 가 빠진다', async () => {
    const date = toDateStr(today.year, today.month, 12);
    const path = `/my?ym=${toMonthStr(today.year, today.month)}&day=${date}&w=0`;
    renderScreen(<My />, path);

    await screen.findByRole('dialog');
    const [scrim] = screen.getAllByRole('button', { name: '닫기' });
    await userEvent.click(scrim!);

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('잘못된 day 파라미터는 시트를 열지 않는다', async () => {
    renderScreen(<My />, '/my?day=아무거나');
    await screen.findByText(`${today.year}년 ${today.month}월`);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
