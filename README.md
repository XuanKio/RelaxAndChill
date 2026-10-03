# FunnyProject — Xoa xoa studio

Web tạo meme xoa đầu, với luồng bốn bước:

1. Chọn nhân vật: tải ảnh, chụp bằng camera hoặc dùng mèo mẫu.
2. Tách nền: tự động cho nền ít màu, chọn một vùng màu, hoặc dùng cọ xóa/khôi phục.
3. Chọn tay: tay từ trái, tay từ phải, hoặc tải ảnh bàn tay PNG/WEBP riêng.
4. Xoa đầu: giữ và rê chuột/ngón tay; phím cách và nút Xoa thử cũng dùng được.

## Chạy trên máy

Cần Node.js 20 trở lên. Không cần cài thư viện.

```powershell
cd D:\FunnyProject
npm run dev
```

Mở http://127.0.0.1:8765. Máy ảnh yêu cầu người dùng cấp quyền. Trên trình duyệt không hỗ trợ camera, ứng dụng chuyển sang trình chọn/chụp ảnh của thiết bị.

```powershell
npm run check
npm test
```

## Tách nền nhẹ tự viết

`dist/background.js` là thuật toán xử lý màu, **không phải model AI được huấn luyện**. Nó tìm màu phổ biến ở viền ảnh, rồi xóa những điểm ảnh cùng màu có kết nối với viền. Chế độ chạm chọn màu chỉ xóa vùng liên thông với điểm được chọn.

- Chạy trong Web Worker, không tải model và không gửi ảnh lên máy chủ.
- Phù hợp nền trắng hoặc nền gần đồng màu. Nền phức tạp, chủ thể cùng màu với nền và tóc/lông cần chỉnh bằng cọ.
- Có cọ xóa, cọ khôi phục, giữ vùng chữ nhật và tối đa 6 lần hoàn tác.
- Ảnh được giảm xuống cạnh dài tối đa 1200 px để giới hạn bộ nhớ trên điện thoại. Bàn tay riêng giới hạn 1000 px.
- Tạm dừng xử lý tự động sau 15 giây; người dùng có thể hủy và tiếp tục bằng cọ.

## Cấu trúc

```text
dist/                  Website tĩnh, cũng là mã nguồn dùng trực tiếp
  app.js               Luồng bốn bước, canvas, cọ, camera, tương tác xoa
  background.js        Thuật toán tách nền thuần JavaScript
  background-worker.js Xử lý ảnh ngoài luồng giao diện
  index.html           Nội dung và điều khiển
  style.css            Bố cục laptop/điện thoại
scripts/               Máy chủ local và kiểm tra cú pháp/tài nguyên
tests/                 Kiểm tra thuật toán tách nền
```

## Phát triển và triển khai

Repo chính: `git@github.com:XuanKio/FunnyProject.git`. Các mốc được commit và push riêng trên `main`; không force-push.

Thư mục `dist/` có thể đưa lên hosting tĩnh có HTTPS. Bản Sites hiện tại được cập nhật từ thư mục này; credential triển khai không lưu trong repo. Không tự động triển khai sau mỗi lần push GitHub.

Không có API key, analytics, tải model, font hay thư viện bên ngoài ở runtime. Dữ liệu chỉnh ảnh chỉ tồn tại trong bộ nhớ trang và sẽ mất khi tải lại. Hai ảnh mẫu đã được tạo bằng công cụ tạo ảnh trong phiên phát triển đầu tiên.

## Kiểm tra

`npm test` kiểm tra xóa nền viền, giữ chi tiết cùng màu nhưng nằm bên trong chủ thể, xóa vùng liên thông theo điểm chọn, ảnh trong suốt, ảnh rộng một pixel và đầu vào không hợp lệ. `npm run check` kiểm tra cú pháp JavaScript và tài nguyên HTML cục bộ.

Giao diện dùng Pointer Events cho chuột/ngón tay, điều khiển bàn phím, trạng thái tiến độ, nhãn truy cập và chế độ giảm chuyển động. Thiết kế responsive ở 390 px và 1366 px; camera cần kiểm tra trên thiết bị có camera thực tế.
