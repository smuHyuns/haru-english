import { useNavigate, useSearchParams } from 'react-router-dom';

import Button from '@/components/Button';
import IconButton from '@/components/IconButton';
import { Card } from '@/components/Surface';
import { ChevronLeft, ChevronRight } from '@/components/icons';
import { WEEK_DAYS } from '@/lib/constants';
import {
  compareMonth,
  formatMonthLabel,
  isSameMonth,
  kstToday,
  monthGrid,
  parseDate,
  shiftMonth,
  toDateStr,
  toMonthStr,
} from '@/lib/date';
import { cx } from '@/lib/cx';
import { useAttendance, useFavorites, useProfile, useStreak } from '@/hooks/useData';
import { useToast } from '@/hooks/useToast';
import { useSession } from '@/store/session';

import DayWordsSheet from './DayWordsSheet';
import styles from './My.module.css';

export default function My() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const toast = useToast();
  const mode = useSession((s) => s.mode);
  const username = useSession((s) => s.username);
  const signOut = useSession((s) => s.signOut);

  const today = parseDate(kstToday());
  const cursor = parseMonthParam(params.get('ym')) ?? { year: today.year, month: today.month };

  const { data: profile } = useProfile();
  const { data: attendance } = useAttendance(cursor.year, cursor.month);
  const { data: favorites } = useFavorites();
  const { data: streak = 0 } = useStreak();

  const joined = profile ? parseDate(profile.joinedAt) : { year: today.year, month: today.month };
  const atLowerBound = compareMonth(cursor, joined) <= 0;
  const atUpperBound = compareMonth(cursor, today) >= 0;

  const goMonth = (delta: number) => {
    if (delta < 0 && atLowerBound) return; // 한계에서는 no-op (프로토타입 동일)
    if (delta > 0 && atUpperBound) return;
    const next = shiftMonth(cursor.year, cursor.month, delta);
    setParams({ ym: toMonthStr(next.year, next.month) }, { replace: true });
  };

  // 시트를 URL 로 표현한다 — 새로고침해도 복원되고 뒤로가기로 닫힌다
  const openDay = (day: number) => {
    setParams({
      ym: toMonthStr(cursor.year, cursor.month),
      day: toDateStr(cursor.year, cursor.month, day),
      w: '0',
    });
  };

  const attendedDays = attendance?.days ?? [];
  const isCurrentMonth = isSameMonth(cursor, today);

  // 시트는 URL 의 day 파라미터로 열린다 (?ym=2026-08&day=2026-08-12&w=0)
  const sheetDate = validDate(params.get('day'));

  return (
    <div className={styles.page}>
      <section className={styles.streak}>
        <span className={styles.streakLabel}>연속 학습</span>
        <span className={styles.streakValue}>{streak}일째</span>
        <span className={styles.streakNote}>오늘도 단어를 확인했어요. 잘하고 계세요!</span>
      </section>

      <div className={styles.stats}>
        <Card radius="row" className={styles.statCard}>
          <span className={styles.statLabel}>즐겨찾기 단어</span>
          <span className={styles.statValue}>{favorites?.words.length ?? 0}개</span>
        </Card>
        <Card radius="row" className={styles.statCard}>
          <span className={styles.statLabel}>즐겨찾기 영상</span>
          <span className={styles.statValue}>{favorites?.videos.length ?? 0}개</span>
        </Card>
      </div>

      <Card className={styles.calendar}>
        <div className={styles.calHeader}>
          <IconButton
            label="이전 달"
            tone="plainWhite"
            size={52}
            dimmed={atLowerBound}
            onClick={() => goMonth(-1)}
          >
            <ChevronLeft size={20} />
          </IconButton>

          <div className={styles.calHeaderCenter}>
            <span className={styles.monthLabel}>{formatMonthLabel(cursor.year, cursor.month)}</span>
            <span className={styles.monthSummary}>{attendedDays.length}일 출석</span>
          </div>

          <IconButton
            label="다음 달"
            tone="plainWhite"
            size={52}
            dimmed={atUpperBound}
            onClick={() => goMonth(1)}
          >
            <ChevronRight size={20} />
          </IconButton>
        </div>

        <div className={styles.grid} role="grid" aria-label="출석 캘린더">
          {WEEK_DAYS.map((d) => (
            <span key={d} className={styles.weekday}>
              {d}
            </span>
          ))}

          {monthGrid(cursor.year, cursor.month).map((day, i) =>
            day === null ? (
              <span key={`pad-${i}`} className={styles.cellEmpty} />
            ) : (
              <DayCell
                key={day}
                day={day}
                attended={attendedDays.includes(day)}
                isToday={isCurrentMonth && day === today.day}
                onOpen={() => openDay(day)}
                onEmpty={() => toast.show('이 날은 학습 기록이 없어요')}
              />
            ),
          )}
        </div>

        <span className={styles.caption}>날짜를 누르면 그날 배운 단어를 볼 수 있어요.</span>
      </Card>

      {sheetDate && (
        <DayWordsSheet
          date={sheetDate}
          index={Number(params.get('w') ?? 0) || 0}
          onIndexChange={(i) =>
            setParams(
              { ym: toMonthStr(cursor.year, cursor.month), day: sheetDate, w: String(i) },
              { replace: true },
            )
          }
          onClose={() =>
            setParams({ ym: toMonthStr(cursor.year, cursor.month) }, { replace: true })
          }
        />
      )}

      <div className={styles.settings}>
        <Button variant="list" height={68} onClick={() => navigate('/saved')}>
          즐겨찾기 모아보기
        </Button>
        <Button variant="list" height={68} onClick={() => toast.show('준비 중인 기능이에요')}>
          알림 시간 설정
        </Button>
        <Button variant="list" height={68} onClick={() => toast.show('준비 중인 기능이에요')}>
          글자 크게 보기
        </Button>

        {/*
          게스트는 기기를 바꾸거나 앱을 지우면 기록이 사라진다. 그 사실을 알리고
          가입으로 잇는다 — 가입해도 지금 계정을 승격시키는 방식이라 기록이 그대로 따라온다.
        */}
        {mode === 'guest' ? (
          <Button variant="list" height={68} onClick={() => navigate('/login?mode=signup')}>
            회원가입하고 기록 저장하기
          </Button>
        ) : (
          <Button variant="list" height={68} onClick={() => void signOut()}>
            로그아웃{username ? ` (${username})` : ''}
          </Button>
        )}
      </div>
    </div>
  );
}

