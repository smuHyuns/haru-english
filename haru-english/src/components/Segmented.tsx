import { cx } from '@/lib/cx';

import styles from './Segmented.module.css';

type Option<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  /** 그룹 용도 설명 (스크린리더) */
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (id: T) => void;
};

export default function Segmented<T extends string>({ label, options, value, onChange }: Props<T>) {
  return (
    <div className={styles.group} role="tablist" aria-label={label}>
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.id)}
            className={cx(styles.item, active && styles.active)}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
