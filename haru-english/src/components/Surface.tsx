import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './Surface.module.css';

/* ── Card ────────────────────────────────────────────── */

type CardProps = {
  /** lg=24 (큰 카드) · md=20 (시트·썸네일) · row=18 (리스트 항목) */
  radius?: 'lg' | 'md' | 'row';
  className?: string | undefined;
  children: ReactNode;
};

export function Card({ radius = 'lg', className, children }: CardProps) {
  return <div className={cx(styles.card, styles[radius], className)}>{children}</div>;
}

/** 카드 안의 흰 내부 카드 (예문 카드) */
export function InnerCard({
  small = false,
  className,
  children,
}: {
  small?: boolean;
  className?: string | undefined;
  children: ReactNode;
}) {
  return <div className={cx(small ? styles.innerSm : styles.inner, className)}>{children}</div>;
}

/* ── Thumb ───────────────────────────────────────────── */

/**
 * 유튜브 썸네일 자리. 아직 실제 이미지가 없어 대각선 스트라이프를 깔아 둔다.
 * Video.thumbnailUrl 이 채워지면 <img> 로 교체 (mds/02 §3).
 */
export function Thumb({
  variant,
  className,
}: {
  variant: 'large' | 'list';
  className?: string | undefined;
}) {
  if (variant === 'list') {
    return <div className={cx(styles.thumb, styles.thumbList, className)} aria-hidden />;
  }
  return (
    <div className={cx(styles.thumb, styles.thumbLarge, className)} aria-hidden>
      <span className={styles.thumbLabel}>youtube thumbnail</span>
    </div>
  );
}

/* ── EmptyState ──────────────────────────────────────── */

export function EmptyState({ title, description }: { title: string; description: ReactNode }) {
  return (
    <div className={styles.empty}>
      <span className={styles.emptyTitle}>{title}</span>
      <span className={styles.emptyDesc}>{description}</span>
    </div>
  );
}
