# Handoff: 하루영어 (Daily English PWA)

## Overview
모바일 전용(PWA 예정) 일상 영어 학습 앱. 매일 추천 단어를 확인하고 발음을 듣고, 외부 소스에서 가져온 유튜브 영상을 카테고리로 탐색하며, 단어/영상을 즐겨찾기하고, 마이페이지에서 연속 학습(스트릭)과 출석 캘린더를 본다. 캘린더 날짜를 누르면 그날 배운 단어(하루 3개)를 다시 볼 수 있다.

사용자는 성인/어르신을 포함하므로 **큰 터치 타깃(≥52px, 주요 버튼 66~76px)과 단순한 이동 구조(하단 4탭)** 가 핵심 제약이다.

## About the Design Files
이 번들의 `일상영어.dc.html` 은 **HTML로 만든 디자인 레퍼런스(프로토타입)** 다. 의도한 화면 구성·스타일·인터랙션을 보여주기 위한 것이며, 그대로 프로덕션에 붙일 코드가 아니다.

할 일은 이 HTML 디자인을 **대상 코드베이스의 기존 환경(React / Next.js / Vue / RN 등)과 패턴·라이브러리로 재현**하는 것이다. 아직 코드베이스가 없다면 프로젝트에 가장 적합한 프레임워크를 골라 구현한다(PWA 요구를 감안하면 Next.js 또는 Vite + React + `vite-plugin-pwa` 권장).

프로토타입 파일은 특수한 미리보기 런타임(`support.js`, `<x-dc>`, `<sc-if>`, `<sc-for>`, `{{ }}` 홀)을 쓴다. 이 문법은 **이식하지 말 것** — 조건부 렌더링/반복은 대상 프레임워크의 관용구로 바꾼다. 값은 모두 `renderVals()`에서 계산되어 템플릿으로 넘어가는 구조이므로, React라면 컴포넌트 내부 파생 값으로 옮기면 1:1 대응된다.

## Fidelity
**High-fidelity.** 색상·타이포·간격·라운드·인터랙션이 확정 상태다. 픽셀 단위로 재현하되, 대상 코드베이스에 디자인 시스템이 있다면 아래 토큰을 그 시스템의 동등 토큰으로 매핑한다. 영상 썸네일만 플레이스홀더(대각선 스트라이프)이며 실제 유튜브 썸네일로 교체 필요.

## Design Tokens

### Colors
| 역할 | 값 |
|---|---|
| Accent (primary) | `#3182F6` (기본). 대안: `#00B2B2`, `#7048E8`, `#F76707` |
| Accent soft (선택 배경/출석일) | `#EAF2FF` |
| Text primary | `#191F28` |
| Text secondary | `#4E5968` |
| Text tertiary | `#6B7684` |
| Text muted | `#8B95A1` |
| Text disabled / 비활성 날짜 | `#B0B8C1` |
| Icon inactive (☆) | `#C3CAD2` |
| Arrow disabled | `#DBE0E5` |
| Surface (앱 배경) | `#FFFFFF` |
| Surface raised (카드) | `#F9FAFB` |
| Fill (보조 버튼/입력) | `#F2F4F6` |
| Fill pressed | `#E8EBEE` |
| Fill pressed (흰 버튼) | `#EEF1F4` |
| Divider / tabbar top line | `#F2F4F6` |
| Toast bg | `#191F28`, text `#FFFFFF` |
| Sheet scrim | `rgba(25,31,40,0.42)` |
| Focus ring (input) | bg `#EDF4FF` + `inset 0 0 0 2px #3182F6` |
| Thumbnail placeholder | `repeating-linear-gradient(135deg, #EEF1F4 0 10px, #E6EAEE 10px 20px)` (리스트는 8px/16px) |
| Dot inactive | `#E1E5EA` |
| 문서 바깥 배경(html/body) | `#E9ECEF` |

