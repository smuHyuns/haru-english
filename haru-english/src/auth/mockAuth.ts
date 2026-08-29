import { toEmail } from './identifier';
import { AuthError, type AuthAdapter, type AuthSession } from './types';

/*
 * 목 인증.
 *
 * Supabase 없이 앱 전체를 돌리고 테스트를 붙이기 위한 것.
 * 프로토타입처럼 비밀번호를 실제로 확인하지 않는다 — 형식 검사는 화면이 한다.
 * 다만 식별자 정규화는 실제와 같은 경로를 타서, 정규화 버그가 mock 에서도 드러나게 한다.
 */

const KEY = 'haru:auth:v1';

function read(): AuthSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const v = JSON.parse(raw) as Partial<AuthSession>;
    if (v.mode !== 'guest' && v.mode !== 'user') return null;
    if (typeof v.userId !== 'string') return null;
    return { userId: v.userId, mode: v.mode, username: v.username ?? null };
  } catch {
    // 저장 형식이 바뀌었거나 스토리지가 막힌 경우 — 로그아웃 상태로 본다
    return null;
  }
}

function write(session: AuthSession | null) {
  try {
    if (session) localStorage.setItem(KEY, JSON.stringify(session));
    else localStorage.removeItem(KEY);
  } catch {
    // 사파리 프라이빗 모드 등. 메모리 세션으로만 동작한다
  }
}

const listeners = new Set<(s: AuthSession | null) => void>();

function emit(session: AuthSession | null) {
  write(session);
  listeners.forEach((fn) => fn(session));
}

function resolve(identifier: string): string {
  const r = toEmail(identifier);
  if (!r.ok) throw new AuthError(r.message);
  return r.normalized;
}

export const mockAuth: AuthAdapter = {
  async getSession() {
    return read();
  },

  subscribe(onChange) {
    listeners.add(onChange);
    return () => listeners.delete(onChange);
  },

  async signInAsGuest() {
    const session: AuthSession = { userId: 'mock-guest', mode: 'guest', username: null };
    emit(session);
    return session;
  },

  async signIn(identifier) {
    const username = resolve(identifier);
    const session: AuthSession = { userId: `mock-${username}`, mode: 'user', username };
    emit(session);
    return session;
  },

  async signUp(identifier) {
    return mockAuth.signIn(identifier, '');
  },

  async signOut() {
    emit(null);
  },
};

/** 테스트에서 저장된 세션을 직접 세팅한다 */
export function __setMockSession(session: AuthSession | null) {
  write(session);
}
