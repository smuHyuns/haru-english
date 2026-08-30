import { useState, type ReactNode } from 'react';

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
 * 유튜브 썸네일.
 *
 * src 가 없으면(또는 로드 실패하면) 대각선 스트라이프 플레이스홀더로 떨어진다.
 * 오프라인에서 i.ytimg.com 이 안 잡히는 경우가 실제로 있어서, 실패를 정상 경로로 다룬다.
 */
export function Thumb({
  variant,
  src,
  className,
}: {
  variant: 'large' | 'list';
  src?: string | null;
  className?: string | undefined;
}) {
  const [failed, setFailed] = useState(false);
  const shape = variant === 'list' ? styles.thumbList : styles.thumbLarge;

  if (src && !failed) {
    return (
      <img
        className={cx(styles.thumb, shape, styles.thumbImg, className)}
        src={src}
        alt=""
        aria-hidden
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
      />
    );
  }
  return <div className={cx(styles.thumb, shape, className)} aria-hidden />;
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