### Typography
- Font family: **Noto Sans KR** (400/500/700/900), fallback `system-ui, sans-serif`
- 전역 `letter-spacing: -0.02em`; 큰 숫자·영단어는 `-0.03em ~ -0.035em`, 로고/워드마크 `-0.04em ~ -0.06em`
- Scale (px / weight):
  - 46/900 — 오늘의 단어 영어 (line-height 1.1)
  - 42/900 — 스트릭 숫자
  - 34/900 — 시트 단어
  - 30/900 — 스플래시 워드마크, 로그인 헤드라인 (line-height 1.25)
  - 26/700 — 화면 타이틀 / 통계 숫자(900)
  - 25/700 — 단어 뜻(홈)
  - 23/700 — 주요 CTA(로그인·저장)
  - 22/700 — 발음 듣기 버튼
  - 21/700 — 시트 날짜, 시트 단어 뜻
  - 20/700 — 섹션 헤더, 리스트 항목 버튼
  - 19/700 — 보조 버튼, 캘린더 월 라벨
  - 18/500~700 — 예문 영어, 영상 제목(700), 입력값(500)
  - 17/500 — 발음기호, 즐겨찾기 뜻, 로그인 설명
  - 16/400~500 — 예문 한국어, 캡션
  - 15/500 — 헤더 날짜칩, 영상 meta, 통계 라벨
  - 14/500~700 — 카운터, 안내문
  - 13/700 — 카테고리 라벨(accent), 요일 헤더
  - 12/mono — 썸네일 플레이스홀더 문구
- **최소 글자 크기 13px** (본문은 16px 이상 유지)

### Radius
- 30px 스플래시 로고 타일 / 26px 시트 상단(`26px 26px 0 0`) / 24px 큰 카드 / 22px 로그인 로고 / 20px 썸네일 카드·빈 상태 / 18px 버튼·리스트 카드 / 16px 입력·아이콘 버튼·내부 카드 / 14px 시트 내부 카드·작은 버튼 / 12px 리스트 썸네일·캘린더 셀 / 999px 칩·날짜칩·점

### Spacing
4 / 6 / 8 / 10 / 12 / 14 / 16 / 18 / 20 / 22 / 24 / 26 / 28 / 32 px. 화면 좌우 패딩 20px(로그인 24px), 섹션 간 22~28px, 리스트 항목 간 10px.

### Elevation
그림자 거의 사용 안 함. 탭바 상단만 `box-shadow: 0 -1px 0 #F2F4F6`.

### Motion
- `riseIn` 0.22~0.24s ease-out — `opacity 0→1`, `translateY(14px→0)` (토스트, 바텀시트)
- `logoIn` 0.45s ease-out — `opacity 0→1`, `scale(0.88→1)` (스플래시 로고)
- Press feedback: 채움 버튼 `opacity: 0.82` / `0.7`(아이콘), 회색 버튼 `background: #E8EBEE`, 흰 버튼 `#EEF1F4`
- 스플래시 자동 전환 1600ms, 토스트 자동 소멸 1800ms

## Layout Shell
```
Root  width:100%  height:100dvh  display:flex  column  overflow:hidden  position:relative
├─ Header   flex:0 0 auto  padding:22px 20px 12px  row  space-between  align-center  gap:12
│    ├─ 화면 타이틀 26/700
│    └─ 날짜 칩 15/500 #8B95A1, bg #F2F4F6, padding 9px 14px, radius 999
├─ Content  flex:1 1 auto  min-height:0  overflow-y:auto  padding:8px 20px 28px  column
├─ TabBar   flex:0 0 auto  grid 4×1fr  gap:4  padding:8px 10px 18px  bg #FFF  shadow 0 -1px 0 #F2F4F6
│    └─ 탭 버튼 height 60, radius 16, 17/700; 활성 bg #EAF2FF + accent, 비활성 bg #FFF + #B0B8C1
├─ BottomSheet (overlay, z-index 18)
└─ Toast (absolute, top:84px, left/right:20px, z-index 40)
```
- 기준 뷰포트 **390 × 844** (iPhone 14 규격). 스크롤바 숨김(`::-webkit-scrollbar{width:0}`).
- PWA: `viewport-fit=cover` + `env(safe-area-inset-bottom)` 를 탭바 하단 패딩에 더할 것(프로토타입은 고정 18px).

## Screens / Views

