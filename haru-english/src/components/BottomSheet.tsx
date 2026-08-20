import { useEffect, type ReactNode } from 'react';

import { cx } from '@/lib/cx';

import IconButton from './IconButton';
import { Close } from './icons';
import styles from './BottomSheet.module.css';

type Props = {
  /** 헤더 왼쪽 제목 — 예: "8월 20일 (오늘)" */
  title: string;
  /** 제목 옆 칩 — 예: "1 / 3" */
  counter?: string;
  onClose: () => void;
  children: ReactNode;
};

export default function BottomSheet({ title, counter, onClose, children }: Props) {
  // 하드웨어 키보드 사용자를 위한 Esc 닫기. UI 상 뒤로가기는 없고 시트만 닫힌다.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      {/* 위쪽 여백을 누르면 닫힘 (프로토타입 동일) */}
      <button type="button" className={styles.scrim} aria-label="닫기" onClick={onClose} />

      <div className={styles.panel}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <span className={styles.date}>{title}</span>
            {counter && <span className={styles.counter}>{counter}</span>}
          </div>
          <IconButton label="닫기" tone="plainFill" size={48} onClick={onClose}>
            <Close size={20} />
          </IconButton>
        </div>

        {children}
      </div>
    </div>
  );
}

/** 시트 하단 점 인디케이터 — 누르면 해당 단어로 이동 */
export function SheetDots({
  count,
  index,
  onPick,
}: {
  count: number;
  index: number;
  onPick: (i: number) => void;
}) {
  return (
    <div className={styles.dots}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${i + 1}번째 단어`}
          aria-current={i === index}
          // 겉은 8px 이지만 ::before 로 히트 영역을 52px 로 넓혀 뒀다
          data-touch-exempt
          onClick={() => onPick(i)}
          className={cx(styles.dot, i === index && styles.dotActive)}
        />
      ))}
    </div>
  );
}
