import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import BottomSheet, { SheetDots } from './BottomSheet';
import Button from './Button';
import { Chip, ChipRow } from './Chip';
import IconButton from './IconButton';
import Segmented from './Segmented';
import { EmptyState } from './Surface';
import { Star } from './icons';
import ToastProvider from './ToastProvider';
import { useToast } from '@/hooks/useToast';
import { TOAST_MS } from '@/lib/constants';

describe('Button', () => {
  it('기본 type 이 button 이다 (폼 안에서 의도치 않은 submit 방지)', () => {
    render(<Button>발음 듣기</Button>);
    expect(screen.getByRole('button', { name: '발음 듣기' })).toHaveAttribute('type', 'button');
  });

  it('클릭을 전달한다', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>다음 단어</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });
});

describe('IconButton', () => {
  it('aria-label 로 스크린리더에 노출된다', () => {
    render(
      <IconButton label="즐겨찾기">
        <Star />
      </IconButton>,
    );
    expect(screen.getByRole('button', { name: '즐겨찾기' })).toBeInTheDocument();
  });
});

describe('Chip', () => {
  it('선택 상태를 aria-pressed 로 알린다', () => {
    render(
      <ChipRow label="카테고리">
        <Chip selected>일상</Chip>
        <Chip>여행</Chip>
      </ChipRow>,
    );
    const group = screen.getByRole('group', { name: '카테고리' });
    expect(within(group).getByRole('button', { name: '일상' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(group).getByRole('button', { name: '여행' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});

describe('Segmented', () => {
  it('선택된 항목만 aria-selected 이고, 클릭 시 변경된다', async () => {
    function Harness() {
      const [v, setV] = useState<'words' | 'videos'>('words');
      return (
        <Segmented
          label="즐겨찾기 종류"
          value={v}
          onChange={setV}
          options={[
            { id: 'words', label: '단어' },
            { id: 'videos', label: '영상' },
          ]}
        />
      );
    }
    render(<Harness />);
    expect(screen.getByRole('tab', { name: '단어' })).toHaveAttribute('aria-selected', 'true');

    await userEvent.click(screen.getByRole('tab', { name: '영상' }));
    expect(screen.getByRole('tab', { name: '영상' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: '단어' })).toHaveAttribute('aria-selected', 'false');
  });
});

describe('EmptyState', () => {
  it('제목과 설명을 그린다', () => {
    render(<EmptyState title="즐겨찾기한 단어가 없어요" description="여기에 모여요." />);
    expect(screen.getByText('즐겨찾기한 단어가 없어요')).toBeInTheDocument();
  });
});

describe('BottomSheet', () => {
  it('스크림 클릭으로 닫힌다', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet title="8월 12일" counter="1 / 3" onClose={onClose}>
        <p>내용</p>
      </BottomSheet>,
    );
    // 스크림과 X 버튼 둘 다 '닫기' 라벨을 가진다
    const [scrim] = screen.getAllByRole('button', { name: '닫기' });
    await userEvent.click(scrim!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('Esc 로 닫힌다', async () => {
    const onClose = vi.fn();
    render(
      <BottomSheet title="8월 12일" onClose={onClose}>
        <p>내용</p>
      </BottomSheet>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('제목과 카운터를 그린다', () => {
    render(
      <BottomSheet title="8월 20일 (오늘)" counter="2 / 3" onClose={() => {}}>
        <p>내용</p>
      </BottomSheet>,
    );
    expect(screen.getByText('8월 20일 (오늘)')).toBeInTheDocument();
    expect(screen.getByText('2 / 3')).toBeInTheDocument();
  });
});

describe('SheetDots', () => {
  it('활성 점을 aria-current 로 표시하고, 클릭 시 이동한다', async () => {
    const onPick = vi.fn();
    render(<SheetDots count={3} index={1} onPick={onPick} />);

    expect(screen.getByRole('button', { name: '2번째 단어' })).toHaveAttribute(
      'aria-current',
      'true',
    );
    await userEvent.click(screen.getByRole('button', { name: '3번째 단어' }));
    expect(onPick).toHaveBeenCalledWith(2);
  });
});

describe('ToastProvider', () => {
  function Harness() {
    const toast = useToast();
    return (
      <>
        <button type="button" onClick={() => toast.show('즐겨찾기에 담았어요')}>
          담기
        </button>
        <button type="button" onClick={() => toast.show('즐겨찾기에서 뺐어요')}>
          빼기
        </button>
      </>
    );
  }

  // fake timer 를 쓰므로 userEvent 대신 fireEvent 를 쓴다.
  // userEvent 는 내부적으로 지연 타이머를 돌려서 fake timer 와 물리면 교착이 난다.
  const advance = (ms: number) => act(() => void vi.advanceTimersByTime(ms));

  it('문구를 띄우고 1800ms 후 사라진다', () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <Harness />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByRole('button', { name: '담기' }));
      expect(screen.getByRole('status')).toHaveTextContent('즐겨찾기에 담았어요');

      advance(TOAST_MS + 10);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });

  it('새 토스트가 오면 문구를 갈아끼우고 타이머를 리셋한다', () => {
    vi.useFakeTimers();
    try {
      render(
        <ToastProvider>
          <Harness />
        </ToastProvider>,
      );
      fireEvent.click(screen.getByRole('button', { name: '담기' }));
      advance(TOAST_MS - 200);

      // 사라지기 직전에 새 토스트 → 문구 교체 + 타이머 리셋
      fireEvent.click(screen.getByRole('button', { name: '빼기' }));
      expect(screen.getByRole('status')).toHaveTextContent('즐겨찾기에서 뺐어요');

      // 리셋이 없었다면 이미 사라졌을 시점
      advance(300);
      expect(screen.getByRole('status')).toHaveTextContent('즐겨찾기에서 뺐어요');

      advance(TOAST_MS);
      expect(screen.queryByRole('status')).not.toBeInTheDocument();
    } finally {
      vi.useRealTimers();
    }
  });
});
