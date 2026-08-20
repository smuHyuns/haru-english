import { MIN_TOUCH_PX } from './constants';

/*
 * 개발 모드 터치 타깃 점검.
 *
 * 성인·어르신 사용자 전제라 인터랙티브 요소는 최소 52px 이어야 한다
 * (핸드오프 README 「재현 시 주의」 3번). 눈으로는 놓치기 쉬워서 런타임에 잰다.
 *
 * 프로덕션 번들에는 들어가지 않는다 (import.meta.env.DEV 가 false 면
 * 아래 본문이 통째로 트리셰이킹된다).
 */

const SELECTOR = 'button, a[href], input, [role="button"], [role="tab"]';

/** 시각적 크기는 작아도 히트 영역을 ::before 로 넓혀둔 요소는 건너뛴다 */
const EXEMPT_ATTR = 'data-touch-exempt';

export function auditTouchTargets(): number {
  const nodes = document.querySelectorAll<HTMLElement>(SELECTOR);
  const violations: { el: HTMLElement; w: number; h: number }[] = [];

  for (const el of nodes) {
    if (el.hasAttribute(EXEMPT_ATTR)) continue;

    const { width, height } = el.getBoundingClientRect();
    // 화면에 없는(숨겨진) 요소는 0×0 으로 나오므로 제외
    if (width === 0 && height === 0) continue;

    if (width < MIN_TOUCH_PX || height < MIN_TOUCH_PX) {
      violations.push({ el, w: Math.round(width), h: Math.round(height) });
      el.setAttribute('data-touch-violation', '');
    } else {
      el.removeAttribute('data-touch-violation');
    }
  }

  if (violations.length > 0) {
    console.warn(
      `[touch-audit] ${MIN_TOUCH_PX}px 미만 터치 타깃 ${violations.length}개`,
      violations.map(({ el, w, h }) => ({
        size: `${w}×${h}`,
        text: el.textContent?.trim().slice(0, 20) || el.getAttribute('aria-label') || '(무명)',
        el,
      })),
    );
  }

  return violations.length;
}

/** 개발 모드에서 라우트 이동·리렌더 후 주기적으로 점검한다 */
export function startTouchAudit() {
  if (!import.meta.env.DEV) return;

  document.documentElement.setAttribute('data-touch-audit', '');

  let queued = false;
  const run = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      auditTouchTargets();
    });
  };

  run();
  const observer = new MutationObserver(run);
  observer.observe(document.body, { childList: true, subtree: true });
}
