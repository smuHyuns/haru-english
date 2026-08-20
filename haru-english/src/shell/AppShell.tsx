import { NavLink, Outlet, useLocation } from 'react-router-dom';

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