function DayCell({
  day,
  attended,
  isToday,
  onOpen,
  onEmpty,
}: {
  day: number;
  attended: boolean;
  isToday: boolean;
  onOpen: () => void;
  onEmpty: () => void;
}) {
  return (
    <button
      type="button"
      // 7열 그리드라 44px 이 한계 — 비파괴 동작이라 52px 규칙 예외로 둔다
      data-touch-exempt
      aria-label={`${day}일${attended ? ' 출석' : ''}`}
      aria-current={isToday ? 'date' : undefined}
      className={cx(
        styles.cell,
        attended && styles.cellAttended,
        isToday && styles.cellToday,
      )}
      onClick={attended ? onOpen : onEmpty}
    >
      {day}
    </button>
  );
}

/** "2026-08" → { year, month }. 형식이 어긋나면 null */
function parseMonthParam(v: string | null): { year: number; month: number } | null {
  if (!v || !/^\d{4}-\d{2}$/.test(v)) return null;
  const [y, m] = v.split('-');
  const year = Number(y);
  const month = Number(m);
  if (month < 1 || month > 12) return null;
  return { year, month };
}

/** "2026-08-12" 형식만 통과시킨다 — 주소창에 아무거나 넣어도 시트가 깨지지 않게 */
function validDate(v: string | null): string | null {
  return v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}