### 1. Splash (`stage: "splash"`)
- **목적**: 브랜드 노출, 로그인 진입 전 1.6초 대기. 화면 탭 시 즉시 스킵.
- **레이아웃**: `position:absolute; inset:0; z-index:20`, 배경 = accent 전면, column, center, `gap:22`
- **구성**
  - 로고 타일: 104×104, radius 30, bg `#FFF`, 내부 `EN` 46/900, color accent, `letter-spacing:-0.06em`, `animation: logoIn .45s ease-out`
  - 워드마크 `하루영어` 30/900 `#FFF`
  - 태그라인 `매일 한 단어, 매일 한 영상` 16/500 `rgba(255,255,255,0.8)`
- **동작**: 마운트 시 1600ms 타이머 → `login`. 클릭 시 타이머 취소 후 즉시 `login`.

### 2. Login (`stage: "login"`)
- **레이아웃**: `absolute inset:0; z-index:19`, bg `#FFF`, column, `padding: 56px 24px 32px`
  - 상단 블록(flex:0 0 auto, gap 16): 로고 68×68 radius 22 bg accent + `EN` 28/900 흰색 → 헤드라인 `하루영어에<br>오신 것을 환영해요` 30/900 line-height 1.25 → 설명 `로그인하면 즐겨찾기와 출석이<br>계속 저장돼요.` 17/400 `#8B95A1` line-height 1.5
  - 중앙(flex:1, center, gap 12, padding 32px 0): 입력 2개 — height 68, radius 16, bg `#F2F4F6`, padding 0 18px, 18/500, `border:none`, `outline:none`; focus 시 bg `#EDF4FF` + inset ring 2px accent
    - `아이디 또는 휴대폰 번호` (text), `비밀번호` (password)
  - 하단(flex:0 0 auto, gap 10): `로그인` 76px accent CTA 23/700 → `로그인 없이 둘러보기` 68px `#F2F4F6` / `#4E5968` 19/700 → `처음이신가요? 회원가입` 16/400 center, 링크는 accent
- **동작**: 두 버튼 모두 `stage: "app"`, `tab: "home"`. 회원가입은 토스트(`준비 중인 기능이에요`). **검증 없음 — 실제 구현 시 인증 연동 필요.**

### 3. 오늘 (Home, `tab: "home"`)
헤더 타이틀 `오늘의 영어`, 날짜 칩 `8월 20일 목요일`.

**a) 오늘의 단어 카드** — bg `#F9FAFB`, radius 24, `padding: 28px 24px 26px`, column gap 20
- 상단 행(space-between): 왼쪽 `오늘의 단어` 15/700 accent + 카운터 `1 / 12` 14/500 `#B0B8C1` (gap 10) / 오른쪽 즐겨찾기 토글 버튼 56×56, radius 16, `margin: -8px -6px -8px 0`, 아이콘 26px `★`(accent, bg `#FFF`) ↔ `☆`(`#C3CAD2`, bg transparent)
- 단어 블록(gap 10): 영단어 46/900 lh 1.1 → 발음기호 17/500 `#8B95A1` → 뜻 25/700 (`margin-top: 6px`)
- 예문 카드: bg `#FFF`, radius 16, padding 18, row align-center gap 12
  - 텍스트(flex:1, gap 8): 영어 18/500 lh 1.5 / 한국어 16/400 `#6B7684` lh 1.5
  - 재생 버튼 56×56 radius 16 bg `#F2F4F6`, `▶` 20px accent

**b) 액션** (column gap 12)
- `발음 듣기` — height 72, radius 18, bg accent, 22/700 흰색
- 행(gap 12): `이전 단어` / `다음 단어` — 각 flex:1, height 66, radius 18, bg `#F2F4F6`, 19/700 `#4E5968`

**c) 오늘 볼 영상** (gap 14)
- 섹션 헤더 20/700 `오늘 볼 영상`
- 카드(클릭 → 영상 탭): radius 20, bg `#F9FAFB`, overflow hidden
  - 썸네일 영역 height 156, 스트라이프 배경, 중앙 `youtube thumbnail` 12px mono `#98A2AD`
  - 본문 padding 18, gap 8: 카테고리 13/700 accent → 제목 20/700 lh 1.35 → meta 15/400 `#8B95A1`
- **단어를 넘겨도 이 영상은 고정**(`VIDEOS[0]`) — 의도된 동작.

