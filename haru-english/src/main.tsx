import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

// 배포 직후, 열려 있던 탭이 사라진 청크를 요청해 백지가 되는 것을 막는다 (mds/05 §4②)
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault();
  if (!sessionStorage.getItem('haru:reloaded')) {
    sessionStorage.setItem('haru:reloaded', '1');
    window.location.reload();
  }
});

const container = document.getElementById('root');
if (!container) throw new Error('#root 를 찾을 수 없습니다');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
