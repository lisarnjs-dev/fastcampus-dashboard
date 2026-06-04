# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

# userEmail
The user's email address is kwonenseo@gmail.com.

# currentDate
Today's date is 2026-06-04.

---

# Design Token System

## 핵심 규칙

**원시값(primitive)을 코드에 직접 쓰지 말 것.**
`violet-600`, `gray-500`, `#7C3AED`, `slate-50` 같은 원시값 대신,
아래에 정의된 **Semantic Token** 이름만 사용한다.

❌ 나쁜 예: `bg-violet-600`, `text-gray-900`, `border-gray-200`
✅ 좋은 예: `bg-brand`, `text-txt-primary`, `border-bdr`

---

## 3단계 토큰 계층

```
Tier 1 (Primitive)  →  p-violet-600: #7C3AED
Tier 2 (Semantic)   →  t-brand: var(--p-violet-600)
Tier 3 (Component)  →  button-bg: var(--t-brand)   ← Tailwind 유틸리티
```

Tier 1은 `globals.css`에서만 정의. 코드에서 직접 참조 금지.
Tier 2 Semantic 토큰이 Tailwind 유틸리티로 생성된다.

---

## Semantic Color Tokens

### Brand (Primary)

| Tailwind 클래스      | 용도                      | 값           |
|---------------------|--------------------------|--------------|
| `bg-brand`          | 주요 버튼 배경, 강조 요소   | #7C3AED      |
| `hover:bg-brand-hover` | 버튼 hover 상태        | #6D28D9      |
| `bg-brand-subtle`   | 선택 hover 배경           | #F5F3FF      |
| `bg-brand-muted`    | 배지, 칩 배경              | #EDE9FE      |
| `text-brand`        | 링크, 강조 텍스트          | #7C3AED      |
| `border-brand`      | 포커스 링, 활성 테두리     | #7C3AED      |
| `text-brand-fg`     | brand 배경 위 텍스트       | #FFFFFF      |

### Page & Surface

| Tailwind 클래스   | 용도              | 값       |
|------------------|------------------|----------|
| `bg-page`        | 전체 페이지 배경   | #F8FAFC  |
| `bg-surface`     | 카드, 모달 배경    | #FFFFFF  |

> shadcn의 `bg-background` = `bg-page`, `bg-card` = `bg-surface`와 동일.

### Text

| Tailwind 클래스         | 용도                | 값       |
|------------------------|---------------------|----------|
| `text-txt-primary`     | 제목, 본문           | #0F172A  |
| `text-txt-secondary`   | 보조 텍스트          | #334155  |
| `text-txt-muted`       | 설명, 레이블         | #64748B  |
| `text-txt-placeholder` | 입력 placeholder    | #94A3B8  |

> shadcn의 `text-foreground` = `text-txt-primary`, `text-muted-foreground` = `text-txt-muted`.

### Border

| Tailwind 클래스   | 용도              | 값       |
|------------------|------------------|----------|
| `border-bdr`     | 기본 테두리        | #E2E8F0  |
| `border-bdr-focus` | 포커스 테두리    | #7C3AED  |

### Success (출석 완료, 정상 상태)

| Tailwind 클래스        | 용도            | 값       |
|-----------------------|-----------------|----------|
| `bg-success`          | 성공 아이콘/배지 | #10B981  |
| `bg-success-subtle`   | 성공 셀 배경    | #ECFDF5  |
| `border-success-border` | 성공 셀 테두리 | #A7F3D0  |
| `text-success-fg`     | 성공 텍스트     | #047857  |

### Error (오류, 마감)

| Tailwind 클래스        | 용도            | 값       |
|-----------------------|-----------------|----------|
| `text-error`          | 에러 메시지      | #EF4444  |
| `bg-error-subtle`     | 에러 박스 배경   | #FEF2F2  |
| `border-error-border` | 에러 박스 테두리  | #FEE2E2  |

### Warning

| Tailwind 클래스        | 용도            | 값       |
|-----------------------|-----------------|----------|
| `text-warning`        | 경고 텍스트      | #F59E0B  |
| `bg-warning-subtle`   | 경고 배경        | #FFFBEB  |
| `text-warning-fg`     | 경고 어두운 텍스트| #B45309  |

---

## Typography Tokens

폰트 패밀리는 CSS 변수로 제공:
- `font-family: var(--font-inter)` → 기본 UI 폰트
- `font-family: var(--font-display)` (= Shadows Into Light) → 브랜드 헤드라인

### 크기 스케일 (Tailwind 클래스 사용)

| 레이블    | Tailwind     | px  | 용도             |
|----------|-------------|-----|------------------|
| caption  | `text-xs`   | 12  | 날짜, 메타정보    |
| body     | `text-sm`   | 14  | 기본 본문         |
| body-lg  | `text-base` | 16  | 강조 본문         |
| subtitle | `text-lg`   | 18  | 소제목            |
| h3       | `text-xl`   | 20  | 카드 제목         |
| h2       | `text-2xl`  | 24  | 섹션 제목         |
| h1       | `text-3xl`  | 30  | 페이지 제목       |

### Font Weight

