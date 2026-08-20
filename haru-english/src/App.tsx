import { useEffect } from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ToastProvider from '@/components/ToastProvider';
import DevCatalog from '@/screens/DevCatalog';
import AppShell from '@/shell/AppShell';
import { startTouchAudit } from '@/lib/touchAudit';

// Phase 5 에서 실제 화면으로 교체된다.
function Placeholder({ name }: { name: string }) {
  return <p style={{ padding: '40px 0', color: 'var(--text-4)' }}>{name} — 준비 중</p>;
}

export default function App() {
  // 개발 모드에서만 터치 타깃 52px 위반을 잡아 콘솔에 알린다
  useEffect(() => startTouchAudit(), []);

  return (
    <ToastProvider>
      <Router>
        <Routes>
          {/* Phase 5: /(splash) → /login → 앱 */}
          <Route path="/" element={<Navigate to="/today" replace />} />

          <Route element={<AppShell />}>
            <Route path="/today" element={<Placeholder name="오늘" />} />
            <Route path="/videos" element={<Placeholder name="영상" />} />
            <Route path="/saved" element={<Placeholder name="즐겨찾기" />} />
            <Route path="/my" element={<Placeholder name="마이페이지" />} />
            {import.meta.env.DEV && <Route path="/__dev" element={<DevCatalog />} />}
          </Route>

          <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </Router>
    </ToastProvider>
  );
}
