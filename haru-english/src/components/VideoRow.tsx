import type { ReactNode } from 'react';

import { videoMeta, type Video } from '@/data/types';
import { useCategoryLabel } from '@/hooks/useCategoryLabel';
import { useToast } from '@/hooks/useToast';

import IconButton from './IconButton';
import { Thumb } from './Surface';
import { Star, StarOutline } from './icons';
import styles from './VideoRow.module.css';

type Props = {
  video: Video;
  favorite: boolean;
  onToggleFavorite: () => void;
  /** 즐겨찾기 탭은 흰 배경 + accent 별 하나만 쓴다 */
  variant?: 'list' | 'saved';
};

export default function VideoRow({ video, favorite, onToggleFavorite, variant = 'list' }: Props) {
  const label = useCategoryLabel();
  const toast = useToast();

  // 즐겨찾기 탭에서는 항상 켜진 별(누르면 목록에서 빠짐)
  const tone = variant === 'saved' ? 'onWhite' : favorite ? 'onSoft' : 'offWhite';

  return (
    <li className={styles.row}>
      <button
        type="button"
        className={styles.main}
        // 영상 재생은 아직 미구현 — 실제로는 유튜브 임베드 또는 딥링크
        onClick={() => toast.show('준비 중인 기능이에요')}
      >
        <Thumb variant="list" />
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