| 레이블   | Tailwind        | 값  |
|---------|----------------|-----|
| normal  | `font-normal`  | 400 |
| medium  | `font-medium`  | 500 |
| semibold| `font-semibold`| 600 |
| bold    | `font-bold`    | 700 |

---

## Spacing Scale (4px 베이스 그리드)

Tailwind의 기본 spacing 클래스를 그대로 사용:

| px  | Tailwind  | 용도 예시            |
|-----|----------|---------------------|
| 4   | `p-1`    | 아이콘 내부 패딩     |
| 8   | `p-2`    | 인라인 요소 간격     |
| 12  | `p-3`    | 작은 버튼 패딩       |
| 16  | `p-4`    | 카드 내부 패딩       |
| 20  | `p-5`    | 페이지 수평 패딩     |
| 24  | `p-6`    | 카드 큰 패딩         |
| 32  | `p-8`    | 섹션 간 간격         |
| 48  | `p-12`   | 페이지 수직 여백     |
| 64  | `p-16`   | 페이지 최상단 여백   |

---

## Border Radius Tokens

| 레이블 | Tailwind         | px  | 용도              |
|-------|-----------------|-----|-------------------|
| sm    | `rounded-sm`    | 3   | 배지, 작은 칩      |
| md    | `rounded-md`    | 6   | 입력 필드          |
| lg    | `rounded-lg`    | 8   | 버튼               |
| xl    | `rounded-xl`    | 12  | 카드, 탭 버튼      |
| 2xl   | `rounded-2xl`   | 16  | 모달, 큰 카드      |
| full  | `rounded-full`  | 999 | 아바타, pill 배지  |

> `--radius: 0.5rem(8px)`이 베이스. shadcn의 `rounded-lg` = 8px.

---

## Shadow Tokens

| Tailwind      | 용도                    |
|--------------|------------------------|
| `shadow-sm`  | 카드 기본 그림자         |
| `shadow-md`  | 드롭다운, 팝오버         |
| `shadow-lg`  | 모달                    |

---

## Tier 3: Component Recipes (컴포넌트 패턴)

자주 쓰는 조합을 레시피로 정의. 이것을 기준으로 컴포넌트를 작성할 것.

### 카드 (Card)
```
bg-surface border border-bdr rounded-2xl shadow-sm
```

### 기본 버튼 (Primary Button)
```
bg-brand text-brand-fg rounded-xl px-4 py-2.5 text-sm font-medium
hover:bg-brand-hover transition-colors
disabled:opacity-50 disabled:cursor-not-allowed
```

### 외곽선 버튼 (Outline Button)
```
bg-surface text-txt-primary border border-bdr rounded-xl px-4 py-2.5 text-sm font-medium
hover:border-brand hover:text-brand transition-all
```

### 선택 버튼 (Selection Card)
```
bg-surface border-2 border-bdr rounded-xl
hover:border-brand hover:bg-brand-subtle transition-all
```

### 입력 필드 (Input)
```
bg-surface border border-bdr rounded-lg px-3.5 py-2.5 text-sm text-txt-primary
placeholder:text-txt-placeholder
focus:outline-none focus:border-bdr-focus focus:ring-2 focus:ring-brand-subtle
transition-all
```

### 에러 메시지 박스
```
text-error bg-error-subtle border border-error-border rounded-lg px-3 py-2 text-sm
```

### 출석 완료 셀
```
bg-success-subtle border border-success-border rounded-lg
```

### Week 배지 (Mission)
```
bg-brand-muted text-brand text-xs font-medium px-2 py-0.5 rounded-md
```

---

## 이전 코드 → 토큰 마이그레이션 가이드

| 이전 (사용 금지)                              | 신규 (사용)                               |
|---------------------------------------------|------------------------------------------|
| `bg-violet-600`                             | `bg-brand`                               |
| `bg-violet-700` / `hover:bg-violet-700`     | `hover:bg-brand-hover`                   |
| `bg-violet-50`                              | `bg-brand-subtle`                        |
| `text-violet-600`                           | `text-brand`                             |
| `border-violet-400` / `border-violet-500`   | `border-brand`                           |
| `bg-slate-50` / `bg-neutral-50`             | `bg-page`                                |
| `bg-white`                                  | `bg-surface`                             |
| `text-gray-900` / `text-neutral-900`        | `text-txt-primary`                       |
| `text-gray-700` / `text-neutral-700`        | `text-txt-secondary`                     |
| `text-gray-500` / `text-neutral-500`        | `text-txt-muted`                         |
| `text-gray-400` / `text-neutral-400`        | `text-txt-placeholder`                   |
| `border-gray-200` / `border-neutral-200`    | `border-bdr`                             |
| `bg-emerald-50`                             | `bg-success-subtle`                      |
| `bg-emerald-500` / `bg-green-500`           | `bg-success`                             |
| `border-emerald-200`                        | `border-success-border`                  |
| `text-emerald-700` / `text-green-700`       | `text-success-fg`                        |
| `bg-red-50`                                 | `bg-error-subtle`                        |
| `text-red-500` / `text-red-600`             | `text-error`                             |
| `border-red-100`                            | `border-error-border`                    |
