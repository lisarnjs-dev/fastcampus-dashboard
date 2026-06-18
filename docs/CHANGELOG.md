# 변경 이력 (CHANGELOG)

프로젝트의 모든 기능 추가·개선·버그 수정을 이 문서 하나에 기록합니다.

- 형식: 날짜별 섹션 아래 **기능 추가 / 개선 / 버그 수정** 분류
- 새 작업이 완료될 때마다 맨 위에 항목을 추가합니다 (최신순)

---

## 2026-06-17

### 기능 추가
- **출석 현황 날짜 네비게이션** (`/admin/attendance`): 기수 전체 기간(시작일~종료일) 내 임의 날짜의 출석 현황을 조회할 수 있는 날짜 스트립 추가
  - `?date=YYYY-MM-DD` URL 파라미터 기반 — 서버 컴포넌트 아키텍처 유지, API 수정 없음
  - 날짜 버튼 클릭 시 해당 날짜 출석 데이터 로드, 오늘 날짜 기본 선택 및 스크롤 자동 이동
  - 주(week) 경계 시각적 구분, 오늘 날짜 표시 점, 선택 날짜 하이라이트
  - `generateDateRange()` 유틸 추가 (`src/lib/date.ts`), `AttendanceDateNav` 컴포넌트 신규 (`src/components/admin/AttendanceDateNav.tsx`)
  - E2E 테스트 추가 (`e2e/admin-attendance-date-nav.spec.ts`)

### 개선
- **Google Forms 웹훅 localhost 경고 배너 추가** (`GoogleFormsWebhookSetup.tsx`): `NEXT_PUBLIC_SITE_URL`이 비어 있거나 `localhost`/`127.0.0.1`을 포함할 때 Apps Script 코드 박스 위에 빨간 경고 배너 표시
  - 근본 원인: 로컬 개발 환경에서 코드를 복사하면 `localhost` URL이 Apps Script에 삽입되어 Google 서버에서 DNS 에러 발생 → 미션 제출이 대시보드에 자동 반영되지 않는 문제
  - 해결: 경고 배너에서 Vercel 배포 후 `NEXT_PUBLIC_SITE_URL` 설정 및 코드 재복사를 안내
  - 코드 리뷰 반영: `siteUrl`에 `.trim()` 추가(공백 포함 값 우회 방지), 경고 배너에 `role="alert"` 추가(접근성)
- **Apps Script 코드 섹션 토글 형태로 변경** (`GoogleFormsWebhookSetup.tsx`): 기본 접힘 상태로 표시, "펼치기/접기" 버튼으로 코드 표시 전환 — 어드민 페이지 가독성 개선

### 기능 추가
- **마감된 미션 제출 버튼 비활성화**: `isPast` 조건으로 마감 미션에 disabled 버튼(마감됨 / 미션 제출하기 (마감)) 표시
  - 적용 위치: 미션 카드 (`MissionCard`), 미션 상세 (`MissionDetailContent`)
- **비로그인 접근 차단 모달 (`LoginRequiredGate`)**: 세션 쿠키 없이 `/dashboard/[group]`에 접근하면 즉시 로그인 안내 모달 표시
  - 모달은 닫기 불가 (배경 클릭·ESC 무효) — 반드시 로그인 버튼을 통해 `/login`으로 이동
  - 서버 컴포넌트에서 `getSession()`으로 판별 후 클라이언트 오버레이 컴포넌트에 전달
  - `data-testid="login-required-modal"`, `data-testid="login-required-cta"` 추가

### 테스트
- 비로그인 게이트 E2E 테스트 추가 (`e2e/login-required-gate.spec.ts`)
  - 비로그인 접근 시 모달 표시, 배경 클릭 무효, 로그인 버튼 이동, 로그인 후 모달 미표시 시나리오 포함

---

## 2026-06-11

