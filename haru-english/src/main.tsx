import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { setupPersistence } from '@/query/queryClient';

// 폰트는 셀프 호스팅(오프라인 대응). 124개 유니코드 서브셋으로 쪼개져 있어
// 브라우저가 실제로 쓰는 범위만 내려받는다.
import '@fontsource-variable/noto-sans-kr';
import '@/styles/tokens.css';
import '@/styles/reset.css';
import '@/styles/global.css';

// 배포 직후, 열려 있던 탭이 사라진 청크를 요청해 백지가 되는 것을 막는다 (mds/05 §4②)
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault();
  if (!sessionStorage.getItem('haru:reloaded')) {
    sessionStorage.setItem('haru:reloaded', '1');
    window.location.reload();
  }
});

// 마지막 성공 응답을 localStorage 에 남겨 오프라인에서도 화면이 비지 않게 한다
setupPersistence();

const container = document.getElementById('root');
if (!container) throw new Error('#root 를 찾을 수 없습니다');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