### 4. 영상 (`tab: "videos"`)
헤더 타이틀 `영상 모음`. column gap 22.
- **카테고리 칩 행**: `flex-wrap`, gap 8. 칩 height 54, padding 0 20, radius 999, 17/700. 선택 = bg accent / `#FFF` 텍스트, 미선택 = bg `#F2F4F6` / `#6B7684`. 목록: 전체 · 일상 · 여행 · 식당 · 쇼핑 · 병원
- **영상 리스트**(gap 10): 각 항목 row align-center gap 14, bg `#F9FAFB`, radius 18, padding 14
  - 썸네일 `flex: 0 0 104px`, height 76, radius 12, 스트라이프
  - 텍스트(flex:1, min-width:0, gap 6): 카테고리 13/700 accent / 제목 18/700 lh 1.35 `text-wrap: pretty` / meta 14/400 `#8B95A1`
  - 즐겨찾기 버튼 56×56 radius 16: 켜짐 bg `#EAF2FF` accent `★`, 꺼짐 bg `#FFF` `#B0B8C1` `☆` (24px)
- **영상은 앱에서 등록하지 않는다** — DB/외부 소스(예: YouTube Data API 또는 자체 큐레이션 테이블)에서 가져오는 것을 전제로 한다. 등록 화면 없음.

### 5. 즐겨찾기 (`tab: "saved"`)
헤더 타이틀 `즐겨찾기`. column gap 22.
- **세그먼트 전환**: 컨테이너 bg `#F2F4F6`, radius 16, padding 6, row gap 6. 각 버튼 flex:1, height 56, radius 12, 18/700. 활성 bg `#FFF` `#191F28`, 비활성 transparent `#8B95A1`. 항목: `단어` / `영상`
- **단어 목록**(gap 10): 항목 row space-between, bg `#F9FAFB`, radius 18, `padding: 18px 18px 18px 20px`
  - 왼쪽(gap 5): 영단어 24/900 / 뜻 17/400 `#6B7684`
  - 오른쪽(gap 8): `듣기` 버튼 height 56, padding 0 16, radius 16, bg `#FFF`, 16/700 accent, `white-space: nowrap`, `flex: 0 0 auto` / `★` 56×56 radius 16 bg `#FFF` accent 22px (누르면 목록에서 제거)
- **영상 목록**: 영상 탭 리스트와 동일, 즐겨찾기 버튼은 bg `#FFF` + accent `★`
- **빈 상태**: bg `#F9FAFB`, radius 20, `padding: 48px 24px`, center, gap 8 — 제목 19/700 `#6B7684`(`즐겨찾기한 단어가 없어요` / `…영상이 없어요`), 설명 16/400 `#8B95A1` center lh 1.5 (`오늘의 단어에서 '즐겨찾기'를 누르면 여기에 모여요.` / `영상 목록에서 ★ 를 누르면 여기에 모여요.`)

### 6. 마이페이지 (`tab: "my"`)
헤더 타이틀 `마이페이지`. column gap 22.
- **스트릭 카드**: bg accent, radius 24, `padding: 26px 24px`, gap 6 — 라벨 `연속 학습` 16/500 `rgba(255,255,255,0.82)` / `12일째` 42/900 `#FFF` / 격려문 `오늘도 단어를 확인했어요. 잘하고 계세요!` 16/400 `rgba(255,255,255,0.82)` lh 1.5
- **통계 2열 그리드**(gap 10): 각 카드 bg `#F9FAFB`, radius 18, padding 20, gap 6 — 라벨 15/500 `#8B95A1`(`즐겨찾기 단어` / `즐겨찾기 영상`), 값 26/900
- **출석 캘린더**: bg `#F9FAFB`, radius 24, `padding: 22px 20px`, column gap 16
  - 헤더 row space-between gap 8: `‹` 52×52 radius 16 bg `#FFF` 20/700 / 중앙 column center — 월 라벨 `2026년 8월` 19/700 + 요약 `N일 출석` 14/500 `#8B95A1` / `›` 52×52
    - 이동 한계에 도달하면 화살표 색 `#DBE0E5` (하한 2026-05 = 가입월, 상한 = 현재월). 클릭은 no-op.
  - 요일 헤더 7열: `일 월 화 수 목 금 토` 13/700 `#B0B8C1` center, `padding-bottom: 4`
  - 날짜 그리드 `repeat(7, 1fr)` gap 4. 셀 = 버튼 height 44, radius 12, 15px
    - 오늘: bg accent, `#FFF`, 700
    - 출석일: bg `#EAF2FF`, accent, 700 → 클릭 시 시트 오픈
    - 미출석/미래: transparent, `#B0B8C1`, 400 → 클릭 시 토스트 `이 날은 학습 기록이 없어요`
    - 선행 빈칸은 라벨 없는 셀
  - 캡션 `날짜를 누르면 그날 배운 단어를 볼 수 있어요.` 14/400 `#B0B8C1`
