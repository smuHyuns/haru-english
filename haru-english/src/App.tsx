import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import ToastProvider from '@/components/ToastProvider';
import DevCatalog from '@/screens/DevCatalog';
import Login from '@/screens/Login';
import My from '@/screens/My';
import Saved from '@/screens/Saved';
import Splash from '@/screens/Splash';
import Today from '@/screens/Today';
import Videos from '@/screens/Videos';
import AppShell from '@/shell/AppShell';
import { startTouchAudit } from '@/lib/touchAudit';
import { queryClient } from '@/query/queryClient';
import { useSession } from '@/store/session';

/** 세션이 없으면 로그인으로. 게스트 세션도 유효한 세션으로 친다 */
function RequireSession() {
  const mode = useSession((s) => s.mode);
  return mode ? <Outlet /> : <Navigate to="/login" replace />;
}

export default function App() {
  // 개발 모드에서만 터치 타깃 52px 위반을 잡아 콘솔에 알린다
  useEffect(() => startTouchAudit(), []);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/login" element={<Login />} />

            <Route element={<RequireSession />}>
              <Route element={<AppShell />}>
                <Route path="/today" element={<Today />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/my" element={<My />} />
              </Route>
            </Route>

            {/* 개발용 컴포넌트 카탈로그 — 세션 없이도 열린다 */}
            {import.meta.env.DEV && (
              <Route element={<AppShell />}>
                <Route path="/__dev" element={<DevCatalog />} />
              </Route>
            )}

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ToastProvider>
    </QueryClientProvider>
  );
}
