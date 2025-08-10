-- Create review_sources table to persist integration connections
create table if not exists public.review_sources (
  user_id uuid not null,
  platform text not null,
  status text not null check (status in ('not_connected','connecting','connected','error')),
  key_masked text,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint review_sources_pkey primary key (user_id, platform)
);

-- Enable Row Level Security
alter table public.review_sources enable row level security;

-- Policies: users can manage their own rows
create policy if not exists "Users can select own review_sources"
  on public.review_sources for select
  using (auth.uid() = user_id);

create policy if not exists "Users can insert own review_sources"
  on public.review_sources for insert
  with check (auth.uid() = user_id);

create policy if not exists "Users can update own review_sources"
  on public.review_sources for update
  using (auth.uid() = user_id);

create policy if not exists "Users can delete own review_sources"
  on public.review_sources for delete
  using (auth.uid() = user_id);

-- Trigger to auto-update updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_review_sources_updated_at
before update on public.review_sources
for each row execute function public.set_updated_at();