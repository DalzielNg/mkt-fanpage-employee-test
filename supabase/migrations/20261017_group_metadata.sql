-- MKT-Fanpage · Preserve the current Group Registry fields used by the Site.
alter table public.groups add column if not exists topic_label text;
alter table public.groups add column if not exists notes text;