- **설정 리스트**(gap 10): 각 항목 height 68, radius 18, bg `#F2F4F6`, 19/700 `#191F28`, `text-align:left`, `padding: 0 20px`
  - `즐겨찾기 모아보기` → 즐겨찾기 탭 이동
  - `알림 시간 설정` → 토스트(미구현)
  - `글자 크게 보기` → 토스트(미구현). **구현 시 실제 폰트 스케일 설정으로 대체 권장(어르신 대상).**

### 7. 지난 날 단어 시트 (BottomSheet)
- **오버레이**: `absolute inset:0; z-index:18`, scrim `rgba(25,31,40,0.42)`, column, 콘텐츠 하단 정렬. scrim(위쪽 여백) 클릭 시 닫힘.
- **패널**: bg `#FFF`, radius `26px 26px 0 0`, `padding: 22px 20px 24px`, column gap 18, `animation: riseIn .24s ease-out`
  - 헤더 row space-between: 왼쪽 gap 10 — 날짜 `8월 12일`(오늘이면 `8월 20일 (오늘)`) 21/700 + 카운터 칩 `1 / 3` 14/700 accent bg `#F2F4F6` padding 6px 10px radius 999 / 오른쪽 `✕` 48×48 radius 14 bg `#F2F4F6` 20/700
  - 단어 카드 bg `#F9FAFB` radius 20 `padding: 22px 20px` gap 16
    - row(align-start, space-between): 왼쪽 — 영단어 34/900 lh 1.15 / 발음기호 16/500 `#8B95A1` / 뜻 21/700 (`margin-top:4`) · 오른쪽 — 즐겨찾기 토글 56×56 radius 16, `★` accent bg `#FFF` ↔ `☆` `#C3CAD2` transparent (26px)
    - 예문 카드 bg `#FFF` radius 14 padding 16, row gap 12 — 텍스트(영 17/500, 한 15/400 `#6B7684`) + `▶` 56×56 radius 16 bg `#F2F4F6` accent
  - 점 인디케이터: center, gap 6. 각 점 height 8, radius 999, 활성 width 22 bg accent / 비활성 width 8 bg `#E1E5EA`. 클릭으로 해당 단어 이동
  - 버튼: 행(gap 10) `이전 단어` / `다음 단어` 각 flex:1 height 66 radius 18 bg `#F2F4F6` 19/700 → 그 아래 `발음 듣기` height 72 radius 18 accent 22/700

### 8. Toast
`position:absolute; top:84px; left:20px; right:20px; z-index:40`, bg `#191F28`, `#FFF`, radius 16, `padding: 18px 20px`, 17/500, center, `riseIn .22s`. 1800ms 후 사라짐. 새 토스트가 오면 타이머 리셋.
문구: `🔊 grocery 발음 재생 중`, `🔊 예문 재생 중`, `즐겨찾기에 담았어요`, `즐겨찾기에서 뺐어요`, `이 날은 학습 기록이 없어요`, `준비 중인 기능이에요`, `이 기기는 소리 재생을 지원하지 않아요`

## Interactions & Behavior

### 내비게이션
- 스플래시 → 로그인 → 앱. 앱 내 이동은 **하단 4탭만** (오늘 / 영상 / 즐겨찾기 / 마이). 뒤로가기 개념 없음(시트만 닫힘).
- 홈의 영상 카드 클릭 → 영상 탭. 마이의 `즐겨찾기 모아보기` → 즐겨찾기 탭.
- 실제 앱에서는 탭을 라우트(`/today`, `/videos`, `/saved`, `/my`)로 매핑하고 시트는 쿼리 파라미터(`?day=2026-08-12&w=0`) 권장 — PWA 새로고침 복원에 유리.

