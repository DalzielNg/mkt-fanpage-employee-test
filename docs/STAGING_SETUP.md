# Dựng môi trường staging

## 1. Tạo Supabase staging

Tạo một project Supabase mới dành riêng cho test. Không dùng URL hoặc service role key của production.

Chạy lần lượt trong SQL Editor:

1. `supabase/schema.sql`
2. Các file trong `supabase/migrations/` theo thứ tự tên file
3. `supabase/seed/staging.sql`

Tenant demo cố định cho staging là:

```text
00000000-0000-0000-0000-000000000001
```

## 2. Cấu hình worker

Tạo secret ở nền tảng deploy staging từ `.env.staging.example`:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
MKT_TENANT_ID
```

Không commit file `.env.staging` hoặc secret vào GitHub.

## 3. Build và kiểm tra cục bộ

```sh
cd site
./scripts/build.sh
node --check dist/server/index.js
```

## 4. Kiểm tra sau khi deploy

1. Mở `/api/session` và xác nhận tài khoản được xác thực.
2. Mở `/api/backend-health` và xác nhận Supabase là `ok`.
3. Tải danh sách group mẫu.
4. Tạo một nội dung mẫu, lưu nháp rồi xóa.
5. Tạo hàng đợi mẫu và kiểm tra trạng thái.
6. Kiểm tra backup và khôi phục.

## 5. Quy tắc bàn giao cho nhân viên

- Chỉ gửi URL staging và tài khoản test.
- Không gửi service role key hoặc file `.env`.
- Không cấp quyền Supabase trực tiếp cho nhân viên.
- Reset dữ liệu staging trước mỗi đợt test lớn nếu cần.
