import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import App from '@/App';
import ToastProvider from '@/components/ToastProvider';
import DevCatalog from '@/screens/DevCatalog';
import { useSession } from '@/store/session';

/** 라우터가 읽는 주소를 바꾼다 (App 이 BrowserRouter 를 직접 만들기 때문) */
function goTo(path: string) {
  window.history.pushState({}, '', path);
}

beforeEach(() => {
  useSession.setState({ mode: null, username: null });
  localStorage.clear();
  goTo('/');
});

describe('진입 흐름', () => {
  it('세션이 없으면 스플래시를 보여준다', () => {
    render(<App />);
    expect(screen.getByText('하루영어')).toBeInTheDocument();
    expect(screen.getByText('매일 한 단어, 매일 한 영상')).toBeInTheDocument();
  });

  it('세션 없이 앱 라우트로 가면 로그인으로 보낸다', async () => {
    goTo('/today');
    render(<App />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /오신 것을 환영해요/ })).toBeInTheDocument(),
    );
  });

  it('게스트 세션이 있으면 앱 셸이 열린다', async () => {
    useSession.setState({ mode: 'guest', username: null });
    goTo('/today');
    render(<App />);
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: '오늘의 영어' })).toBeInTheDocument(),
    );
  });
});

describe('앱 셸', () => {
  beforeEach(() => {
    useSession.setState({ mode: 'guest', username: null });
    goTo('/today');
  });

  it('하단 4탭을 모두 그린다', async () => {
    render(<App />);
    for (const name of ['오늘', '영상', '즐겨찾기', '마이']) {
      await waitFor(() => expect(screen.getByRole('link', { name })).toBeInTheDocument());
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
