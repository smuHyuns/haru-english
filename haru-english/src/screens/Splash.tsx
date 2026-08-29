import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { SPLASH_MS } from '@/lib/constants';
import { useSession } from '@/store/session';

import styles from './Splash.module.css';

/**
 * 브랜드 노출용 1.6초 대기. 화면 아무 데나 누르면 즉시 넘어간다.
 * 이미 로그인돼 있으면 로그인 화면을 건너뛴다.
 */
export default function Splash() {
  const navigate = useNavigate();
  const status = useSession((s) => s.status);
  const mode = useSession((s) => s.mode);

  // 세션 복원 전에 넘어가면 이미 로그인한 사람도 로그인 화면을 보게 된다.
  // 1.6초 안에 대개 끝나므로 체감상 기다림이 늘지 않는다.
  const ready = status === 'ready';

  useEffect(() => {
    if (!ready) return;
    const next = mode ? '/today' : '/login';
    const timer = setTimeout(() => navigate(next, { replace: true }), SPLASH_MS);
    return () => clearTimeout(timer);
  }, [ready, mode, navigate]);

  const skip = () => {
    if (!ready) return;
    navigate(mode ? '/today' : '/login', { replace: true });
  };

  return (
    <button type="button" className={styles.root} onClick={skip} aria-label="시작하기">
      <div className={styles.logoTile}>
        <span className={styles.logoText}>EN</span>
      </div>
      <div className={styles.textBlock}>
        <span className={styles.wordmark}>하루영어</span>
        <span className={styles.tagline}>매일 한 단어, 매일 한 영상</span>
      </div>
    </button>
  );
}
