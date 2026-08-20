import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import { Card, InnerCard, Thumb } from '@/components/Surface';
import { Play, Star, StarOutline } from '@/components/icons';
import { videoMeta } from '@/data/types';
import { useCategoryLabel } from '@/hooks/useCategoryLabel';
import { useFavorites, useTodayWords, useToggleFavorite, useVideos } from '@/hooks/useData';
import { useSpeak } from '@/hooks/useSpeak';

import styles from './Today.module.css';

export default function Today() {
  const navigate = useNavigate();
  const { speakWord, speakExample } = useSpeak();
  const categoryLabel = useCategoryLabel();

  const { data: words } = useTodayWords();
  const { data: videos } = useVideos('all');
  const { data: favorites } = useFavorites();
  const toggleFavorite = useToggleFavorite();

  // 프로토타입과 동일: 인덱스는 음수도 허용하고 렌더할 때 모듈로로 정규화한다 (무한 순환)
  const [wordIndex, setWordIndex] = useState(0);

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

  // 프로토타입 의도: 단어를 넘겨도 '오늘 볼 영상'은 첫 번째로 고정된다
  const pick = videos?.[0];

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
            onClick={() => toggleFavorite.mutate({ kind: 'words', id: word.id, on: !isFav })}
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

      {pick && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>오늘 볼 영상</h2>
          <button type="button" className={styles.videoCard} onClick={() => navigate('/videos')}>
            <Thumb variant="large" />
            <div className={styles.videoBody}>
              <span className={styles.videoCat}>{categoryLabel(pick.categoryId)}</span>
              <span className={styles.videoTitle}>{pick.title}</span>
              <span className={styles.videoMeta}>{videoMeta(pick)}</span>
            </div>
          </button>
        </section>
      )}
    </div>
  );
}
