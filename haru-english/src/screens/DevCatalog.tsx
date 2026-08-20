import { useState } from 'react';

import BottomSheet, { SheetDots } from '@/components/BottomSheet';
import Button from '@/components/Button';
import { Chip, ChipRow } from '@/components/Chip';
import IconButton from '@/components/IconButton';
import Segmented from '@/components/Segmented';
import { Card, EmptyState, InnerCard, Thumb } from '@/components/Surface';
import { ChevronLeft, ChevronRight, Close, Play, Star, StarOutline } from '@/components/icons';
import { useToast } from '@/hooks/useToast';

import styles from './DevCatalog.module.css';

/**
 * 개발용 컴포넌트 카탈로그 (/__dev).
 * 실기기에서 터치 타깃·눌림 피드백·글리프 정렬을 한 화면에서 확인하려고 만든 것.
 * 프로덕션 라우트에서는 제외한다.
 */
export default function DevCatalog() {
  const toast = useToast();
  const [cat, setCat] = useState('daily');
  const [view, setView] = useState<'words' | 'videos'>('words');
  const [fav, setFav] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dot, setDot] = useState(0);

  return (
    <div className={styles.page}>
      <Section title="Button" note="76 / 72 / 68 / 66 — 전부 터치 타깃 52px 이상">
        <div className={styles.stack}>
          <Button height={76} onClick={() => toast.show('로그인')}>
            로그인
          </Button>
          <Button height={72} onClick={() => toast.show('🔊 grocery 발음 재생 중')}>
            발음 듣기
          </Button>
          <div className={styles.pair}>
            <Button variant="secondary" height={66}>
              이전 단어
            </Button>
            <Button variant="secondary" height={66}>
              다음 단어
            </Button>
          </div>
          <Button variant="list" height={68} onClick={() => toast.show('준비 중인 기능이에요')}>
            알림 시간 설정
          </Button>
          <Button variant="white" height={56}>
            듣기
          </Button>
        </div>
      </Section>

      <Section title="IconButton" note="즐겨찾기 토글 · 재생 · 월 이동 · 닫기">
        <div className={styles.icons}>
          <IconButton
            label={fav ? '즐겨찾기 해제' : '즐겨찾기'}
            tone={fav ? 'onWhite' : 'offBare'}
            onClick={() => {
              setFav(!fav);
              toast.show(fav ? '즐겨찾기에서 뺐어요' : '즐겨찾기에 담았어요');
            }}
          >
            {fav ? <Star size={26} /> : <StarOutline size={26} />}
          </IconButton>
          <IconButton label="즐겨찾기 켜짐" tone="onSoft">
            <Star size={24} />
          </IconButton>
          <IconButton label="즐겨찾기 꺼짐" tone="offWhite">
            <StarOutline size={24} />
          </IconButton>
          <IconButton label="예문 재생" tone="fill" onClick={() => toast.show('🔊 예문 재생 중')}>
            <Play size={20} />
          </IconButton>
          <IconButton label="이전 달" tone="plainWhite" size={52}>
            <ChevronLeft size={20} />
          </IconButton>
          <IconButton label="다음 달" tone="plainWhite" size={52} dimmed>
            <ChevronRight size={20} />
          </IconButton>
          <IconButton label="닫기" tone="plainFill" size={48}>
            <Close size={20} />
          </IconButton>
        </div>
      </Section>

      <Section title="Chip" note="카테고리 필터 — height 54, pill">
        <ChipRow label="카테고리">
          {[
            ['all', '전체'],
            ['daily', '일상'],
            ['travel', '여행'],
            ['restaurant', '식당'],
            ['shopping', '쇼핑'],
            ['hospital', '병원'],
          ].map(([id, label]) => (
            <Chip key={id} selected={cat === id} onClick={() => setCat(id!)}>
              {label}
            </Chip>
          ))}
        </ChipRow>
      </Section>

      <Section title="Segmented">
        <Segmented
          label="즐겨찾기 종류"
          value={view}
          onChange={setView}
          options={[
            { id: 'words', label: '단어' },
            { id: 'videos', label: '영상' },
          ]}
        />
      </Section>

      <Section title="Card / Thumb">
        <Card radius="md" className={styles.tile}>
          <Thumb variant="large" />
        </Card>
        <div className={styles.grid2}>
          <Card radius="row" className={styles.tile}>
            <span className={styles.tileLabel}>즐겨찾기 단어</span>
            <span className={styles.tileValue}>2개</span>
          </Card>
          <Card radius="row" className={styles.tile}>
            <span className={styles.tileLabel}>즐겨찾기 영상</span>
            <span className={styles.tileValue}>1개</span>
          </Card>
        </div>
        <InnerCard className={styles.tile}>
          <span className={styles.tileLabel}>InnerCard (예문 카드 자리)</span>
        </InnerCard>
      </Section>

      <Section title="EmptyState">
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
      </Section>

      <Section title="BottomSheet / Toast">
        <div className={styles.stack}>
          <Button variant="secondary" height={66} onClick={() => setSheetOpen(true)}>
            시트 열기
          </Button>
          <Button
            variant="secondary"
            height={66}
            onClick={() => toast.show('이 날은 학습 기록이 없어요')}
          >
            토스트 띄우기
          </Button>
        </div>
      </Section>

      {sheetOpen && (
        <BottomSheet
          title="8월 20일 (오늘)"
          counter={`${dot + 1} / 3`}
          onClose={() => setSheetOpen(false)}
        >
          <Card radius="md" className={styles.sheetBody}>
            <span className={styles.sheetWord}>grocery</span>
          </Card>
          <SheetDots count={3} index={dot} onPick={setDot} />
          <Button height={72} onClick={() => toast.show('🔊 grocery 발음 재생 중')}>
            발음 듣기
          </Button>
        </BottomSheet>
      )}
    </div>
  );
}

function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{title}</h2>
      {note && <p className={styles.note}>{note}</p>}
      {children}
    </section>
  );
}
