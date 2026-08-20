import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/*
 * 세션 — Phase 7 에서 Supabase Auth 로 교체된다.
 *
 * 지금은 로컬 스텁이다. 프로토타입처럼 검증 없이 진입시키되,
 * 상태 모양은 나중 것과 맞춰 둔다:
 *   guest → signInAnonymously()
 *   user  → signInWithPassword()
 * 그래야 Phase 7 에서 화면 코드를 안 고치고 이 스토어 내부만 바꾸면 된다.
 */

export type SessionMode = 'guest' | 'user';

type SessionState = {
  mode: SessionMode | null;
  /** 로그인 입력 원본 (아이디/휴대폰). Phase 7 에서 profiles.username 이 된다 */
  username: string | null;
  signInAsGuest: () => void;
  signIn: (username: string) => void;
  signOut: () => void;
};

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      mode: null,
      username: null,
      signInAsGuest: () => set({ mode: 'guest', username: null }),
      signIn: (username: string) => set({ mode: 'user', username }),
      signOut: () => set({ mode: null, username: null }),
    }),
    { name: 'haru:session:v1' },
  ),
);
