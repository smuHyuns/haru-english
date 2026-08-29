import { beforeEach, describe, expect, it, vi } from 'vitest';

import { __setMockSession } from '@/auth/mockAuth';
import { queryClient } from '@/query/queryClient';

import { useSession } from './session';

/*
 * 캐시 폐기 규칙은 눈에 안 보이지만 틀리면 아프다.
 *  - 안 지우면 다음 사람이 앞사람의 즐겨찾기·출석을 본다.
 *  - 너무 지우면 부팅마다 오프라인용 캐시를 스스로 날리고, 게스트→정식 전환에서 기록이 사라진다.
 */

const KEY = ['probe'];

function seedCache() {
  queryClient.setQueryData(KEY, 'before');
}

function cached() {
  return queryClient.getQueryData(KEY);
}

beforeEach(() => {
  localStorage.clear();
  queryClient.clear();
  useSession.setState({
    status: 'loading',
    mode: null,
    username: null,
    userId: null,
    pending: false,
    error: null,
  });
});

describe('사용자가 바뀔 때', () => {
  it('다른 계정으로 로그인하면 캐시를 버린다', async () => {
    useSession.setState({ status: 'ready', mode: 'user', userId: 'mock-aaa', username: 'aaa' });
    seedCache();

    await useSession.getState().signIn('bbb123', 'password123');

    expect(useSession.getState().username).toBe('bbb123');
    expect(cached()).toBeUndefined();
  });

  it('로그아웃하면 캐시를 버린다', async () => {
    useSession.setState({ status: 'ready', mode: 'user', userId: 'mock-aaa', username: 'aaa' });
    seedCache();

    await useSession.getState().signOut();

    expect(useSession.getState().mode).toBeNull();
    expect(cached()).toBeUndefined();
  });

  it('같은 계정으로 다시 로그인하면 캐시를 유지한다', async () => {
    useSession.setState({
      status: 'ready',
      mode: 'user',
      userId: 'mock-minsu99',
      username: 'minsu99',
    });
    seedCache();

    await useSession.getState().signIn('MinSu99', 'password123');

    expect(cached()).toBe('before');
  });
});

describe('부팅 시 세션 복원', () => {
  it('저장된 세션을 복원하고 캐시는 남긴다', async () => {
    // 오프라인 우선용으로 저장돼 있던 캐시. 부팅했다고 날리면 안 된다.
    seedCache();
    __setMockSession({ userId: 'mock-guest', mode: 'guest', username: null });

    useSession.getState().init();
    await vi.waitFor(() => expect(useSession.getState().status).toBe('ready'));

    expect(useSession.getState().mode).toBe('guest');
    expect(cached()).toBe('before');
  });

  it('저장된 세션이 없으면 ready + 로그아웃 상태가 된다', async () => {
    useSession.getState().init();
    await vi.waitFor(() => expect(useSession.getState().status).toBe('ready'));
    expect(useSession.getState().mode).toBeNull();
  });

  it('이미 ready 면 덮어쓰지 않는다 (테스트가 주입한 상태 보호)', () => {
    useSession.setState({ status: 'ready', mode: 'guest', userId: 'mock-guest', username: null });
    useSession.getState().init();
    expect(useSession.getState().mode).toBe('guest');
  });
});

describe('오류 처리', () => {
  it('식별자가 잘못되면 화면용 문구를 담고 세션은 그대로 둔다', async () => {
    const ok = await useSession.getState().signIn('홍길동', 'password123');

    expect(ok).toBe(false);
    expect(useSession.getState().error).toBe('아이디는 영문·숫자로 입력해 주세요.');
    expect(useSession.getState().mode).toBeNull();
  });

  it('pending 은 끝나면 반드시 내려간다', async () => {
    await useSession.getState().signIn('홍길동', 'password123');
    expect(useSession.getState().pending).toBe(false);
  });

  it('clearError 로 문구를 지운다', async () => {
    await useSession.getState().signIn('홍길동', 'password123');
    useSession.getState().clearError();
    expect(useSession.getState().error).toBeNull();
  });
});
