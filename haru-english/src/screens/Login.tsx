import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import { useToast } from '@/hooks/useToast';
import { useSession } from '@/store/session';

import styles from './Login.module.css';

/**
 * 로그인.
 *
 * 프로토타입과 마찬가지로 **검증이 없다** — 두 버튼 모두 앱으로 들어간다.
 * Phase 7 에서 Supabase Auth 로 교체한다:
 *   둘러보기 → signInAnonymously()   (게스트도 uid 를 받아야 RLS·데이터 승계가 성립)
 *   로그인   → signInWithPassword()
 */
export default function Login() {
  const navigate = useNavigate();
  const toast = useToast();
  const signIn = useSession((s) => s.signIn);
  const signInAsGuest = useSession((s) => s.signInAsGuest);

  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const enter = () => {
    signIn(id.trim());
    navigate('/today', { replace: true });
  };

  const browse = () => {
    signInAsGuest();
    navigate('/today', { replace: true });
  };

  return (
    <div className={styles.root}>
      <div className={styles.top}>
        <div className={styles.logo}>
          <span className={styles.logoText}>EN</span>
        </div>
        <div className={styles.copy}>
          <h1 className={styles.headline}>
            하루영어에
            <br />
            오신 것을 환영해요
          </h1>
          <p className={styles.desc}>
            로그인하면 즐겨찾기와 출석이
            <br />
            계속 저장돼요.
          </p>
        </div>
      </div>

      <div className={styles.fields}>
        <input
          className={styles.input}
          type="text"
          inputMode="text"
          autoComplete="username"
          placeholder="아이디 또는 휴대폰 번호"
          aria-label="아이디 또는 휴대폰 번호"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          className={styles.input}
          type="password"
          autoComplete="current-password"
          placeholder="비밀번호"
          aria-label="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <Button height={76} onClick={enter}>
          로그인
        </Button>
        <Button variant="secondary" height={68} onClick={browse}>
          로그인 없이 둘러보기
        </Button>
        <p className={styles.signupLine}>
          처음이신가요?{' '}
          <button
            type="button"
            className={styles.signupLink}
            data-touch-exempt
            onClick={() => toast.show('준비 중인 기능이에요')}
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}
