# MKT-Fanpage

MKT-Fanpage là nền tảng hỗ trợ vận hành nội dung Facebook cho dự án kiếm tiền từ nội dung. Dự án hướng tới việc giảm các thao tác thủ công khi quản lý nhiều group và fanpage: phân loại group theo chủ đề và tệp người xem, điều phối AI tạo nội dung phù hợp, theo dõi trạng thái đăng bài, ghi nhận bài đã duyệt hoặc chờ duyệt, và phân tích hiệu quả theo chủ đề, group và nhóm đối tượng.

## Dành cho ai

Dự án dành cho cá nhân hoặc đội ngũ vận hành fanpage/group cần quản lý số lượng lớn group, xây dựng nội dung theo nhiều chủ đề, theo dõi lịch sử đăng bài và tối ưu nội dung dựa trên dữ liệu.

## Mục tiêu chính

- Quản lý danh mục group: tên, liên kết, chủ đề, đối tượng và trạng thái tham gia.
- Phân loại group và ghép group với chủ đề nội dung phù hợp.
- Hỗ trợ tạo nội dung và poster theo từng chủ đề thông qua AI.
- Lập lịch, ghi nhận và theo dõi trạng thái đăng bài; hạn chế đăng trùng hoặc đăng nhầm group.
- Tổng hợp chỉ số và phân tích hiệu quả nội dung theo group, chủ đề và tệp đối tượng.

## Nguyên tắc an toàn

- Không commit `.env`, token, API key, cookie phiên hoặc thông tin đăng nhập lên GitHub.
- Chỉ tự động hóa các hoạt động phù hợp với quyền truy cập, chính sách của nền tảng và quy định pháp luật hiện hành.
- Các thao tác đăng bài thực tế cần có cơ chế kiểm duyệt, giới hạn tần suất và nhật ký để tránh đăng nhầm hoặc spam.

## Trạng thái

Đây là repository khởi đầu cho quá trình xây dựng MKT-Fanpage. Kiến trúc, backend, giao diện quản trị và các kết nối nền tảng sẽ được bổ sung theo từng giai đoạn.

Quy trình vận hành hiện hành của cohort Tin tức & Thời sự được chốt tại [PROCESS_CANON.md](cohort-thoi-su-ops/PROCESS_CANON.md). File này là tài liệu điều phối; trạng thái, checksum và receipt vẫn lấy từ các ledger trong `cohort-thoi-su-ops/state/`.

## Cấu hình môi trường

Sao chép `.env.example` thành `.env` rồi điền giá trị cục bộ. File `.env` được Git bỏ qua và không được đưa lên repository.

## Bản nhân viên test

Đây là bản source đã làm sạch để dùng cho môi trường staging. Bản này không chứa poster, nội dung vận hành, backup hoặc secret production. Cấu hình staging nằm trong `.env.staging.example`; dữ liệu mẫu nằm ở `supabase/seed/staging.sql`.

Xem [docs/EMPLOYEE_TESTING.md](docs/EMPLOYEE_TESTING.md) trước khi cấp tài khoản cho nhân viên.

Build site:

```sh
cd site
./scripts/build.sh
```
