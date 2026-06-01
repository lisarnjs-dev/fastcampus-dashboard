-- 기수 테이블
create table if not exists cohorts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  status text not null default 'active' check (status in ('active', 'archived')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- 수강생 테이블
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references cohorts(id) on delete cascade,
  name text not null,
  auth_code text not null,
  dashboard_group text not null,
  created_at timestamptz not null default now(),
  unique (cohort_id, name),
  unique (cohort_id, auth_code)
);

-- 출석 테이블 (하루 1회)
create table if not exists attendances (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  cohort_id uuid not null references cohorts(id) on delete cascade,
  date date not null,
  message text not null,
  created_at timestamptz not null default now(),
  unique (student_id, date)
);

-- 미션 테이블
create table if not exists missions (
  id uuid primary key default gen_random_uuid(),
  cohort_id uuid not null references cohorts(id) on delete cascade,
  dashboard_group text,
  week int not null,
  title text not null,
  description text not null default '',
  due_at timestamptz not null,
  google_form_url text,
  created_at timestamptz not null default now()
);

-- 미션 제출 테이블
create table if not exists mission_submissions (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references missions(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  submitted_at timestamptz not null,
  imported_at timestamptz not null default now(),
  unique (mission_id, student_id)
);

-- 인덱스
create index if not exists idx_students_cohort_group on students(cohort_id, dashboard_group);
create index if not exists idx_attendances_cohort_date on attendances(cohort_id, date);
create index if not exists idx_attendances_student_date on attendances(student_id, date);
create index if not exists idx_missions_cohort on missions(cohort_id);
create index if not exists idx_submissions_mission on mission_submissions(mission_id);
