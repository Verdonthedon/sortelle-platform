-- Research Reports
create table research_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  session_id uuid references sessions(id) on delete set null,
  title text not null,
  content text not null,
  sources jsonb not null default '[]',
  created_at timestamptz default now()
);

create index idx_research_reports_user_id on research_reports(user_id);

alter table research_reports enable row level security;

create policy "Users can manage own research reports" on research_reports
  for all using (user_id in (select id from users where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
