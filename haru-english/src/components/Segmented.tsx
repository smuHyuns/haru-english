import { cx } from '@/lib/cx';

import styles from './Segmented.module.css';

type Option<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  /** 그룹 용도 설명 (스크린리더) */
  label: string;
  options: readonly Option<T>[];
  value: T;
  onChange: (id: T) => void;
  /** fill=가로를 꽉 채움(즐겨찾기 탭) · compact=내용 폭만(영상 정렬) */
  variant?: 'fill' | 'compact';
  /**
   * tabs 는 화면을 갈아끼울 때, radio 는 같은 화면의 옵션을 고를 때.
   * 정렬 기준을 tab 으로 읽어 주면 스크린리더 사용자가 다른 화면으로 가는 줄 안다.
   */
  semantics?: 'tabs' | 'radio';
};

export default function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
  variant = 'fill',
  semantics = 'tabs',
}: Props<T>) {
  const isTabs = semantics === 'tabs';
  return (
    <div
      className={cx(styles.group, variant === 'compact' && styles.compact)}
      role={isTabs ? 'tablist' : 'radiogroup'}
      aria-label={label}
    >
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            role={isTabs ? 'tab' : 'radio'}
            {...(isTabs ? { 'aria-selected': active } : { 'aria-checked': active })}
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
