import BottomSheet, { SheetDots } from '@/components/BottomSheet';
import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import { Card, InnerCard } from '@/components/Surface';
import { Play, Star, StarOutline } from '@/components/icons';
import type { DateStr } from '@/data/types';
import { useFavorites, useWordsByDate } from '@/hooks/useData';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { useSpeak } from '@/hooks/useSpeak';
import { formatSheetDate, kstToday } from '@/lib/date';

import styles from './DayWordsSheet.module.css';

type Props = {
  date: DateStr;
  /** 시트 안에서 보고 있는 단어 위치 (0~2) */
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

/** 캘린더에서 지난 날을 눌렀을 때 뜨는 시트 — 그날 배운 단어 3개 */
export default function DayWordsSheet({ date, index, onIndexChange, onClose }: Props) {
  const { data: words } = useWordsByDate(date);
  const { data: favorites } = useFavorites();
  const toggleFavorite = useFavoriteToggle();
  const { speakWord, speakExample } = useSpeak();

  const title = formatSheetDate(date, date === kstToday());

  if (!words || words.length === 0) {
    return <BottomSheet title={title} onClose={onClose} children={null} />;
  }

  // 범위를 벗어난 w 파라미터는 0 으로 눌러 담는다
  const i = Math.min(Math.max(index, 0), words.length - 1);
  const word = words[i]!;
  const isFav = favorites?.words.includes(word.id) ?? false;

  // 3개 안에서 순환 (프로토타입 동일)
  const prev = () => onIndexChange((i - 1 + words.length) % words.length);
  const next = () => onIndexChange((i + 1) % words.length);

  return (
    <BottomSheet title={title} counter={`${i + 1} / ${words.length}`} onClose={onClose}>
      <Card radius="md" className={styles.card}>
        <div className={styles.top}>
          <div className={styles.wordText}>
            <span className={styles.wordEn}>{word.en}</span>
            <span className={styles.wordIpa}>{word.ipa}</span>
            <span className={styles.wordKo}>{word.ko}</span>
          </div>
          <IconButton
            label={isFav ? `${word.en} 즐겨찾기 해제` : `${word.en} 즐겨찾기`}
            tone={isFav ? 'onWhite' : 'offBare'}
            onClick={() => toggleFavorite('words', word.id, isFav)}
          >
            {isFav ? <Star size={26} /> : <StarOutline size={26} />}
          </IconButton>
        </div>

        <InnerCard small className={styles.example}>
          <div className={styles.exampleText}>
            <span className={styles.exampleEn}>{word.exEn}</span>
            <span className={styles.exampleKo}>{word.exKo}</span>
          </div>
          <IconButton label="예문 발음 듣기" tone="fill" onClick={() => speakExample(word.exEn)}>
            <Play size={20} />
          </IconButton>
        </InnerCard>
      </Card>

      <SheetDots count={words.length} index={i} onPick={onIndexChange} />

      <div className={styles.actions}>
        <div className={styles.pair}>
          <Button variant="secondary" height={66} onClick={prev}>
            이전 단어
          </Button>
          <Button variant="secondary" height={66} onClick={next}>
            다음 단어
          </Button>
        </div>
        <Button height={72} onClick={() => speakWord(word.en)}>
          발음 듣기
        </Button>
      </div>
    </BottomSheet>
  );
}
