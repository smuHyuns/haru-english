import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import IconButton from '@/components/IconButton';
import Segmented from '@/components/Segmented';
import { EmptyState } from '@/components/Surface';
import VideoPlayer from '@/components/VideoPlayer';
import VideoRow, { VideoList } from '@/components/VideoRow';
import { Star } from '@/components/icons';
import { useFavoriteVideos, useFavoriteWords } from '@/hooks/useData';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import type { Video } from '@/data/types';
import { useSpeak } from '@/hooks/useSpeak';

import styles from './Saved.module.css';

type View = 'words' | 'videos';

const OPTIONS = [
  { id: 'words', label: '단어' },
  { id: 'videos', label: '영상' },
] as const;

export default function Saved() {
  const [params, setParams] = useSearchParams();
  const view: View = params.get('view') === 'videos' ? 'videos' : 'words';

  const { data: favWordsData } = useFavoriteWords();
  const { data: favVideosData } = useFavoriteVideos();
  const toggleFavorite = useFavoriteToggle();
  const { speakWord } = useSpeak();

  const [playing, setPlaying] = useState<Video | null>(null);

  const favWords = favWordsData ?? [];
  const favVideos = favVideosData ?? [];

  return (
    <div className={styles.page}>
      <Segmented
        label="즐겨찾기 종류"
        options={OPTIONS}
        value={view}
        onChange={(id) => setParams(id === 'words' ? {} : { view: id }, { replace: true })}
      />

      {view === 'words' ? (
        favWords.length === 0 ? (
          <EmptyState
            title="즐겨찾기한 단어가 없어요"
            description={
              <>
                오늘의 단어에서 ‘즐겨찾기’를 누르면
                <br />
                여기에 모여요.
              </>
            }
          />
        ) : (
          <ul className={styles.list}>
            {favWords.map((w) => (
              <li key={w.id} className={styles.wordRow}>
                <div className={styles.wordText}>
                  <span className={styles.wordEn}>{w.en}</span>
                  <span className={styles.wordKo}>{w.ko}</span>
                </div>
                <div className={styles.wordActions}>
                  <button
                    type="button"
                    className={styles.listenButton}
                    onClick={() => speakWord(w.en)}
                  >
                    듣기
                  </button>
                  {/* 누르면 목록에서 바로 사라진다 (프로토타입 동일) */}
                  <IconButton
                    label={`${w.en} 즐겨찾기 해제`}
                    tone="onWhite"
                    onClick={() => toggleFavorite('words', w.id, true)}
                  >
                    <Star size={22} />
                  </IconButton>
                </div>
              </li>
            ))}
          </ul>
        )
      ) : favVideos.length === 0 ? (
        <EmptyState
          title="즐겨찾기한 영상이 없어요"
          description={
            <>
              영상 목록에서 ★ 를 누르면
              <br />
              여기에 모여요.
            </>
          }
        />
      ) : (
        <VideoList>
          {favVideos.map((v) => (
            <VideoRow
              key={v.id}
              video={v}
              favorite
              variant="saved"
              onToggleFavorite={() => toggleFavorite('videos', v.id, true)}
              onPlay={() => setPlaying(v)}
            />
          ))}
        </VideoList>
      )}

      {playing && <VideoPlayer video={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
