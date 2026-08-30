import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

import { cx } from '@/lib/cx';

import Button from './Button';
import styles from './Carousel.module.css';

type Props = {
  /** 스크린리더용 — 예: "오늘 볼 영상" */
  label: string;
  /** 항목 수. 점 인디케이터를 그리고 순환 인덱스를 계산하는 데 쓴다 */
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

  /** 목록 끝에서 반대쪽으로 넘어간다 — 다섯 편을 계속 돌려 볼 수 있게 */
  const goTo = useCallback(
    (raw: number) => {
      const el = trackRef.current;
      const i = ((raw % count) + count) % count;
      const card = el?.children[i] as HTMLElement | undefined;
      if (!el || !card) return;
      /*
       * scrollIntoView 를 쓰면 세로 스크롤까지 건드려 페이지가 튄다.
       * 카드 중앙을 스크롤포트 중앙에 맞추는 값을 직접 계산한다.
       *
       * 끝 → 처음은 그대로 부드럽게 되감는다. 순간이동시키면 넘긴 건지
       * 되돌아온 건지 알 수 없는데, 다섯 장이라 되감는 게 눈에 보인다.
       */
      el.scrollTo({
        left: card.offsetLeft - el.offsetLeft - (el.clientWidth - card.clientWidth) / 2,
        behavior: 'smooth',
      });
    },
    [count],
  );

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

          {/* 단어 카드와 같이 순환한다. 손가락으로 넘길 땐 스크롤 컨테이너라
              양 끝에서 멈추지만, 버튼과 점으로는 계속 돌 수 있다. */}
          <div className={styles.pair}>
            <Button variant="secondary" height={66} onClick={() => goTo(index - 1)}>
              이전 {itemNoun}
            </Button>
            <Button variant="secondary" height={66} onClick={() => goTo(index + 1)}>
              다음 {itemNoun}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
