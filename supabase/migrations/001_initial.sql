-- Enable pgvector extension
create extension if not exists vector;

-- Users (synced from Clerk via webhook)
create table users (
  id uuid primary key default gen_random_uuid(),
  clerk_id text unique not null,
  email text not null,
  name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_users_clerk_id on users(clerk_id);

-- Sessions (one per agent conversation)
create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  agent_type text not null check (agent_type in ('marketing', 'research', 'coding', 'payroll')),
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_sessions_user_id on sessions(user_id);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  tool_calls jsonb,
  created_at timestamptz default now()
);

create index idx_messages_session_id on messages(session_id);

-- Agent Memory (pgvector for semantic search)
create table agent_memory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  agent_type text not null,
  content text not null,
  embedding vector(1536),
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_agent_memory_user_id on agent_memory(user_id);

-- Media Assets (images, videos)
create table media_assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  session_id uuid references sessions(id) on delete set null,
  type text not null check (type in ('image', 'video')),
  url text not null,
  prompt text not null,
  metadata jsonb,
  created_at timestamptz default now()
);

create index idx_media_assets_user_id on media_assets(user_id);

-- Row Level Security
alter table users enable row level security;
alter table sessions enable row level security;
alter table messages enable row level security;
alter table agent_memory enable row level security;
alter table media_assets enable row level security;

-- RLS Policies (service role bypasses these; anon key uses them)
-- Users can only see their own data
create policy "Users can view own profile" on users
  for select using (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can view own sessions" on sessions
  for all using (user_id in (select id from users where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

create policy "Users can view own messages" on messages
  for all using (session_id in (
    select s.id from sessions s
    join users u on s.user_id = u.id
    where u.clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'
  ));

create policy "Users can manage own memory" on agent_memory
  for all using (user_id in (select id from users where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));

create policy "Users can view own media" on media_assets
  for all using (user_id in (select id from users where clerk_id = current_setting('request.jwt.claims', true)::json->>'sub'));
