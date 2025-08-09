
-- Enable required extension for UUID generation
create extension if not exists "pgcrypto";

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'source_type') then
    create type public.source_type as enum ('csv','google','tripadvisor','booking');
  end if;
  if not exists (select 1 from pg_type where typname = 'sentiment_label') then
    create type public.sentiment_label as enum ('positive','neutral','negative');
  end if;
  if not exists (select 1 from pg_type where typname = 'insight_priority') then
    create type public.insight_priority as enum ('low','medium','high');
  end if;
  if not exists (select 1 from pg_type where typname = 'batch_status') then
    create type public.batch_status as enum ('pending','processing','complete','failed');
  end if;
end$$;

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- data_sources: user-managed connectors (stubs now, real later)
create table if not exists public.data_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source_type public.source_type not null,
  name text not null,
  credentials jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists t_data_sources_set_updated_at on public.data_sources;
create trigger t_data_sources_set_updated_at
before update on public.data_sources
for each row execute function public.set_updated_at();

-- ingestion_batches: a logical batch per upload/pull
create table if not exists public.ingestion_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  source_type public.source_type not null,
  source_label text,
  data_source_id uuid references public.data_sources(id) on delete set null,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  total_count int not null default 0,
  success_count int not null default 0,
  error_count int not null default 0,
  status public.batch_status not null default 'pending',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ingestion_batches_user_started_idx
  on public.ingestion_batches(user_id, started_at desc);
create index if not exists ingestion_batches_user_status_idx
  on public.ingestion_batches(user_id, status);

drop trigger if exists t_ingestion_batches_set_updated_at on public.ingestion_batches;
create trigger t_ingestion_batches_set_updated_at
before update on public.ingestion_batches
for each row execute function public.set_updated_at();

-- reviews: core raw review data
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  ingestion_batch_id uuid references public.ingestion_batches(id) on delete set null,
  source_type public.source_type not null,
  -- CSV pre-mapping targets:
  hotel_name text,
  review_date timestamptz,
  rating numeric(4,2),
  rating_scale int not null default 5,
  title text,
  text text,
  author text,
  language text,
  source text,           -- free-text source label, e.g. 'google'
  external_id text,
  url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Hygiene check from request
  constraint rating_scale_positive check (rating_scale > 0)
);

-- Indexes for performance
create index if not exists reviews_user_date_idx
  on public.reviews(user_id, review_date desc);
create index if not exists reviews_user_source_idx
  on public.reviews(user_id, source_type);
-- From request: index for hotel_name filters
create index if not exists reviews_hotel_name_idx
  on public.reviews(hotel_name);

-- From request: de-dupe guard per user/source/external-id/date
create unique index if not exists reviews_user_src_dedupe
on public.reviews(user_id, source_type, coalesce(external_id,''), coalesce(review_date,'1970-01-01'::timestamptz));

drop trigger if exists t_reviews_set_updated_at on public.reviews;
create trigger t_reviews_set_updated_at
before update on public.reviews
for each row execute function public.set_updated_at();

-- review_analyses: AI outputs per review
create table if not exists public.review_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  review_id uuid not null references public.reviews(id) on delete cascade,
  sentiment public.sentiment_label,
  sentiment_score numeric(3,2),         -- -1.00 .. 1.00
  topics text[] not null default '{}',
  keywords text[] not null default '{}',
  aspects jsonb,                        -- structured aspect map (e.g., cleanliness, staff, etc.)
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One analysis per review per user (simplifies queries)
create unique index if not exists review_analyses_user_review_uidx
  on public.review_analyses(user_id, review_id);
create index if not exists review_analyses_user_sentiment_idx
  on public.review_analyses(user_id, sentiment);
create index if not exists review_analyses_review_id_idx
  on public.review_analyses(review_id);
create index if not exists review_analyses_topics_gin
  on public.review_analyses using gin (topics);
create index if not exists review_analyses_aspects_gin
  on public.review_analyses using gin ((aspects));

drop trigger if exists t_review_analyses_set_updated_at on public.review_analyses;
create trigger t_review_analyses_set_updated_at
before update on public.review_analyses
for each row execute function public.set_updated_at();

-- insights: aggregated/actionable suggestions
create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  category text,                         -- e.g., 'check_in','cleanliness','staff', etc.
  priority public.insight_priority not null default 'medium',
  impact_score numeric(3,2) not null default 0,  -- 0..1
  quick_win boolean not null default false,
  from_date date,
  to_date date,
  data jsonb,                             -- additional payload, e.g. supporting stats
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists insights_user_quickwin_idx
  on public.insights(user_id, quick_win);
create index if not exists insights_user_priority_impact_idx
  on public.insights(user_id, priority desc, impact_score desc);
create index if not exists insights_user_created_idx
  on public.insights(user_id, created_at desc);

drop trigger if exists t_insights_set_updated_at on public.insights;
create trigger t_insights_set_updated_at
before update on public.insights
for each row execute function public.set_updated_at();

