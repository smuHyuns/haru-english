/*
 * 아이콘 세트.
 *
 * 프로토타입은 텍스트 글리프(★ ☆ ▶ ‹ › ✕)를 썼는데, 글리프는 기기 폰트에 따라
 * 세로 정렬과 크기가 흔들린다 (핸드오프 README Assets 항목). 인라인 SVG 로 교체.
 * 모두 currentColor 를 따르므로 색은 부모의 color 로 제어한다.
 */

type IconProps = {
  /** 한 변의 px. 프로토타입 글리프 font-size 와 같은 값을 넣으면 시각적으로 맞는다 */
  size?: number;
  className?: string;
};

const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  'aria-hidden': true,
  focusable: false as const,
});

export function Star({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} fill="currentColor">
      <path d="M12 2.6l2.9 5.87 6.48.95-4.69 4.57 1.11 6.45L12 17.4l-5.8 3.04 1.11-6.45-4.69-4.57 6.48-.95L12 2.6z" />
    </svg>
  );
}

export function StarOutline({ size = 24, className }: IconProps) {
  return (
    <svg
      {...base(size)}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    >
      <path d="M12 2.6l2.9 5.87 6.48.95-4.69 4.57 1.11 6.45L12 17.4l-5.8 3.04 1.11-6.45-4.69-4.57 6.48-.95L12 2.6z" />
    </svg>
  );
}

export function Play({ size = 24, className }: IconProps) {
  return (
    <svg {...base(size)} className={className} fill="currentColor">
      <path d="M8.6 5.2a1 1 0 011.52-.85l9.2 5.8a1 1 0 010 1.7l-9.2 5.8A1 1 0 018.6 16.8V5.2z" />
    </svg>
  );
}

export function ChevronLeft({ size = 24, className }: IconProps) {
  return (
    <svg
      {...base(size)}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 5L8 12l6.5 7" />
    </svg>
  );
}

export function ChevronRight({ size = 24, className }: IconProps) {
  return (
    <svg
      {...base(size)}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 5L16 12l-6.5 7" />
    </svg>
  );
}

export function Close({ size = 24, className }: IconProps) {
  return (
    <svg
      {...base(size)}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />
    </svg>
  );
}
