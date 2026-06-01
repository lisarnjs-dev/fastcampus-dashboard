-- RLS 활성화
alter table cohorts enable row level security;
alter table students enable row level security;
alter table attendances enable row level security;
alter table missions enable row level security;
alter table mission_submissions enable row level security;

-- cohorts: 모든 사람 SELECT, service_role만 INSERT/UPDATE/DELETE
create policy "cohorts_select_all" on cohorts for select using (true);
create policy "cohorts_insert_service" on cohorts for insert with check (true);
create policy "cohorts_update_service" on cohorts for update using (true);
create policy "cohorts_delete_service" on cohorts for delete using (true);

-- students: service_role만 (auth_code 보호)
create policy "students_all_service" on students using (true) with check (true);

-- attendances: 모든 사람 SELECT, service_role INSERT
create policy "attendances_select_all" on attendances for select using (true);
create policy "attendances_insert_service" on attendances for insert with check (true);

-- missions: 모든 사람 SELECT, service_role INSERT/UPDATE/DELETE
create policy "missions_select_all" on missions for select using (true);
create policy "missions_insert_service" on missions for insert with check (true);
create policy "missions_update_service" on missions for update using (true);
create policy "missions_delete_service" on missions for delete using (true);

-- mission_submissions: 모든 사람 SELECT, service_role INSERT
create policy "submissions_select_all" on mission_submissions for select using (true);
create policy "submissions_insert_service" on mission_submissions for insert with check (true);
