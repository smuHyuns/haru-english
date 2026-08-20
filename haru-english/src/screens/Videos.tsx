import { useSearchParams } from 'react-router-dom';

import { Chip, ChipRow } from '@/components/Chip';
import VideoRow, { VideoList } from '@/components/VideoRow';
import type { CategoryFilter } from '@/data/types';
import { useCategories, useFavorites, useVideos } from '@/hooks/useData';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';

import styles from './Videos.module.css';

const VALID: CategoryFilter[] = ['all', 'daily', 'travel', 'restaurant', 'shopping', 'hospital'];

export default function Videos() {
  const [params, setParams] = useSearchParams();

  const raw = params.get('cat') as CategoryFilter | null;
  const cat: CategoryFilter = raw && VALID.includes(raw) ? raw : 'all';

  const { data: categories } = useCategories();
  const { data: videos } = useVideos(cat);
  const { data: favorites } = useFavorites();
  const toggleFavorite = useFavoriteToggle();

  const pick = (id: CategoryFilter) => {
    // 필터를 URL 에 담아 새로고침·뒤로가기에서 유지되게 한다
    setParams(id === 'all' ? {} : { cat: id }, { replace: true });
  };

  return (
    <div className={styles.page}>
      <ChipRow label="카테고리">
        {categories?.map((c) => (
          <Chip key={c.id} selected={c.id === cat} onClick={() => pick(c.id)}>
            {c.label}
          </Chip>
        ))}
      </ChipRow>

      <VideoList>
        {videos?.map((v) => {
          const fav = favorites?.videos.includes(v.id) ?? false;
          return (
            <VideoRow
              key={v.id}
              video={v}
              favorite={fav}
              onToggleFavorite={() => toggleFavorite('videos', v.id, fav)}
            />
          );
        })}
      </VideoList>
    </div>
  );
}
