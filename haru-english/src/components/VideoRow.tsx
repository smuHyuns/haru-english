import type { ReactNode } from 'react';

import { thumbnailUrl, videoMeta, type Video } from '@/data/types';
import { useCategoryLabel } from '@/hooks/useCategoryLabel';

import IconButton from './IconButton';
import { Thumb } from './Surface';
import { Star, StarOutline } from './icons';
import styles from './VideoRow.module.css';

type Props = {
  video: Video;
  favorite: boolean;
  onToggleFavorite: () => void;
  onPlay: () => void;
  /** 즐겨찾기 탭은 흰 배경 + accent 별 하나만 쓴다 */
  variant?: 'list' | 'saved';
};

export default function VideoRow({
  video,
  favorite,
  onToggleFavorite,
  onPlay,
  variant = 'list',
}: Props) {
  const label = useCategoryLabel();

  // 즐겨찾기 탭에서는 항상 켜진 별(누르면 목록에서 빠짐)
  const tone = variant === 'saved' ? 'onWhite' : favorite ? 'onSoft' : 'offWhite';

  return (
    <li className={styles.row}>
      {/* 라벨을 명시하지 않으면 접근성 이름이 '생활회화1강 …20분 · 1일1영어' 로
          이어붙어 읽힌다. 무엇을 하는 버튼인지가 빠진다. */}
      <button
        type="button"
        className={styles.main}
        aria-label={`${video.title} 재생`}
        onClick={onPlay}
      >
        <Thumb variant="list" src={thumbnailUrl(video)} />
        <span className={styles.text}>
          <span className={styles.cat}>{label(video.categoryId)}</span>
          <span className={styles.title}>{video.title}</span>
          <span className={styles.meta}>{videoMeta(video)}</span>
        </span>
      </button>

      <IconButton
        label={favorite ? `${video.title} 즐겨찾기 해제` : `${video.title} 즐겨찾기`}
        tone={tone}
        onClick={onToggleFavorite}
      >
        {favorite ? <Star size={variant === 'saved' ? 22 : 24} /> : <StarOutline size={24} />}
      </IconButton>
    </li>
  );
}

export function VideoList({ children }: { children: ReactNode }) {
  return <ul className={styles.list}>{children}</ul>;
}
