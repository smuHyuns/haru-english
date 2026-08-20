import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cx } from '@/lib/cx';

import styles from './IconButton.module.css';

export type IconButtonTone =
  | 'onWhite' // 즐겨찾기 ON — 홈·시트 단어 카드
  | 'offBare' // 즐겨찾기 OFF — 홈·시트 단어 카드
  | 'onSoft' // 즐겨찾기 ON — 영상 리스트
  | 'offWhite' // 즐겨찾기 OFF — 영상 리스트
  | 'fill' // 예문 재생 ▶
  | 'plainWhite' // 캘린더 월 이동
  | 'plainFill'; // 시트 닫기

export type IconButtonSize = 56 | 52 | 48;

const sizeClass: Record<IconButtonSize, string | undefined> = {
  56: styles.s56,
  52: styles.s52,
  48: styles.s48,
};

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> & {
  /** 스크린리더용 라벨 — 아이콘만 있는 버튼이므로 필수 */
  label: string;
  tone?: IconButtonTone;
  size?: IconButtonSize;
  /** 이동 한계 등 '흐리게 보이지만 클릭은 no-op' 상태 */
  dimmed?: boolean;
  children: ReactNode;
  className?: string | undefined;
};

export default function IconButton({
  label,
  tone = 'fill',
  size = 56,
  dimmed = false,
  type = 'button',
  className,
  children,
  ...rest
}: Props) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(styles.btn, sizeClass[size], styles[tone], dimmed && styles.dimmed, className)}
      {...rest}
    >
      {children}
    </button>
  );
}