### 기능 추가
- **기수 시작 전 출석·미션 제출 차단**: 기수 시작일이 도래하기 전에는 출석 인증 버튼·미션 제출 버튼 클릭 시 "아직 기수가 시작되지 않았습니다" 안내 모달 표시 (`CohortStartGate` 컴포넌트)
  - 적용 위치: 대시보드 출석 인증 버튼, 미션 목록 제출하기 버튼, 미션 상세(모달/페이지) 미션 제출하기 버튼
  - `/checkin` 페이지 직접 접근 시에도 시작일 안내 화면 표시
  - 출석 API(`POST /api/attendance`)에 서버 측 가드 추가 (시작 전 403 응답) — UI 우회 방지
  - 날짜 판정 유틸 `hasCohortStarted()` 추가 (단위 테스트 6건 포함, 당일 개강은 허용)

### 버그 수정
- **Google Forms 웹훅이 폼 응답을 감지하지 못하는 문제 수정**: Apps Script 연동 코드를 v2로 재작성
  - 원인 1 — 폼 질문 제목이 `수강생 성함`, `제출 주차 선택`과 정확히 일치하지 않으면 조용히 스킵됨 → 질문 제목에 "성함/이름", "주차" 키워드만 포함되면 인식하도록 퍼지 매칭 적용
  - 원인 2 — 트리거 수동 설정 시 이벤트 소스/함수 선택 실수가 잦음 → `setupTrigger()` 함수를 한 번 실행하면 트리거가 자동 설치되도록 변경
  - 원인 3 — 트리거 설치 전에 시트에 이미 쌓인 응답은 반영할 방법이 없었음 → `syncAllResponses()` 함수로 기존 응답 일괄 동기화 지원
  - 어드민 화면의 설정 안내·문제 해결 가이드 갱신 (실행 로그 확인 방법, localhost 주소 주의 등)
- `npm test`(vitest)가 Playwright e2e 스펙까지 실행해 실패하던 문제 수정 (`vitest.config.ts` 추가)
- 대시보드 뒤로가기 버튼의 `<a>` 태그를 `<Link>`로 교체 (Next.js lint 에러 해결)

### 문서
- 변경 이력 문서(`docs/CHANGELOG.md`) 신설 — 이후 모든 업데이트를 이 문서에 기록
- `AGENTS.md`에 변경 이력 기록 규칙 추가

### 테스트
- `hasCohortStarted` 단위 테스트 6건 추가 (`src/lib/date.test.ts`)
- 기수 시작 게이트 E2E 테스트 추가 (`e2e/cohort-start-gate.spec.ts`)

---

## 2026-06-07

### 기능 추가
- 어드민 기수 생성 시 **기수 시작일/종료일 선택** 가능 (`planned_end_at` 컬럼 추가, 마이그레이션 003)
- 수강생 **누적 출석 기록** 표시 — 기수 진행 기간 동안 일자별 출석/미결석 여부를 누적 확인 (`MyAttendanceHistory`, `GET /api/attendance/history`)
- 기수 생성 폼에 **"3주 자동설정" 버튼** 추가 — 시작일 선택 시 3주 뒤 날짜가 종료일로 자동 입력 (`addWeeks` 유틸 + 단위 테스트)

---

## 2026-06-04

### 기능 추가
- 미션 카드 클릭 시 **Parallel Route 모달**로 상세 정보(제출 현황, 제출/미제출 명단) 표시
- 수강생 대시보드 미션 탭에 미션 카드 표시
- 기수별 로그인 검증, 미션 탭 분리, **Google Forms 웹훅 자동 연동** 최초 도입

### 버그 수정
- CSV 임포트 중복 제출 에러 수정 및 주차 자동 매칭 추가

---

## 2026-06-01

### 기능 추가
- 홈 기수/그룹 선택 플로우, 뒤로가기 버튼, 대시보드 미션 표시, CSV 다운로드
- 어드민/학생 인증 및 대시보드 초기 구현

---

## 2026-05-28

- 프로젝트 초기 생성 (Create Next App)