### 음성 재생 (별도 API 없음)
브라우저 내장 `window.speechSynthesis` 사용. 서버·API 키 불필요.
```js
function say(text, { rate = 0.8 } = {}) {
  const synth = window.speechSynthesis;
  if (!synth) return; // 미지원 → 토스트 안내
  synth.cancel();                       // 진행 중 발화 중단
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = rate;                        // 느리게 말하기 on = 0.8, off = 1
  synth.speak(u);
}
```
- 호출 지점: 홈 `발음 듣기`(단어) / 홈 예문 `▶`(문장) / 즐겨찾기 `듣기`(단어) / 시트 `발음 듣기`(단어) / 시트 예문 `▶`(문장)
- iOS 제약: 사용자 제스처 직후에만 재생 — 모든 재생이 버튼 클릭 핸들러 안에 있어야 한다.
- 음성 목록은 기기별로 다르고 `getVoices()`가 비동기이므로, 특정 음성 지정이 필요하면 `voiceschanged` 이후 `en-US` 음성을 선택.
- 향후 원어민 오디오로 바꿀 여지: `say()` 한 함수만 mp3 재생으로 교체.

### 즐겨찾기
- 단어는 `en` 문자열, 영상은 `id`로 식별. 토글 시 토스트로 담김/제거 피드백.
- 즐겨찾기 탭의 `★`를 누르면 목록에서 즉시 사라짐(빈 상태로 전환 가능).
- 마이페이지 통계 2개는 즐겨찾기 배열 길이에서 파생 — 별도 상태 아님.

### 캘린더 / 지난 날 단어
- 월 이동 범위: 가입월(`2026-05`) ~ 현재월(`2026-08`). 경계에서 화살표 비활성.
- 출석일 데이터는 프로토타입에서 하드코딩(8월) + 과거월은 의사난수 생성 — **실제로는 학습 이력 테이블에서 조회**.
- 하루 학습 단어 수 `PER_DAY = 3`. 프로토타입은 `WORDS[(day*3 + k) % WORDS.length]`로 결정론적 생성 — 실제로는 그날의 학습 기록을 조회한다.
- 시트 열 때 `sheetIndex = 0`으로 리셋. 이전/다음은 3개 안에서 순환(wrap).

### 미구현 (토스트만 표시)
회원가입, 알림 시간 설정, 글자 크게 보기, 영상 재생(카드/썸네일 클릭 시 아직 동작 없음 — 실제로는 유튜브 임베드 또는 앱 딥링크).

## State Management
프로토타입의 단일 컴포넌트 상태 (실제 구현에서는 화면별로 분리 + 서버 상태 분리 권장):

| 상태 | 타입 | 초기값 | 설명 |
|---|---|---|---|
| `stage` | `'splash' \| 'login' \| 'app'` | `'splash'` | 앱 진입 단계 |
| `loginId`, `loginPw` | string | `''` | 로그인 입력 |
| `tab` | `'home' \| 'videos' \| 'saved' \| 'my'` | `'home'` | 현재 탭 |
| `wordIndex` | number | `0` | 홈 단어 인덱스(음수 가능 → 모듈로 정규화) |
| `cat` | string | `'전체'` | 영상 카테고리 필터 |
| `savedView` | `'words' \| 'videos'` | `'words'` | 즐겨찾기 세그먼트 |
| `favWords` | string[] | `['receipt','appointment']` | 즐겨찾기 단어(en) |
| `favVideos` | string[] | `['v2']` | 즐겨찾기 영상(id) |
| `calYear`, `calMonth` | number | `2026`, `8` | 캘린더 표시 월 |
| `openDay` | number \| null | `null` | 시트 대상 날짜(1~31) |
| `sheetIndex` | number | `0` | 시트 내 단어 위치 |
| `toast` | string | `''` | 토스트 문구(빈 문자열 = 숨김) |

타이머 2개: 스플래시 전환(1600ms), 토스트 소멸(1800ms). 언마운트 시 정리 필수.

