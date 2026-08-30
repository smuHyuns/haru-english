import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Chip, ChipRow } from '@/components/Chip';
import Segmented from '@/components/Segmented';
import VideoPlayer from '@/components/VideoPlayer';
import VideoRow, { VideoList } from '@/components/VideoRow';
import type { CategoryFilter, Video } from '@/data/types';
import { useCategories, useFavorites, useVideos } from '@/hooks/useData';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';

import styles from './Videos.module.css';

const VALID: CategoryFilter[] = ['all', 'daily', 'pack', 'speaking', 'study'];

type SortId = 'order' | 'name';

// 기본값이 앞에 온다 — URL 에 sort 파라미터가 없으면 이름순
const SORTS = [
  { id: 'name', label: '이름순' },
  { id: 'order', label: '등록순' },
] as const;

/*
 * numeric: true 가 핵심이다. 생활회화 제목이 '1강 …' ~ '409강 …' 이라
 * 순수 문자열 비교를 하면 100강 < 10강 < 1강 순으로 뒤집힌다.
 */
const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' });

export default function Videos() {
  const [params, setParams] = useSearchParams();

  const rawCat = params.get('cat') as CategoryFilter | null;
  const cat: CategoryFilter = rawCat && VALID.includes(rawCat) ? rawCat : 'all';
  const sort: SortId = params.get('sort') === 'order' ? 'order' : 'name';

  const { data: categories } = useCategories();
  const { data: videos } = useVideos(cat);
  const { data: favorites } = useFavorites();
  const toggleFavorite = useFavoriteToggle();

  const [playing, setPlaying] = useState<Video | null>(null);

  /** 필터·정렬을 URL 에 담아 새로고침·뒤로가기에서 유지한다. 기본값이면 파라미터를 뺀다. */
  const setParam = (key: 'cat' | 'sort', value: string | null) => {
    const next = new URLSearchParams(params);
    if (value === null) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const shown = useMemo(() => {
    if (!videos) return undefined;
    // 등록순은 어댑터가 이미 커리큘럼 순으로 준다 (sort_order)
    if (sort === 'order') return videos;
    // 캐시에 든 배열을 그대로 정렬하면 다른 화면이 쓰는 순서까지 바뀐다
    return [...videos].sort((a, b) => collator.compare(a.title, b.title));
  }, [videos, sort]);

  return (
    <div className={styles.page}>
      <ChipRow label="카테고리">
        {categories?.map((c) => (
          <Chip
            key={c.id}
            selected={c.id === cat}
            onClick={() => setParam('cat', c.id === 'all' ? null : c.id)}
          >
            {c.label}
          </Chip>
        ))}
      </ChipRow>

      <div className={styles.toolbar}>
        {/* 439개나 되므로 몇 개를 보고 있는지 알려 준다 */}
        <span className={styles.count}>{shown ? `영상 ${shown.length}개` : ' '}</span>
        <Segmented
          label="정렬 기준"
          variant="compact"
          semantics="radio"
          options={SORTS}
          value={sort}
          onChange={(id) => setParam('sort', id === 'name' ? null : id)}
        />
      </div>

      <VideoList>
        {shown?.map((v) => {
          const fav = favorites?.videos.includes(v.id) ?? false;
          return (
            <VideoRow
              key={v.id}
              video={v}
              favorite={fav}
              onToggleFavorite={() => toggleFavorite('videos', v.id, fav)}
              onPlay={() => setPlaying(v)}
            />
          );
        })}
      </VideoList>

      {playing && <VideoPlayer video={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
