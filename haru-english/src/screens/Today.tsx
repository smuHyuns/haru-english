import { useState } from 'react';

import Button from '@/components/Button';
import Carousel from '@/components/Carousel';
import IconButton from '@/components/IconButton';
import { Card, InnerCard, Thumb } from '@/components/Surface';
import VideoPlayer from '@/components/VideoPlayer';
import { Play, Star, StarOutline } from '@/components/icons';
import { thumbnailUrl, videoMeta, type Video } from '@/data/types';
import { useCategoryLabel } from '@/hooks/useCategoryLabel';
import { useFavorites, useTodayVideos, useTodayWords } from '@/hooks/useData';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { useSpeak } from '@/hooks/useSpeak';

import styles from './Today.module.css';

export default function Today() {
  const { speakWord, speakExample } = useSpeak();
  const categoryLabel = useCategoryLabel();

  const { data: words } = useTodayWords();
  const { data: videos } = useTodayVideos();
  const { data: favorites } = useFavorites();
  const toggleFavorite = useFavoriteToggle();

  // 프로토타입과 동일: 인덱스는 음수도 허용하고 렌더할 때 모듈로로 정규화한다 (무한 순환)
  const [wordIndex, setWordIndex] = useState(0);
  const [playing, setPlaying] = useState<Video | null>(null);

  if (!words || words.length === 0) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} />
        <div className={styles.skeletonRow} />
      </div>
    );
  }

  const i = ((wordIndex % words.length) + words.length) % words.length;
  const word = words[i]!;
  const isFav = favorites?.words.includes(word.id) ?? false;

  return (
    <div className={styles.page}>
      <Card className={styles.wordCard}>
        <div className={styles.cardTop}>
          <div className={styles.cardLabelRow}>
            <span className={styles.cardLabel}>오늘의 단어</span>
            <span className={styles.counter}>
              {i + 1} / {words.length}
            </span>
          </div>
          <IconButton
            label={isFav ? `${word.en} 즐겨찾기 해제` : `${word.en} 즐겨찾기`}
            tone={isFav ? 'onWhite' : 'offBare'}
            className={styles.favButton}
            onClick={() => toggleFavorite('words', word.id, isFav)}
          >
            {isFav ? <Star size={26} /> : <StarOutline size={26} />}
          </IconButton>
        </div>

        <div className={styles.wordBlock}>
          <span className={styles.wordEn}>{word.en}</span>
          <span className={styles.wordIpa}>{word.ipa}</span>
          <span className={styles.wordKo}>{word.ko}</span>
        </div>

        <InnerCard className={styles.example}>
          <div className={styles.exampleText}>
            <span className={styles.exampleEn}>{word.exEn}</span>
            <span className={styles.exampleKo}>{word.exKo}</span>
          </div>
          <IconButton
            label="예문 발음 듣기"
            tone="fill"
            onClick={() => speakExample(word.exEn)}
          >
            <Play size={20} />
          </IconButton>
        </InnerCard>
      </Card>

      <div className={styles.actions}>
        <Button height={72} onClick={() => speakWord(word.en)}>
          발음 듣기
        </Button>
        <div className={styles.pair}>
          <Button variant="secondary" height={66} onClick={() => setWordIndex((n) => n - 1)}>
            이전 단어
          </Button>
          <Button variant="secondary" height={66} onClick={() => setWordIndex((n) => n + 1)}>
            다음 단어
          </Button>
        </div>
      </div>

      {videos && videos.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>오늘 볼 영상</h2>
          <Carousel label="오늘 볼 영상" count={videos.length}>
            {videos.map((v) => (
              <button
                key={v.id}
                type="button"
                className={styles.videoCard}
                aria-label={`${v.title} 재생`}
                onClick={() => setPlaying(v)}
              >
                <Thumb variant="large" src={thumbnailUrl(v)} />
                <div className={styles.videoBody}>
                  <span className={styles.videoCat}>{categoryLabel(v.categoryId)}</span>
                  <span className={styles.videoTitle}>{v.title}</span>
                  <span className={styles.videoMeta}>{videoMeta(v)}</span>
                </div>
              </button>
            ))}
          </Carousel>
        </section>
      )}

      {playing && <VideoPlayer video={playing} onClose={() => setPlaying(null)} />}
    </div>
  );
}
