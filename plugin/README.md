# HTML → Figma (plugin)

Biến file HTML (như các màn `01_...html` … `44_...html` của dự án) thành layer Figma: frame, text, ảnh, icon, SVG, gradient, bo góc, viền, đổ bóng.

## Cài đặt (Figma Desktop)
1. Mở Figma Desktop → mở 1 file thiết kế bất kỳ.
2. Menu **Plugins → Development → Import plugin from manifest…**
3. Chọn file `plugin/manifest.json`.
4. Chạy: **Plugins → Development → HTML to Figma**.

## Cách dùng
- Chọn một hoặc nhiều file `.html` (hoặc dán mã HTML vào ô).
- Chọn kích thước khung theo thiết bị (mặc định iPhone 393 × 852; có Android, iPad dọc/ngang). Trang dài hơn chiều cao khung thì frame kéo dài theo nội dung.
- Bấm **Nhập vào Figma**. Mỗi trang thành một frame, xếp nối nhau bên phải.

## Cách hoạt động
Plugin render HTML trong iframe ẩn (nên Bootstrap, Google Fonts, bootstrap-icons từ CDN vẫn được tải), đọc vị trí và style thực tế của từng phần tử rồi dựng lại trong Figma. Mặc định (bật ô "Dựng bằng Auto Layout") plugin đọc cấu trúc flex/block/grid để dựng Auto Layout: gap, padding, căn lề, Hug/Fill/Fixed, wrap, vị trí absolute và constraints. Chỗ nào Auto Layout không tái tạo được đúng hình (ví dụ margin âm ở đầu khối) thì khối đó giữ vị trí tuyệt đối. Bỏ chọn ô này nếu muốn toàn bộ layer vị trí tuyệt đối.

## Giới hạn
- Cần mạng để tải CSS/font/icon từ CDN. CSS hoặc ảnh dùng đường dẫn tương đối (file local) sẽ không tải được; ảnh lỗi thành khối xám.
- Font không có trong Figma tự chuyển sang Inter.
- Icon font (bootstrap-icons) được chuyển thành ảnh PNG, không phải vector.
- Chưa hỗ trợ: radial/conic gradient, `transform`/xoay, `position: fixed/sticky`, `z-index`, bullet của `<ul>`, `text-shadow`, `filter`, checkbox/radio (chỉ vẽ khung).
- JavaScript trong HTML vẫn chạy khi render (trạng thái ban đầu của trang được chụp lại).
