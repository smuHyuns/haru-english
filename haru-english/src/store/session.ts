import { create } from 'zustand';

import { AuthError, auth, type AuthSession, type SessionMode } from '@/auth';
import { clearAllCaches } from '@/query/queryClient';

/*
 * 세션.
 *
 * 상태를 여기서 저장하지 않는다 — 저장은 어댑터(mockAuth/supabase-js)가 한다.
 * 두 군데서 persist 하면 새로고침 직후 잠깐 어긋난 상태가 보인다.
 * 이 스토어는 어댑터가 알려주는 걸 화면용으로 비추는 거울이다.
 */

export type { SessionMode };

type SessionState = {
  /** 저장된 세션을 복원하는 중인지. loading 동안 라우팅을 미룬다 */
  status: 'loading' | 'ready';
  mode: SessionMode | null;
  /** 로그인 입력 원본(정규화된 아이디/번호). 게스트는 null */
  username: string | null;
  userId: string | null;
  /** 로그인/가입 진행 중 — 버튼 중복 탭 방지 */
  pending: boolean;
  /** 화면에 그대로 띄울 한국어 안내 */
  error: string | null;

  /** 앱 부팅 시 1회. 해제 함수를 돌려준다 */
  init: () => () => void;
  signInAsGuest: () => Promise<boolean>;
  signIn: (identifier: string, password: string) => Promise<boolean>;
  signUp: (identifier: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
};

export const useSession = create<SessionState>()((set, get) => {
  /** 어댑터가 준 세션을 상태에 반영한다 */
  function apply(session: AuthSession | null) {
    const prev = get().userId;

    /*
     * 사용자가 바뀌면 쿼리 캐시를 버린다 — 안 버리면 다음 사람이 앞사람의
     * 즐겨찾기·출석을 잠깐 보게 된다.
     * prev 가 null 인 첫 복원에서는 지우지 않는다. 그때 지우면 오프라인 우선용으로
     * 저장해 둔 캐시를 매 부팅마다 스스로 날리게 된다.
     * 게스트 → 정식 전환은 userId 가 그대로라 여기 걸리지 않는다 (데이터가 따라와야 하므로).
     */
    if (prev && session?.userId !== prev) clearAllCaches();

    set({
      status: 'ready',
      mode: session?.mode ?? null,
      username: session?.username ?? null,
      userId: session?.userId ?? null,
    });
  }

  /** 로그인 계열 동작의 공통 껍데기 — pending/error 처리를 한 군데로 모은다 */
  async function run(action: () => Promise<AuthSession>): Promise<boolean> {
    set({ pending: true, error: null });
    try {
      apply(await action());
      return true;
    } catch (e) {
      const message =
        e instanceof AuthError
          ? e.message
          : '문제가 생겼어요. 잠시 후 다시 시도해 주세요.';
      set({ error: message });
      return false;
    } finally {
      set({ pending: false });
    }
  }

  return {
    status: 'loading',
    mode: null,
    username: null,
    userId: null,
    pending: false,
    error: null,

    init: () => {
      /*
       * 복원은 아직 안 끝났을 때만. 테스트가 상태를 직접 주입한 경우를 덮어쓰지 않는다.
       * 구독은 조건 없이 건다 — StrictMode 는 이펙트를 마운트·언마운트·마운트로 두 번 도는데,
       * 두 번째 호출이 이미 ready 라는 이유로 통째로 빠지면 개발 중에는 토큰 갱신도
       * 다른 탭 로그아웃도 반영되지 않는다 (프로덕션과 다르게 동작하게 된다).
       */
      if (get().status !== 'ready') {
        void auth
          .getSession()
          .then(apply)
          // 복원 실패는 로그아웃과 같게 다룬다 — 여기서 앱을 막으면 안 된다
          .catch(() => set({ status: 'ready' }));
      }

      return auth.subscribe(apply);
    },

    signInAsGuest: () => run(() => auth.signInAsGuest()),
    signIn: (identifier, password) => run(() => auth.signIn(identifier, password)),
    signUp: (identifier, password) => run(() => auth.signUp(identifier, password)),

    signOut: async () => {
      try {
        await auth.signOut();
      } finally {
        // 실패해도 로컬은 로그아웃시킨다 — 안 그러면 로그아웃이 안 되는 것처럼 보인다
        clearAllCaches();
        set({ status: 'ready', mode: null, username: null, userId: null, error: null });
      }
    },

    clearError: () => set({ error: null }),
  };
});
