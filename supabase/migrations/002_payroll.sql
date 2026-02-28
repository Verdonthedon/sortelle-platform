-- Employees
create table employees (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  name text not null,
  email text not null,
  position text not null,
  department text,
  hourly_rate numeric(10,2) default 0,
  salary numeric(12,2),
  pay_type text not null check (pay_type in ('hourly', 'salary')),
  start_date date not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_employees_user_id on employees(user_id);

-- Time Entries
create table time_entries (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid references employees(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  date date not null,
  hours numeric(5,2) not null check (hours > 0 and hours <= 24),
  description text,
  created_at timestamptz default now()
);

create index idx_time_entries_employee_id on time_entries(employee_id);

-- Pay Runs
create table pay_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  period_start date not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft', 'processing', 'completed')),
  total_gross numeric(12,2) default 0,
  total_deductions numeric(12,2) default 0,
  total_net numeric(12,2) default 0,
  created_at timestamptz default now()
);

-- Paystubs
create table paystubs (
  id uuid primary key default gen_random_uuid(),
  pay_run_id uuid references pay_runs(id) on delete cascade not null,
  employee_id uuid references employees(id) on delete cascade not null,
  user_id uuid references users(id) on delete cascade not null,
  period_start date not null,
  period_end date not null,
  gross_pay numeric(12,2) not null,
  deductions jsonb not null default '{}',
  net_pay numeric(12,2) not null,
  hours_worked numeric(7,2),
  created_at timestamptz default now()
);

-- RLS
alter table employees enable row level security;
alter table time_entries enable row level security;
alter table pay_runs enable row level security;
alter table paystubs enable row level security;

create policy "Users can manage own employees" on employees
  for all using (user_id in (select id from users where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

create policy "Users can manage own time entries" on time_entries
  for all using (user_id in (select id from users where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

create policy "Users can manage own pay runs" on pay_runs
  for all using (user_id in (select id from users where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

create policy "Users can manage own paystubs" on paystubs
  for all using (user_id in (select id from users where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
