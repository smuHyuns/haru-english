import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import Button from '@/components/Button';
import { checkPassword, toEmail } from '@/auth/identifier';
import { readIdentifier, rememberIdentifier } from '@/auth/lastIdentifier';
import { useSession } from '@/store/session';

import styles from './Login.module.css';

/**
 * 로그인 / 회원가입.
 *
 * 식별자 방식은 합성 이메일이다 — 입력한 아이디·휴대폰이 {정규화}@haru-english.app
 * 으로 바뀌어 Supabase email 인증에 실려 간다 (`auth/identifier.ts`).
 *
 * 회원가입은 별도 화면이 아니라 같은 화면의 모드로 둔다. 프로토타입에 가입 화면이
 * 없기도 하고, 입력 필드가 완전히 같아서 화면을 하나 더 만들 이유가 없다.
 * 모드를 URL 에 두면 새로고침해도 유지된다 (/login?mode=signup).
 */
export default function Login() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const isSignup = params.get('mode') === 'signup';

  const { pending, error } = useSession();
  const signIn = useSession((s) => s.signIn);
  const signUp = useSession((s) => s.signUp);
  const signInAsGuest = useSession((s) => s.signInAsGuest);
  const setError = useSession.setState;
  const clearError = useSession((s) => s.clearError);

  /*
   * 지난번 아이디를 채워 둔다 — 다시 들어올 때 타이핑을 한 칸 줄인다.
   * 가입 모드로 바로 들어온 경우는 비운다. 남의 아이디로 가입을 시도하게 만들 이유가 없다.
   * 마운트 때 한 번만 읽는다. 모드를 오갈 때마다 입력칸이 제멋대로 바뀌면 더 헷갈린다.
   */
  const [id, setId] = useState(() => (isSignup ? '' : (readIdentifier() ?? '')));
  const [pw, setPw] = useState('');

  // 모드를 바꾸면 이전 모드의 오류 문구가 남지 않게 한다
  useEffect(() => clearError(), [isSignup, clearError]);

  const submit = async () => {
    // 서버에 다녀오기 전에 형식부터 짚어 준다 — 왕복이 줄고 안내가 구체적이다
    const identifier = toEmail(id);
    if (!identifier.ok) {
      setError({ error: identifier.message });
      return;
    }
    const pwError = checkPassword(pw);
    if (pwError) {
      setError({ error: pwError });
      return;
    }

    const ok = await (isSignup ? signUp(id, pw) : signIn(id, pw));
    if (!ok) return;
    // 성공한 아이디만 기억한다. 오타를 저장해 두면 다음번에 그 오타로 시작한다
    rememberIdentifier(id);
    navigate('/today', { replace: true });
  };

  const browse = async () => {
    if (await signInAsGuest()) navigate('/today', { replace: true });
  };

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoText}>EN</span>
        </div>
        <div className={styles.copy}>
          <h1 className={styles.headline}>
            {isSignup ? (
              <>
                하루영어를
                <br />
                시작해 볼까요
              </>
            ) : (
              <>
                하루영어에
                <br />
                오신 것을 환영해요
              </>
            )}
          </h1>
          <p className={styles.desc}>
            {isSignup ? (
              <>
                아이디와 비밀번호만 정하면
                <br />
                바로 시작할 수 있어요.
              </>
            ) : (
              <>
                로그인하면 즐겨찾기와 출석이
                <br />
                계속 저장돼요.
              </>
            )}
          </p>
        </div>
      </div>

      <form
        className={styles.fields}
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <input
          className={styles.input}
          type="text"
          inputMode="text"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          placeholder="아이디 또는 휴대폰 번호"
          aria-label="아이디 또는 휴대폰 번호"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder={isSignup ? '비밀번호 (8자 이상)' : '비밀번호'}
          aria-label="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />

        {/* role=alert 로 스크린리더가 즉시 읽게 한다 */}
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        {/* 엔터 제출용. 보이는 버튼은 아래 actions 에 있다 */}
        <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
      </form>

      <div className={styles.actions}>
        <Button height={76} disabled={pending} onClick={() => void submit()}>
          {pending ? '잠시만요…' : isSignup ? '가입하고 시작하기' : '로그인'}
        </Button>

        {!isSignup && (
          <Button variant="secondary" height={68} disabled={pending} onClick={() => void browse()}>
            로그인 없이 둘러보기
          </Button>
        )}

        <p className={styles.signupLine}>
          {isSignup ? '이미 계정이 있으신가요? ' : '처음이신가요? '}
          <button
            type="button"
            className={styles.signupLink}
            data-touch-exempt
            onClick={() => setParams(isSignup ? {} : { mode: 'signup' }, { replace: true })}
          >
            {isSignup ? '로그인' : '회원가입'}
          </button>
        </p>
      </div>
    </div>
  );
}
