/*
 * PWA 아이콘 생성기.
 *
 * 결과물(public/icons/*.png)은 커밋되므로 평소 빌드에는 필요 없다.
 * 로고나 accent 색이 바뀔 때만 다시 돌린다:
 *
 *   npm i -D sharp && node scripts/make-icons.mjs && npm un -D sharp
 *
 * 글자는 폰트가 아니라 도형(사각형·평행사변형)으로 그린다.
 * 폰트에 기대면 이 스크립트를 돌리는 기계마다 결과가 달라지는데,
 * 아이콘은 한 번 구워서 커밋하는 물건이라 결정론적인 쪽이 낫다.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import sharp from 'sharp';

const ACCENT = '#3182f6'; // tokens.css --accent
const WHITE = '#ffffff';
const OUT = new URL('../public/icons/', import.meta.url);

/**
 * "EN" 을 100 단위 높이 기준으로 그린 path.
 * E: 세로 기둥 + 가로 3줄 / N: 세로 기둥 2개 + 대각선 띠
 * 900 웨이트 느낌을 내려고 획을 두껍게(22) 잡았다.
 */
function enPaths(x, y, h) {
  const u = h / 100; // 100 단위 → 실제 크기
  const p = (n) => n * u;
  const E = [
    // 세로 기둥
    `M${x + p(0)},${y + p(0)} h${p(22)} v${p(100)} h${-p(22)} z`,
    // 위 / 가운데 / 아래 가로줄
    `M${x + p(0)},${y + p(0)} h${p(62)} v${p(22)} h${-p(62)} z`,
    `M${x + p(0)},${y + p(39)} h${p(56)} v${p(22)} h${-p(56)} z`,
    `M${x + p(0)},${y + p(78)} h${p(62)} v${p(22)} h${-p(62)} z`,
  ];
  const nx = x + p(74); // E 와의 자간 (-0.06em 느낌으로 바짝)
  const N = [
    `M${nx},${y} h${p(22)} v${p(100)} h${-p(22)} z`,
    `M${nx + p(56)},${y} h${p(22)} v${p(100)} h${-p(22)} z`,
    // 대각선 띠 — 왼쪽 기둥 위에서 오른쪽 기둥 아래로
    `M${nx},${y} L${nx + p(22)},${y} L${nx + p(78)},${y + p(100)} L${nx + p(56)},${y + p(100)} z`,
  ];
  return [...E, ...N].join(' ');
}

/** 글리프 전체 폭 (100 단위 기준) — E 62 + 자간 12 + N 78 = 152 */
const GLYPH_W = 152;

/**
 * @param size    한 변 픽셀
 * @param inset   로고가 차지할 비율. maskable 은 바깥이 잘려나가므로 작게 잡는다
 * @param radius  모서리 라운드 (null = 정사각, 마스크가 알아서 자름)
 */
function svg(size, { inset, radius }) {
  const glyphH = size * inset;
  const glyphW = glyphH * (GLYPH_W / 100);
  const x = (size - glyphW) / 2;
  const y = (size - glyphH) / 2;

  const bg =
    radius === null
      ? `<rect width="${size}" height="${size}" fill="${ACCENT}"/>`
      : `<rect width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="${ACCENT}"/>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  ${bg}
  <path d="${enPaths(x, y, glyphH)}" fill="${WHITE}"/>
</svg>`;
}

mkdirSync(OUT, { recursive: true });

const targets = [
  // 일반 아이콘 — 프로토타입 로고 타일처럼 라운드 사각형 (22/68 비율을 유지)
  { file: 'pwa-192.png', size: 192, inset: 0.3, radius: 192 * (22 / 68) },
  { file: 'pwa-512.png', size: 512, inset: 0.3, radius: 512 * (22 / 68) },
  // iOS 홈화면 — iOS 가 알아서 라운딩하므로 정사각으로 준다
  { file: 'apple-touch-icon.png', size: 180, inset: 0.3, radius: null },
  /*
   * maskable — 안드로이드가 원/사각/물방울 등 임의 모양으로 잘라낸다.
   * 안전 영역은 가운데 지름 80% 원. 글리프 대각 반지름이
   * inset * sqrt(0.76² + 0.5²) = inset * 0.91 이므로 inset ≤ 0.44 면 안 잘린다.
   * 0.28 이면 잘린 뒤 일반 아이콘과 비슷한 비중으로 보이면서 여유가 남는다.
   * 배경은 전면 채움이라 어떤 모양으로 잘려도 accent 만 보인다.
   */
  { file: 'maskable-512.png', size: 512, inset: 0.28, radius: null },
];

for (const { file, size, inset, radius } of targets) {
  const source = Buffer.from(svg(size, { inset, radius }));
  await sharp(source).png({ compressionLevel: 9 }).toFile(new URL(file, OUT).pathname.slice(1));
  console.log(`  ${file}  ${size}×${size}`);
}

// 브라우저 탭용 벡터 파비콘 — 어떤 배율에서도 선명하다
writeFileSync(new URL('favicon.svg', OUT), svg(64, { inset: 0.34, radius: 14 }));
console.log('  favicon.svg');
