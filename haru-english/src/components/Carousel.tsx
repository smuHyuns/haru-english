import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './Carousel.module.css';

type Props = {
  /** 스크린리더용 — 예: "오늘 볼 영상" */
  label: string;
  /** 항목 수. 점 인디케이터를 그리는 데 쓴다 */
  count: number;
  children: ReactNode;
};

/**
 * 가로 스와이프 캐러셀.
 *
 * 스크롤은 브라우저에 맡기고(CSS scroll-snap) JS 는 '지금 몇 번째인지'만 읽는다.
 * 터치 라이브러리를 쓰면 관성 스크롤·접근성·키보드를 전부 다시 만들어야 하는데,
 * scroll-snap 은 그걸 공짜로 준다.
 */
export default function Carousel({ label, count, children }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  // 스크롤 위치 → 인덱스. rAF 로 묶어 스크롤 한 번에 한 번만 계산한다.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const card = el.firstElementChild as HTMLElement | null;
        if (!card) return;
        // 카드 폭 + gap 이 한 칸. offsetLeft 차이로 구하면 gap 을 따로 안 읽어도 된다
        const second = card.nextElementSibling as HTMLElement | null;
        const step = second ? second.offsetLeft - card.offsetLeft : card.offsetWidth;
        setIndex(Math.max(0, Math.min(count - 1, Math.round(el.scrollLeft / step))));
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [count]);

  const goTo = useCallback((i: number) => {
    const el = trackRef.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  }, []);

  return (
    <div className={styles.wrap}>
      <div
        ref={trackRef}
        className={styles.track}
        role="group"
        aria-label={`${label} — 좌우로 넘겨 보세요`}
      >
        {children}
      </div>

      {count > 1 && (
        <div className={styles.dots}>
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`${i + 1}번째 영상 보기`}
              aria-current={i === index}
              // 겉은 작지만 ::before 로 히트 영역을 넓혀 뒀다
              data-touch-exempt
              className={cx(styles.dot, i === index && styles.dotActive)}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