### 데이터 요구사항 (실제 구현)
- `GET /words/today` → 오늘 추천 단어 목록(`{ en, ipa, ko, exEn, exKo }`)
- `GET /words/by-date?date=YYYY-MM-DD` → 그날 단어 배열(하루 3개)
- `GET /videos?category=` → 큐레이션된 유튜브 영상(`{ id, youtubeId, cat, title, channel, durationSec, thumbnailUrl }`)
- `GET/POST/DELETE /favorites/words`, `/favorites/videos`
- `GET /attendance?year=&month=` → 출석일 배열 + 스트릭
- 앱 진입 시 오늘 출석 기록(POST) — 스트릭 계산 근거

## Content (프로토타입 사용 데이터)
**단어 12개**: grocery(식료품) · appointment(약속, 예약) · receipt(영수증) · neighbor(이웃) · refreshing(상쾌한) · refund(환불) · pharmacy(약국) · borrow(빌리다) · crowded(붐비는) · leftover(남은 음식) · on time(제시간에) · chilly(쌀쌀한) — 각 발음기호/뜻/예문(영·한) 포함. 전부 생활 회화 어휘 톤.

**영상 6개**: `v1` 일상 「아침에 쓰는 인사 표현 10가지」 8분 Everyday English / `v2` 여행 「공항에서 바로 쓰는 문장」 12분 Travel Talk / `v3` 식당 「카페에서 주문하기」 6분 Slow English / `v4` 쇼핑 「마트에서 물건 찾을 때」 9분 Daily Phrases / `v5` 일상 「날씨 이야기로 대화 시작하기」 7분 Small Talk / `v6` 병원 「병원에서 증상 말하기」 10분 Real Life English

**카테고리**: 전체 · 일상 · 여행 · 식당 · 쇼핑 · 병원
**날짜 기준**: 2026-08-20(목), 스트릭 12일, 8월 출석 18일

## Assets
외부 이미지·아이콘 없음. 아이콘은 모두 텍스트 글리프(`★ ☆ ▶ ‹ › ✕ ＋`) — **실제 구현에서는 아이콘 라이브러리로 교체 권장**(현재 글리프는 기기 폰트에 따라 정렬이 흔들림).
로고는 CSS만으로 구성: 라운드 타일 + `EN` 텍스트. PWA 아이콘(192/512, maskable)과 스플래시 이미지는 이 조합을 래스터화해 생성하면 된다.
폰트: Google Fonts Noto Sans KR (400/500/700/900) — 오프라인 지원을 위해 셀프 호스팅 권장.

## PWA 체크리스트 (아직 미구현)
- `manifest.json`: `display: standalone`, `orientation: portrait`, `theme_color: #3182F6`, `background_color: #3182F6`(스플래시와 일치), 아이콘 192/512 + maskable
- 서비스워커: 앱 셸 + 폰트 프리캐시, 단어/영상 데이터는 stale-while-revalidate
- `viewport-fit=cover` + safe-area 패딩(탭바 하단)
- iOS 홈화면 추가 시 상태바 스타일, `apple-touch-icon`
- 오프라인 시 즐겨찾기 로컬 캐시 우선 표시

## Files
- `일상영어.dc.html` — 전체 프로토타입(스플래시·로그인·4개 탭·시트·토스트). 상단 `<helmet>`에 폰트/전역 리셋/키프레임, 이후 템플릿, `<script data-dc-script>`에 로직 클래스(데이터 상수 + 상태 + 파생 값).
- `support.js` — 프리뷰 런타임. **이식 대상 아님.**

## 재현 시 주의
1. `{{ }}` / `<sc-if>` / `<sc-for>` / `renderVals()` 는 프리뷰 전용 문법 — 대상 프레임워크 관용구로 대체.
2. 프로토타입은 스타일이 전부 인라인이다. 대상 코드베이스의 스타일 방식(CSS Modules / Tailwind / styled-components)으로 옮기고, 위 토큰 표를 단일 소스로 삼는다.
3. 터치 타깃 최소 52px 규칙을 유지할 것 — 성인/어르신 사용자 전제의 핵심 제약이다.
4. 날짜·스트릭·출석은 하드코딩 상수(`CUR_Y/CUR_M/TODAY`, `ATTENDED_AUG`)다. 실제 시간 기준 로직으로 교체하고, 헤더 날짜와 캘린더가 같은 소스를 쓰게 한다.
5. 로그인은 UI만 있다. 인증·세션·즐겨찾기 동기화는 새로 설계해야 한다.
