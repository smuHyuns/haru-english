export type SessionMode = 'guest' | 'user';

export type AuthSession = {
  userId: string;
  mode: SessionMode;
  /** 로그인 입력 원본(정규화된 아이디/번호). 게스트는 null */
  username: string | null;
};

/**
 * 화면에 그대로 띄울 수 있는 한국어 메시지를 담은 에러.
 *
 * Supabase 가 주는 문구는 영어인 데다 "Invalid login credentials" 처럼
 * 대상 사용자에게 아무 도움이 안 된다. 어댑터 경계에서 전부 번역한다.
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export interface AuthAdapter {
  /** 저장된 세션 복원 (앱 부팅 시 1회) */
  getSession(): Promise<AuthSession | null>;

  /** 세션 변화 구독 — 토큰 갱신, 다른 탭에서의 로그아웃 반영. 해제 함수를 돌려준다 */
  subscribe(onChange: (session: AuthSession | null) => void): () => void;

  /** 로그인 없이 둘러보기. 게스트도 uid 를 받아야 RLS 와 데이터 승계가 성립한다 */
  signInAsGuest(): Promise<AuthSession>;

  signIn(identifier: string, password: string): Promise<AuthSession>;

  /** 게스트 세션이 있으면 그 계정을 승격시킨다 (즐겨찾기·출석이 그대로 따라온다) */
  signUp(identifier: string, password: string): Promise<AuthSession>;

  signOut(): Promise<void>;
}
