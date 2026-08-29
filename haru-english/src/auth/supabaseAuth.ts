import type { User } from '@supabase/supabase-js';

import { getSupabase } from '@/data/supabase/client';

import { EMAIL_DOMAIN, toEmail } from './identifier';
import { AuthError, type AuthAdapter, type AuthSession } from './types';

/*
 * Supabase 인증 — 합성 이메일 방식.
 *
 * 입력한 아이디/휴대폰을 {정규화}@haru-english.app 로 바꿔 email 로그인에 태운다.
 * 사용자는 이 이메일을 보지 못하고, 실제로 수신도 불가능하다.
 * ⇒ 비밀번호 재설정 메일을 보낼 수 없다. 복구 경로가 필요하면 OAuth 로 옮겨야 한다.
 *
 * 대시보드 전제:
 *   Anonymous sign-ins = ON   (둘러보기)
 *   Confirm email      = OFF  (합성 도메인이라 확인 메일을 받을 수 없다)
 */

function usernameOf(user: User): string | null {
  const meta = user.user_metadata as { username?: unknown } | undefined;
  if (typeof meta?.username === 'string' && meta.username) return meta.username;
  // 메타데이터가 없으면 이메일 로컬 파트로 되돌린다
  const email = user.email;
  if (email?.endsWith(`@${EMAIL_DOMAIN}`)) return email.slice(0, -(EMAIL_DOMAIN.length + 1));
  return null;
}

function toSession(user: User | null | undefined): AuthSession | null {
  if (!user) return null;
  const anon = user.is_anonymous ?? false;
  return {
    userId: user.id,
    mode: anon ? 'guest' : 'user',
    username: anon ? null : usernameOf(user),
  };
}

/**
 * Supabase 영문 에러 → 화면에 띄울 한국어.
 * 모르는 에러까지 그대로 노출하면 대상 사용자에게 아무 의미가 없어서, 기본 문구로 덮는다.
 */
function translate(message: string, fallback: string): AuthError {
  const m = message.toLowerCase();

  if (m.includes('invalid login credentials')) {
    return new AuthError('아이디 또는 비밀번호가 맞지 않아요.');
  }
  if (m.includes('user already registered') || m.includes('already been registered')) {
    return new AuthError('이미 가입된 아이디예요. 로그인해 주세요.');
  }
  if (m.includes('email address') && m.includes('invalid')) {
    return new AuthError('이 아이디는 쓸 수 없어요. 다른 아이디를 입력해 주세요.');
  }
  if (m.includes('anonymous sign-ins are disabled')) {
    return new AuthError('둘러보기를 사용할 수 없어요. 로그인해 주세요.');
  }
  if (m.includes('password should be at least') || m.includes('password is too short')) {
    return new AuthError('비밀번호가 너무 짧아요.');
  }
  if (m.includes('email rate limit') || m.includes('too many requests') || m.includes('rate limit')) {
    return new AuthError('시도가 너무 잦아요. 잠시 후 다시 해주세요.');
  }
  if (m.includes('failed to fetch') || m.includes('network')) {
    return new AuthError('연결이 불안정해요. 잠시 후 다시 시도해 주세요.');
  }
  return new AuthError(fallback);
}

function resolve(identifier: string): { email: string; username: string } {
  const r = toEmail(identifier);
  if (!r.ok) throw new AuthError(r.message);
  return { email: r.email, username: r.normalized };
}

export const supabaseAuth: AuthAdapter = {
  async getSession() {
    const { data, error } = await getSupabase().auth.getSession();
    if (error) throw translate(error.message, '로그인 상태를 확인하지 못했어요.');
    return toSession(data.session?.user);
  },

  subscribe(onChange) {
    const { data } = getSupabase().auth.onAuthStateChange((_event, session) => {
      onChange(toSession(session?.user));
    });
    return () => data.subscription.unsubscribe();
  },

  async signInAsGuest() {
    const { data, error } = await getSupabase().auth.signInAnonymously();
    if (error) throw translate(error.message, '둘러보기를 시작하지 못했어요.');
    const session = toSession(data.user);
    if (!session) throw new AuthError('둘러보기를 시작하지 못했어요.');
    return session;
  },

  async signIn(identifier, password) {
    const { email } = resolve(identifier);
    const { data, error } = await getSupabase().auth.signInWithPassword({ email, password });
    if (error) throw translate(error.message, '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.');
    const session = toSession(data.user);
    if (!session) throw new AuthError('로그인하지 못했어요.');
    return session;
  },

  async signUp(identifier, password) {
    const { email, username } = resolve(identifier);
    const sb = getSupabase();

    // 둘러보기 중이면 그 익명 계정을 승격시킨다 — auth.users 행이 유지되므로
    // 지금까지의 즐겨찾기·출석이 그대로 따라온다 (새로 가입하면 전부 잃는다).
    const { data: current } = await sb.auth.getUser();
    if (current.user?.is_anonymous) {
      const { data, error } = await sb.auth.updateUser({ email, password, data: { username } });
      if (error) throw translate(error.message, '회원가입을 마치지 못했어요.');

      // profiles 트리거는 auth.users INSERT 에만 걸려 있다. 승격은 UPDATE 라
      // 프로필 행은 그대로 남고 username 만 비어 있으므로 여기서 채운다.
      await sb.from('profiles').update({ username }).eq('id', data.user.id);

      const session = toSession(data.user);
      if (!session) throw new AuthError('회원가입을 마치지 못했어요.');
      return session;
    }

    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw translate(error.message, '회원가입을 마치지 못했어요.');

    // Confirm email 이 켜져 있으면 세션이 안 온다. 합성 도메인이라 확인 메일을 받을 수 없으므로
    // 조용히 실패시키지 말고 설정 문제라는 걸 드러낸다.
    const session = toSession(data.user);
    if (!data.session || !session) {
      throw new AuthError('가입은 됐지만 로그인되지 않았어요. 잠시 후 로그인해 주세요.');
    }
    return session;
  },

  async signOut() {
    const { error } = await getSupabase().auth.signOut();
    if (error) throw translate(error.message, '로그아웃하지 못했어요.');
  },
};
