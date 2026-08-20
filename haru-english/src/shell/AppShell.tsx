import { useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

import { useMarkAttendance } from '@/hooks/useData';
import { TABS } from '@/lib/constants';
import { formatHeaderDate, kstToday } from '@/lib/date';

import styles from './AppShell.module.css';

/**
 * 앱 셸 — 헤더 / 스크롤 본문 / 하단 4탭.
 * 프로토타입과 달리 탭은 라우트로 매핑한다 (PWA 새로고침 복원에 유리).
 */
export default function AppShell() {
  const { pathname } = useLocation();
  const active = TABS.find((t) => pathname.startsWith(t.path)) ?? TABS[0];

  // 앱에 들어온 순간 오늘 출석을 기록한다 — 스트릭 계산의 근거.
  // 실패해도 UI 를 막지 않는다 (오프라인이어도 앱은 그냥 돌아야 한다).
  const markAttendance = useMarkAttendance();
  const marked = useRef(false);
  useEffect(() => {
    if (marked.current) return;
    marked.current = true;
    markAttendance.mutate();
  }, [markAttendance]);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <h1 className={styles.title}>{active.title}</h1>
        <span className={styles.dateChip}>{formatHeaderDate(kstToday())}</span>
      </header>

      <main className={styles.content}>
        <Outlet />
      </main>

      <nav className={styles.tabbar}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.id}
            to={tab.path}
            className={({ isActive }) =>
              isActive ? `${styles.tab} ${styles.tabActive}` : styles.tab
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
