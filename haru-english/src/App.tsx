import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';

import AppShell from '@/shell/AppShell';

// Phase 5 에서 실제 화면으로 교체된다.
function Placeholder({ name }: { name: string }) {
  return <div style={{ padding: '40px 0', color: '#8b95a1' }}>{name} — 준비 중</div>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Phase 5: /(splash) → /login → 앱 */}
        <Route path="/" element={<Navigate to="/today" replace />} />

        <Route element={<AppShell />}>
          <Route path="/today" element={<Placeholder name="오늘" />} />
          <Route path="/videos" element={<Placeholder name="영상" />} />
          <Route path="/saved" element={<Placeholder name="즐겨찾기" />} />
          <Route path="/my" element={<Placeholder name="마이페이지" />} />
        </Route>

        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
    </Router>
  );
}
