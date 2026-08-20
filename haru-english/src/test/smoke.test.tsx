import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from '@/App';
import ToastProvider from '@/components/ToastProvider';
import DevCatalog from '@/screens/DevCatalog';

// 테스트 하네스(vitest + jsdom + testing-library + @ alias)와 셸 라우팅 스모크 테스트
describe('앱 셸', () => {
  it('기본 경로에서 오늘 탭으로 이동하고 헤더를 그린다', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: '오늘의 영어' })).toBeInTheDocument();
  });

  it('하단 4탭을 모두 그린다', () => {
    render(<App />);
    for (const name of ['오늘', '영상', '즐겨찾기', '마이']) {
      expect(screen.getByRole('link', { name })).toBeInTheDocument();
    }
  });
});

// 카탈로그는 모든 공통 컴포넌트를 한 번에 렌더한다 — 런타임 에러를 여기서 잡는다
describe('컴포넌트 카탈로그', () => {
  it('전 컴포넌트가 에러 없이 렌더된다', () => {
    render(
      <ToastProvider>
        <DevCatalog />
      </ToastProvider>,
    );
    expect(screen.getByRole('heading', { name: 'Button' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'BottomSheet / Toast' })).toBeInTheDocument();
  });
});
