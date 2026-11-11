-- Agent MVP: lưu trạng thái lượt chạy và metadata nội dung do Agent tạo.
-- Migration này không cấp quyền duyệt nội dung, tạo hàng đợi hoặc đăng Facebook.

create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  run_type text not null default 'content_from_url'
    check (run_type in ('content_from_url')),
  source_url text not null check (length(trim(source_url)) > 0),
  status text not null default 'queued'
    check (status in ('queued', 'running', 'waiting_review', 'completed', 'failed', 'cancelled')),
  current_step text,
  content_id uuid,
  skill_name text not null default 'mkt-news-poster-copy',
  skill_version text,
  model_name text,
  input_json jsonb not null default '{}'::jsonb,
  output_json jsonb,
  warnings_json jsonb not null default '[]'::jsonb,
  error_code text,
  error_message_safe text,
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (owner_id, id),
  constraint agent_runs_content_owner_fk
    foreign key (owner_id, content_id) references public.contents(owner_id, id)
    on delete set null
);

alter table public.contents add column if not exists source_name text;
alter table public.contents add column if not exists source_published_at timestamptz;
alter table public.contents add column if not exists poster_title text;
alter table public.contents add column if not exists pinned_comment text;
alter table public.contents add column if not exists verification_notes jsonb not null default '[]'::jsonb;
alter table public.contents add column if not exists generation_origin text not null default 'manual';
alter table public.contents add column if not exists agent_run_id uuid;
alter table public.contents add column if not exists reviewed_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contents_generation_origin_check'
  ) then
    alter table public.contents
      add constraint contents_generation_origin_check
      check (generation_origin in ('manual', 'agent'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'contents_agent_run_owner_fk'
  ) then
    alter table public.contents
      add constraint contents_agent_run_owner_fk
      foreign key (owner_id, agent_run_id) references public.agent_runs(owner_id, id)
      on delete set null;
  end if;
end
$$;

create index if not exists agent_runs_owner_created_idx
  on public.agent_runs(owner_id, created_at desc);

create index if not exists agent_runs_owner_status_idx
  on public.agent_runs(owner_id, status, updated_at desc);

create index if not exists agent_runs_owner_source_idx
  on public.agent_runs(owner_id, source_url);

create index if not exists contents_owner_source_idx
  on public.contents(owner_id, source_url)
  where source_url is not null;

drop trigger if exists agent_runs_set_updated_at on public.agent_runs;
create trigger agent_runs_set_updated_at
before update on public.agent_runs
for each row execute function public.set_updated_at();

alter table public.agent_runs enable row level security;

drop policy if exists agent_runs_owner_policy on public.agent_runs;
create policy agent_runs_owner_policy on public.agent_runs
for all using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));

comment on table public.agent_runs is
  'Lịch sử chạy Agent; không lưu API key hoặc chain-of-thought.';

comment on column public.contents.generation_origin is
  'Nguồn tạo nội dung: manual hoặc agent. Nội dung Agent luôn bắt đầu ở trạng thái draft.';