-- RLS: owner-only access on all base tables
alter table public.data_sources enable row level security;
alter table public.ingestion_batches enable row level security;
alter table public.reviews enable row level security;
alter table public.review_analyses enable row level security;
alter table public.insights enable row level security;

-- Policies for data_sources
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='data_sources' and policyname='data_sources_select_own') then
    create policy data_sources_select_own on public.data_sources
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='data_sources' and policyname='data_sources_insert_own') then
    create policy data_sources_insert_own on public.data_sources
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='data_sources' and policyname='data_sources_update_own') then
    create policy data_sources_update_own on public.data_sources
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='data_sources' and policyname='data_sources_delete_own') then
    create policy data_sources_delete_own on public.data_sources
      for delete using (auth.uid() = user_id);
  end if;
end$$;

-- Policies for ingestion_batches
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ingestion_batches' and policyname='ingestion_batches_select_own') then
    create policy ingestion_batches_select_own on public.ingestion_batches
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ingestion_batches' and policyname='ingestion_batches_insert_own') then
    create policy ingestion_batches_insert_own on public.ingestion_batches
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ingestion_batches' and policyname='ingestion_batches_update_own') then
    create policy ingestion_batches_update_own on public.ingestion_batches
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='ingestion_batches' and policyname='ingestion_batches_delete_own') then
    create policy ingestion_batches_delete_own on public.ingestion_batches
      for delete using (auth.uid() = user_id);
  end if;
end$$;

-- Policies for reviews
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='reviews_select_own') then
    create policy reviews_select_own on public.reviews
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='reviews_insert_own') then
    create policy reviews_insert_own on public.reviews
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='reviews_update_own') then
    create policy reviews_update_own on public.reviews
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='reviews' and policyname='reviews_delete_own') then
    create policy reviews_delete_own on public.reviews
      for delete using (auth.uid() = user_id);
  end if;
end$$;

-- Policies for review_analyses
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='review_analyses' and policyname='review_analyses_select_own') then
    create policy review_analyses_select_own on public.review_analyses
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='review_analyses' and policyname='review_analyses_insert_own') then
    create policy review_analyses_insert_own on public.review_analyses
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='review_analyses' and policyname='review_analyses_update_own') then
    create policy review_analyses_update_own on public.review_analyses
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='review_analyses' and policyname='review_analyses_delete_own') then
    create policy review_analyses_delete_own on public.review_analyses
      for delete using (auth.uid() = user_id);
  end if;
end$$;

-- Policies for insights
do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='insights' and policyname='insights_select_own') then
    create policy insights_select_own on public.insights
      for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='insights' and policyname='insights_insert_own') then
    create policy insights_insert_own on public.insights
      for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='insights' and policyname='insights_update_own') then
    create policy insights_update_own on public.insights
      for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='insights' and policyname='insights_delete_own') then
    create policy insights_delete_own on public.insights
      for delete using (auth.uid() = user_id);
  end if;
end$$;

-- Materialized view for dashboard metrics (request + unique index for concurrent refresh)
create materialized view if not exists public.mv_metrics_daily as
with base as (
  select
    r.user_id,
    date_trunc('day', r.review_date)::date as d,
    r.rating,
    r.rating_scale,
    ra.sentiment
  from public.reviews r
  left join public.review_analyses ra on ra.review_id = r.id
  where r.review_date is not null
)
select
  user_id,
  d as day,
  count(*) as reviews_count,
  avg(nullif(rating,0)::numeric) as avg_rating,                         -- keep null if no rating
  avg( (rating::numeric / nullif(rating_scale,0)) * 5 ) as avg_norm_rating,  -- normalize to 5
  sum( case when sentiment = 'positive' then 1 else 0 end ) as pos_cnt,
  sum( case when sentiment = 'neutral'  then 1 else 0 end ) as neu_cnt,
  sum( case when sentiment = 'negative' then 1 else 0 end ) as neg_cnt
from base
group by 1,2;

-- Non-unique index from request
create index if not exists mv_metrics_daily_user_day_idx
  on public.mv_metrics_daily(user_id, day);

-- Required for REFRESH CONCURRENTLY
create unique index if not exists mv_metrics_daily_user_day_uidx
  on public.mv_metrics_daily(user_id, day);

-- (Optional but recommended) RLS on materialized view to ensure isolation
-- Note: RLS works on matviews as they are relations; enable for safety
alter table public.mv_metrics_daily enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='mv_metrics_daily' and policyname='mv_metrics_daily_select_own') then
    create policy mv_metrics_daily_select_own on public.mv_metrics_daily
      for select using (auth.uid() = user_id);
  end if;
end$$;

-- Helper to refresh fast after ingestion/analysis
create or replace function public.refresh_mv_metrics_daily()
returns void
language sql
as $$
  refresh materialized view concurrently public.mv_metrics_daily;
$$;
