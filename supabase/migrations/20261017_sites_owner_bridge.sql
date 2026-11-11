-- MKT-Fanpage · Site auth bridge
-- Site authentication is enforced at the Worker boundary. owner_id is an
-- internal tenant UUID and intentionally does not reference Supabase Auth.

alter table public.groups drop constraint if exists groups_owner_id_fkey;
alter table public.topics drop constraint if exists topics_owner_id_fkey;
alter table public.media_assets drop constraint if exists media_assets_owner_id_fkey;
alter table public.contents drop constraint if exists contents_owner_id_fkey;
alter table public.batches drop constraint if exists batches_owner_id_fkey;
alter table public.queue_items drop constraint if exists queue_items_owner_id_fkey;
alter table public.metric_snapshots drop constraint if exists metric_snapshots_owner_id_fkey;
alter table public.group_decisions drop constraint if exists group_decisions_owner_id_fkey;
alter table public.audit_logs drop constraint if exists audit_logs_owner_id_fkey;

comment on column public.groups.owner_id is
  'Internal tenant UUID assigned by the server. Site authentication is checked before database access.';
