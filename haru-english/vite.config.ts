import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// PWA(vite-plugin-pwa)는 Phase 8 에서 추가한다.
// 지금 켜면 개발 중 서비스워커가 캐시를 잡아 디버깅이 어려워진다.

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 실기기(휴대폰)에서 같은 와이파이로 접속해 확인할 때 사용
    host: true,
  },
  build: {
    target: 'es2022',
    // 화면 7개짜리 앱이라 단일 번들로 둔다.
    // 청크를 쪼개면 배포 직후 구버전 탭이 사라진 청크를 요청해 깨질 수 있다 (mds/05 §4②)
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    /*
     * 테스트는 항상 mock 어댑터로 고정한다.
     * Vitest 도 .env.local 을 읽기 때문에, 이걸 안 박아두면 로컬에
     * VITE_DATA_SOURCE=supabase 를 넣은 사람만 테스트가 깨진다 (실제로 그랬다).
     * 테스트가 네트워크와 남의 로컬 설정에 의존하면 안 된다.
     */
    env: { VITE_DATA_SOURCE: 'mock' },
  },
});
