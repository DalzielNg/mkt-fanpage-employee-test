-- MKT-Fanpage · Giai đoạn 2 · Database schema
-- Chạy trong Supabase SQL Editor.
-- File này không chứa mật khẩu, token hoặc API key.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.topics (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, id),
  unique (owner_id, name)
);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  storage_path text not null,
  original_name text,
  mime_type text not null,
  byte_size bigint,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, id),
  unique (owner_id, storage_path)
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  url text not null check (length(trim(url)) > 0),
  normalized_url text not null check (length(trim(normalized_url)) > 0),
  topic_id uuid,
  topic_label text,
  audience text,
  notes text,
  status text not null default 'testing' check (status in ('ready', 'testing', 'pending_review', 'rejected', 'paused')),
  approval_rate numeric(5, 2) check (approval_rate is null or (approval_rate >= 0 and approval_rate <= 100)),
  last_tested_at timestamptz,
  is_deleted boolean not null default false,
  deleted_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, id),
  unique (owner_id, normalized_url),
  constraint groups_topic_owner_fk
    foreign key (owner_id, topic_id) references public.topics(owner_id, id)
);

create table if not exists public.contents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  title text not null check (length(trim(title)) > 0),
  caption text not null default '',
  source_url text,
  topic_id uuid,
  poster_asset_id uuid references public.media_assets(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'rejected')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, id),
  constraint contents_topic_owner_fk
    foreign key (owner_id, topic_id) references public.topics(owner_id, id),
  constraint contents_poster_owner_fk
    foreign key (owner_id, poster_asset_id) references public.media_assets(owner_id, id)
);

create table if not exists public.batches (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  name text not null check (length(trim(name)) > 0),
  topic_id uuid,
  content_id uuid not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'in_progress', 'completed', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, id),
  constraint batches_topic_owner_fk
    foreign key (owner_id, topic_id) references public.topics(owner_id, id),
  constraint batches_content_owner_fk
    foreign key (owner_id, content_id) references public.contents(owner_id, id)
);

create table if not exists public.queue_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  batch_id uuid not null,
  group_id uuid not null,
  content_id uuid not null,
  status text not null default 'pending' check (status in ('pending', 'posted', 'pending_approval', 'approved', 'rejected', 'error')),
  posted_url text,
  posted_at timestamptz,
  approval_checked_at timestamptz,
  error_message text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, id),
  unique (batch_id, group_id),
  constraint queue_batch_owner_fk
    foreign key (owner_id, batch_id) references public.batches(owner_id, id),
  constraint queue_group_owner_fk
    foreign key (owner_id, group_id) references public.groups(owner_id, id),
  constraint queue_content_owner_fk
    foreign key (owner_id, content_id) references public.contents(owner_id, id)
);

create table if not exists public.metric_snapshots (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  queue_item_id uuid not null,
  captured_at timestamptz not null,
  impressions bigint,
  views bigint,
  viewers bigint,
  interactions bigint,
  comments bigint,
  distribution bigint,
  watch_time_seconds numeric,
  average_watch_time_seconds numeric,
  views_3_seconds bigint,
  views_1_minute bigint,
  revenue numeric(12, 4),
  follows bigint,
  source text,
  created_at timestamptz not null default timezone('utc', now()),
  unique (queue_item_id, captured_at),
  constraint metrics_queue_owner_fk
    foreign key (owner_id, queue_item_id) references public.queue_items(owner_id, id)
);

create table if not exists public.group_decisions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  group_id uuid not null,
  batch_id uuid,
  decision text not null check (decision in ('keep', 'test_more', 'move_topic', 'pause')),
  note text,
  decided_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  constraint decisions_group_owner_fk
    foreign key (owner_id, group_id) references public.groups(owner_id, id),
  constraint decisions_batch_owner_fk
    foreign key (owner_id, batch_id) references public.batches(owner_id, id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists groups_owner_topic_idx on public.groups(owner_id, topic_id) where is_deleted = false;
create index if not exists groups_owner_status_idx on public.groups(owner_id, status) where is_deleted = false;
create index if not exists contents_owner_status_idx on public.contents(owner_id, status);
create index if not exists batches_owner_created_idx on public.batches(owner_id, created_at desc);
create index if not exists queue_owner_status_idx on public.queue_items(owner_id, status);
create index if not exists metrics_queue_captured_idx on public.metric_snapshots(queue_item_id, captured_at desc);
create index if not exists decisions_owner_date_idx on public.group_decisions(owner_id, decided_at desc);
create index if not exists audit_owner_date_idx on public.audit_logs(owner_id, created_at desc);

drop trigger if exists topics_set_updated_at on public.topics;
create trigger topics_set_updated_at
before update on public.topics
for each row execute function public.set_updated_at();

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

drop trigger if exists groups_set_updated_at on public.groups;
create trigger groups_set_updated_at
before update on public.groups
for each row execute function public.set_updated_at();

drop trigger if exists contents_set_updated_at on public.contents;
create trigger contents_set_updated_at
before update on public.contents
for each row execute function public.set_updated_at();

drop trigger if exists batches_set_updated_at on public.batches;
create trigger batches_set_updated_at
before update on public.batches
for each row execute function public.set_updated_at();

drop trigger if exists queue_items_set_updated_at on public.queue_items;
create trigger queue_items_set_updated_at
before update on public.queue_items
for each row execute function public.set_updated_at();

alter table public.topics enable row level security;
alter table public.media_assets enable row level security;
alter table public.groups enable row level security;
alter table public.contents enable row level security;
alter table public.batches enable row level security;
alter table public.queue_items enable row level security;
alter table public.metric_snapshots enable row level security;
alter table public.group_decisions enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists topics_owner_policy on public.topics;
create policy topics_owner_policy on public.topics
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists media_assets_owner_policy on public.media_assets;
create policy media_assets_owner_policy on public.media_assets
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists groups_owner_policy on public.groups;
create policy groups_owner_policy on public.groups
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists contents_owner_policy on public.contents;
create policy contents_owner_policy on public.contents
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists batches_owner_policy on public.batches;
create policy batches_owner_policy on public.batches
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists queue_items_owner_policy on public.queue_items;
create policy queue_items_owner_policy on public.queue_items
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists metric_snapshots_owner_policy on public.metric_snapshots;
create policy metric_snapshots_owner_policy on public.metric_snapshots
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists group_decisions_owner_policy on public.group_decisions;
create policy group_decisions_owner_policy on public.group_decisions
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

drop policy if exists audit_logs_owner_policy on public.audit_logs;
create policy audit_logs_owner_policy on public.audit_logs
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

-- Xác nhận nhanh sau khi chạy:
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_name in (
    'topics', 'media_assets', 'groups', 'contents', 'batches',
    'queue_items', 'metric_snapshots', 'group_decisions', 'audit_logs'
  )
order by table_name;
