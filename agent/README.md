# MKT-Fanpage Agent MVP

Thư mục này khóa hợp đồng giữa Agent biên tập và app trước khi kết nối API thật.

## Thành phần

- `contracts/content-draft.schema.json`: JSON Schema bắt buộc cho đầu ra Agent.
- `examples/content-draft.example.json`: ví dụ hợp lệ để kiểm tra schema và giao diện.
- `prompts/content-agent.md`: chỉ dẫn lớp ứng dụng đặt trên skill `mkt-news-poster-copy`.
- `scripts/validate-contract.mjs`: kiểm tra nhanh hợp đồng và ví dụ mà không cần cài thư viện.

## Nguyên tắc triển khai

1. Skill nguồn vẫn là `/Users/user/.codex/skills/mkt-news-poster-copy` trong môi trường phát triển.
2. Khi đưa lên OpenAI, tải nguyên thư mục skill đó thành Hosted Skill và khóa một version cụ thể.
3. `OPENAI_MKT_NEWS_SKILL_ID` và `OPENAI_MKT_NEWS_SKILL_VERSION` chỉ cấu hình ở môi trường máy chủ.
4. Trình duyệt không nhận `OPENAI_API_KEY`, skill ID có quyền quản trị hoặc khóa Supabase.
5. Agent chỉ tạo nội dung ở trạng thái `draft`; người dùng duyệt trong app.
6. Nếu Agent không đọc được nguồn hoặc không chắc dữ kiện, trả `needs_review` hoặc `blocked`, không bịa dữ liệu để đủ schema.

## Kiểm tra cục bộ

```sh
node agent/scripts/validate-contract.mjs
```

Script này chỉ kiểm tra cấu trúc tĩnh. Kiểm thử API thật chỉ chạy sau khi khóa bí mật đã được cấu hình bằng công cụ quản lý secret phía máy chủ.
