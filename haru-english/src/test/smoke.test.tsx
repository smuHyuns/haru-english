import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from '@/App';

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
