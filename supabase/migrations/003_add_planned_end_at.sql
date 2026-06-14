-- cohorts 테이블에 기수 계획 종료일 컬럼 추가
alter table cohorts add column if not exists planned_end_at date;
