import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'white' | 'list';
/** 프로토타입에 실제로 등장하는 높이만 허용한다 (전부 터치 타깃 52px 이상) */
export type ButtonHeight = 76 | 72 | 68 | 66 | 56 | 54;

const heightClass: Record<ButtonHeight, string | undefined> = {
  76: styles.h76,
  72: styles.h72,
  68: styles.h68,
  66: styles.h66,
  56: styles.h56,
  54: styles.h54,
};

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  variant?: ButtonVariant;
  height?: ButtonHeight;
  children: ReactNode;
  className?: string | undefined;
};

export default function Button({
  variant = 'primary',
  height = 72,
  type = 'button',
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      className={cx(styles.btn, heightClass[height], styles[variant], className)}
      {...rest}
    >
      {children}
    </button>
  );
}
