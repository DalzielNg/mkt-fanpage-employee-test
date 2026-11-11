# Hướng dẫn test cho nhân viên

## Nguyên tắc

- Chỉ dùng địa chỉ staging và tài khoản test được cấp.
- Không nhập token Facebook, API key, cookie hoặc dữ liệu khách hàng thật.
- Không bấm đăng lên group thật khi chưa có chỉ dẫn bằng văn bản.
- Mọi dữ liệu nhập vào staging được xem là dữ liệu có thể bị reset.

## Quy trình báo lỗi

Mỗi lỗi cần ghi:

1. Tên màn hình và môi trường.
2. Tài khoản test đang dùng.
3. Các bước tái hiện theo thứ tự.
4. Kết quả thực tế và kết quả mong đợi.
5. Ảnh chụp màn hình hoặc video nếu có.
6. Mức độ: blocker, high, medium hoặc low.

## Phạm vi kiểm thử bản đầu

- Đăng nhập và hiển thị phiên.
- Thêm, sửa, lọc và đồng bộ group.
- Tạo, duyệt và xóa nội dung mẫu.
- Tạo hàng đợi và kiểm tra trạng thái.
- Sao lưu và khôi phục dữ liệu demo.
- Kiểm tra giao diện trên Chrome máy tính và điện thoại.

## Không kiểm thử trên staging

- Đăng bài thật lên Facebook.
- Kết nối tài khoản Facebook cá nhân.
- Dùng dữ liệu hoặc poster thuộc khách hàng.
- Thay đổi secret, schema hoặc biến môi trường.
