import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import App from '@/App';

// 테스트 하네스(vitest + jsdom + testing-library + @ alias)가 도는지 확인하는 스모크 테스트
describe('테스트 환경', () => {
  it('jsdom 에서 컴포넌트를 렌더한다', () => {
    render(<App />);
    expect(screen.getByText('하루영어')).toBeInTheDocument();
  });
});
