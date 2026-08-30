import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      /*
       * autoUpdate: 새 버전을 발견하면 알아서 갈아끼운다.
       * 대상 사용자(어르신)에게 "새 버전이 있어요, 새로고침할까요?" 를 묻는 건
       * 답하기 어려운 질문이다. 앱을 매일 새로 여는 사용 패턴이라 갱신은
       * 대개 진입 시점에 끝나고 화면에는 드러나지 않는다.
       */
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      /*
       * includeAssets 는 쓰지 않는다 — globPatterns 가 png/svg 를 이미 잡는다.
       * 참고: 매니페스트에 적힌 아이콘은 플러그인이 별도로 precache 에 넣기 때문에
       * globPatterns 와 겹쳐 목록에 두 번 나온다. revision 이 같아 워크박스가 합치므로
       * 동작에는 문제가 없다 (다르면 add-to-cache-list-conflicting-entries 로 터진다).
       */

      manifest: {
        name: '하루영어',
        short_name: '하루영어',
        description: '매일 한 단어, 매일 한 영상 — 하루영어',
        lang: 'ko',
        // '/' 로 두면 스플래시부터 시작한다 (홈화면에서 열어도 앱과 같은 흐름)
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#3182f6',
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          // maskable 을 따로 두는 이유: 안드로이드가 임의 모양으로 잘라내는데,
          // 일반 아이콘을 쓰면 라운드 모서리가 잘려 흰 테두리가 생긴다
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },

      workbox: {
        /*
         * woff2 를 절대 넣지 않는다.
         * 폰트가 124개 유니코드 서브셋으로 쪼개져 총 3.7MB 인데, 여기 넣으면
         * 첫 방문에 전부 내려받는다. 실제로 쓰는 건 한글 몇 개 서브셋뿐이라
         * 아래 runtimeCaching 으로 "쓴 것만" 캐시한다.
         */
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
        // SPA — 오프라인에서 /today 같은 경로로 들어와도 셸을 띄운다
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // 실제로 요청된 서브셋만 캐시에 쌓인다. 해시 파일명이라 무효화가 필요 없다.
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'haru-fonts',
              expiration: { maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            /*
             * 유튜브 썸네일. 영상이 439개라 precache 는 불가능하고, 그럴 이유도 없다 —
             * 실제로 본 영상만 쌓인다. 이게 없으면 비행기 모드에서 즐겨찾기 목록의
             * 썸네일이 전부 스트라이프 플레이스홀더로 떨어진다.
             *
             * statuses 에 0 을 넣는 이유: i.ytimg.com 응답이 opaque(CORS 없는 no-cors)라
             * status 가 0 으로 온다. 0 을 빼면 아무것도 캐시되지 않는다.
             */
            urlPattern: ({ url }) => url.hostname === 'i.ytimg.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'haru-thumbs',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        /*
         * Supabase 응답은 서비스워커로 캐시하지 않는다.
         * 오프라인 대응은 TanStack Query 의 localStorage 영속화가 이미 하고 있고,
         * 두 겹으로 캐시하면 로그아웃 후에도 남의 데이터가 남을 위험이 생긴다.
         */
      },

      // 개발 중에는 끈다 — 서비스워커가 캐시를 잡으면 디버깅이 어려워진다
      devOptions: { enabled: false },
    }),
  ],
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
