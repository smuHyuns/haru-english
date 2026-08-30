import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { cx } from '@/lib/cx';

import Button from './Button';
import styles from './Carousel.module.css';

type Props = {
  /** 스크린리더용 — 예: "오늘 볼 영상" */
  label: string;
  /** 항목 수. 점 인디케이터와 이전/다음 버튼 상태를 그리는 데 쓴다 */
  count: number;
  /** 이전/다음 버튼 글자 — 예: "영상" → "이전 영상" */
  itemNoun: string;
  children: ReactNode;
};

/**
 * 가로 스와이프 캐러셀.
 *
 * 스크롤은 브라우저에 맡기고(CSS scroll-snap) JS 는 '지금 몇 번째인지'만 읽는다.
 * 터치 라이브러리를 쓰면 관성 스크롤·접근성·키보드를 전부 다시 만들어야 하는데,
 * scroll-snap 은 그걸 공짜로 준다.
 *
 * 스와이프를 모르는 사용자를 위해 이전/다음 버튼을 같이 둔다.
 */
export default function Carousel({ label, count, itemNoun, children }: Props) {
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
    /*
     * scrollIntoView 를 쓰면 세로 스크롤까지 건드려 페이지가 튄다.
     * 카드 중앙을 스크롤포트 중앙에 맞추는 값을 직접 계산한다.
     */
    el.scrollTo({
      left: card.offsetLeft - el.offsetLeft - (el.clientWidth - card.clientWidth) / 2,
      behavior: 'smooth',
    });
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
        <>
          <div className={styles.dots}>
            {Array.from({ length: count }, (_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`${i + 1}번째 ${itemNoun} 보기`}
                aria-current={i === index}
                // 겉은 작지만 ::before 로 히트 영역을 넓혀 뒀다
                data-touch-exempt
                className={cx(styles.dot, i === index && styles.dotActive)}
                onClick={() => goTo(i)}
              />
            ))}
          </div>

          <div className={styles.pair}>
            {/* 단어 카드와 달리 순환하지 않는다 — 스크롤 위치가 끝에서 처음으로
                튀면 넘긴 건지 되돌아온 건지 알기 어렵다. 끝에서는 흐리게 둔다. */}
            <Button
              variant="secondary"
              height={66}
              disabled={index === 0}
              onClick={() => goTo(index - 1)}
            >
              이전 {itemNoun}
            </Button>
            <Button
              variant="secondary"
              height={66}
              disabled={index === count - 1}
              onClick={() => goTo(index + 1)}
            >
              다음 {itemNoun}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
