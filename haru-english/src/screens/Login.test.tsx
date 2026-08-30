import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';

import ToastProvider from '@/components/ToastProvider';
import { rememberIdentifier } from '@/auth/lastIdentifier';
import { useSession } from '@/store/session';

import Login from './Login';

function renderLogin(path = '/login') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/today" element={<h1>오늘의 영어</h1>} />
          </Routes>
        </MemoryRouter>
      </ToastProvider>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  useSession.setState({
    status: 'ready',
    mode: null,
    username: null,
    userId: null,
    pending: false,
    error: null,
  });
});

const id = () => screen.getByLabelText('아이디 또는 휴대폰 번호');
const pw = () => screen.getByLabelText('비밀번호');

describe('로그인 입력 검증', () => {
  it('빈 입력이면 서버에 다녀오지 않고 바로 알려준다', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '아이디 또는 휴대폰 번호를 입력해 주세요.',
    );
    expect(useSession.getState().mode).toBeNull();
  });

  it('한글 아이디는 이유를 짚어 준다', async () => {
    renderLogin();
    await userEvent.type(id(), '홍길동');
    await userEvent.type(pw(), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('아이디는 영문·숫자로 입력해 주세요.');
  });

  it('짧은 비밀번호를 막는다', async () => {
    renderLogin();
    await userEvent.type(id(), 'minsu99');
    await userEvent.type(pw(), '123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('비밀번호는 8자 이상이어야 해요.');
  });
});

describe('로그인 성공', () => {
  it('아이디를 정규화해 세션에 담고 오늘 화면으로 보낸다', async () => {
    renderLogin();
    await userEvent.type(id(), '  MinSu99  ');
    await userEvent.type(pw(), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: '오늘의 영어' })).toBeInTheDocument());
    expect(useSession.getState()).toMatchObject({ mode: 'user', username: 'minsu99' });
  });

  it('휴대폰 번호는 표기가 달라도 같은 계정이 된다', async () => {
    renderLogin();
    await userEvent.type(id(), '010-1234-5678');
    await userEvent.type(pw(), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));

    await waitFor(() => expect(useSession.getState().username).toBe('01012345678'));
  });

  it('둘러보기는 게스트 세션으로 들어간다', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: '로그인 없이 둘러보기' }));

    await waitFor(() => expect(screen.getByRole('heading', { name: '오늘의 영어' })).toBeInTheDocument());
    expect(useSession.getState()).toMatchObject({ mode: 'guest', username: null });
  });
});

describe('회원가입 모드', () => {
  it('URL 로 복원된다', () => {
    renderLogin('/login?mode=signup');
    expect(screen.getByRole('heading', { name: /시작해 볼까요/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '가입하고 시작하기' })).toBeInTheDocument();
  });

  it('가입 모드에서는 둘러보기를 감춘다', () => {
    renderLogin('/login?mode=signup');
    expect(screen.queryByRole('button', { name: '로그인 없이 둘러보기' })).not.toBeInTheDocument();
  });

  it('링크로 모드를 오간다', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: '회원가입' }));
    expect(await screen.findByRole('button', { name: '가입하고 시작하기' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByRole('button', { name: '로그인 없이 둘러보기' })).toBeInTheDocument();
  });

  it('모드를 바꾸면 이전 오류 문구가 남지 않는다', async () => {
    renderLogin();
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: '회원가입' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
  });
});

describe('아이디 저장', () => {
  it('로그인에 성공한 아이디를 다음 방문에 채워 준다', async () => {
    const first = renderLogin();
    await userEvent.type(id(), 'minsu99');
    await userEvent.type(pw(), 'password123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    await waitFor(() => expect(useSession.getState().mode).toBe('user'));
    first.unmount();

    renderLogin();
    expect(id()).toHaveValue('minsu99');
    // 비밀번호는 절대 남기지 않는다
    expect(pw()).toHaveValue('');
  });

  it('로그인까지 가지 못한 입력은 기억하지 않는다', async () => {
    const first = renderLogin();
    await userEvent.type(id(), 'minsu99');
    await userEvent.type(pw(), '123');
    await userEvent.click(screen.getByRole('button', { name: '로그인' }));
    expect(await screen.findByRole('alert')).toBeInTheDocument();
    first.unmount();

    renderLogin();
    expect(id()).toHaveValue('');
  });

  it('둘러보기는 아이디를 남기지 않는다', async () => {
    const first = renderLogin();
    await userEvent.click(screen.getByRole('button', { name: '로그인 없이 둘러보기' }));
    await waitFor(() => expect(useSession.getState().mode).toBe('guest'));
    first.unmount();

    renderLogin();
    expect(id()).toHaveValue('');
  });

  it('가입 모드로 들어오면 채우지 않는다', () => {
    rememberIdentifier('minsu99');
    renderLogin('/login?mode=signup');
    expect(id()).toHaveValue('');
  });
});
