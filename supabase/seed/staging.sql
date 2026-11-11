-- Safe demo data for the employee staging project.
-- Run after supabase/schema.sql and the migrations.
-- This seed contains no production group, customer, token, or poster data.

begin;

do $$
begin
  if not exists (select 1 from public.topics where owner_id = '00000000-0000-0000-0000-000000000001'::uuid) then
    insert into public.topics (owner_id, name, description) values
      ('00000000-0000-0000-0000-000000000001', 'Tin mẫu', 'Chủ đề dùng để kiểm thử giao diện'),
      ('00000000-0000-0000-0000-000000000001', 'Đời sống mẫu', 'Dữ liệu giả lập cho nhân viên test');
  end if;
end
$$;

insert into public.groups (owner_id, name, url, normalized_url, topic_label, audience, status)
values
  ('00000000-0000-0000-0000-000000000001', 'Group mẫu Hà Nội', 'https://www.facebook.com/groups/demo-ha-noi', 'https://www.facebook.com/groups/demo-ha-noi', 'Tin mẫu', 'Người dùng Facebook tại Hà Nội', 'testing'),
  ('00000000-0000-0000-0000-000000000001', 'Group mẫu phụ huynh', 'https://www.facebook.com/groups/demo-phu-huynh', 'https://www.facebook.com/groups/demo-phu-huynh', 'Đời sống mẫu', 'Phụ huynh và gia đình', 'pending_review')
on conflict (owner_id, normalized_url) do nothing;

insert into public.contents (owner_id, title, caption, source_url, status)
values
  ('00000000-0000-0000-0000-000000000001', 'Bài mẫu để kiểm thử', 'Đây là nội dung giả lập. Không đăng lên Facebook thật.', 'https://example.com/demo-source', 'draft'),
  ('00000000-0000-0000-0000-000000000001', 'Bài mẫu chờ duyệt', 'Nội dung dùng để kiểm tra luồng duyệt.', 'https://example.com/demo-review', 'approved')
on conflict do nothing;

commit;
