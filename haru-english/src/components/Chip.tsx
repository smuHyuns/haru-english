import type { ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './Chip.module.css';

type ChipProps = {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
};

export function Chip({ selected = false, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cx(styles.chip, selected && styles.selected)}
    >
      {children}
    </button>
  );
}

/** 칩 행 — flex-wrap, gap 8 */
export function ChipRow({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className={styles.row} role="group" aria-label={label}>
      {children}
    </div>
  );
}
