# Chăm con 360 – Phase 2: danh sách màn hình (HTML + Bootstrap 5)

Các file đánh số **theo thứ tự luồng dùng app**: đăng nhập → tạo hồ sơ → hướng dẫn → Trang chủ → cập nhật tuần → Công cụ → từng công cụ → tài khoản. Mỗi file là một màn độc lập, responsive (mobile 390px, tablet 820px). Không có tính năng AI.
Hậu tố `a` là **trạng thái trống** (chưa có dữ liệu), `b` là **trạng thái có dữ liệu**.
Game lật thẻ là bài **Trí nhớ** của IQ: làm xong câu hỏi (màn 17) thì chơi lật thẻ (màn 36) rồi ra kết quả IQ (màn 18). Game vẫn còn trong Công cụ (Tiện ích) để chơi riêng.

| Thứ tự | File | Loại | Theo yêu cầu khách |
|---|---|---|---|
| 01 | 01_dang-nhap-dang-ky.html | Hiệu chỉnh | Đăng ký nhanh bằng Google, Apple |
| 02 | 02_tao-ho-so-cho-con.html | Hiệu chỉnh | Đổi "Thêm bé" thành "Tạo hồ sơ cho con" |
| 03 | 03_huong-dan-su-dung.html | Hiệu chỉnh | Hướng dẫn dự đoán chiều cao sau khi lưu hồ sơ |
| 04 | 04_popup-chao-mua-goi.html | Mới | Chỉ hiện với user chưa đăng ký gói |
| 05a | 05a_trang-chu_chua-cap-nhat-tuan.html | Hiệu chỉnh | Trang chủ, tuần này CHƯA cập nhật: thẻ "Cập nhật tuần này" + nút Cập nhật ngay |
| 05b | 05b_trang-chu_da-cap-nhat-tuan.html | Hiệu chỉnh | Trang chủ, tuần này ĐÃ cập nhật: thẻ xác nhận, chuỗi tuần liền, hẹn tuần sau |
| 06 | 06_cap-nhat-tuan-buoc-1-so-do.html | Mới | Cập nhật tuần: chiều cao, cân nặng (điền sẵn số tuần trước) |
| 08 | 08_cap-nhat-tuan-ket-qua.html | Mới | Kết quả sau khi cập nhật: số đo so tuần trước và chuẩn WHO, gợi ý tuần sau |
| 09 | 09_cong-cu.html | Hiệu chỉnh | Công cụ: đánh giá toàn diện (PQ, IQ, GPA, EQ, AQ), Giáo dục, Tiện ích |
| 10 | 10_pq-tong-quan.html | Hiệu chỉnh | Radar thể chất 5 trục, so chuẩn WHO, BMI, cách tính điểm (bảng % WHO → điểm) |
| 11 | 11_pq-them-lan-do.html | Hiệu chỉnh | Nhập chiều cao, cân nặng, thời điểm cân đo |
| 12 | 12_pq-ket-qua-do.html | Hiệu chỉnh | Đổi nút "Hoàn thành" thành "Xem lịch sử" |
| 13 | 13_pq-lich-su.html | Hiệu chỉnh | So cân nặng với chuẩn WHO; BMI trẻ dưới 5 tuổi |
| 14a | 14a_iq-tong-quan_trong.html | Hiệu chỉnh | IQ tổng quan, TRẠNG THÁI TRỐNG: chưa đánh giá, nút Bắt đầu đánh giá IQ |
| 14b | 14b_iq-tong-quan_co-du-lieu.html | Hiệu chỉnh | IQ tổng quan SAU KHI HOÀN THÀNH: điểm IQ, kết quả 4 loại (độ tuổi, người đánh giá, ngày), danh hiệu |
| 16 | 16_iq-chon-nguoi-danh-gia.html | Mới | Luồng IQ: chọn người đánh giá (bé tự làm, bố mẹ, người thân/giáo viên) |
| 17 | 17_iq-eq-aq-lam-bai.html | Mới | Làm bài trắc nghiệm dùng chung IQ/EQ/AQ: mỗi câu có loại câu hỏi |
| 18 | 18_iq-ket-qua.html | Hiệu chỉnh | Kết quả từng loại IQ, bảng danh hiệu |
| 19 | 19_eq-tong-quan.html | Mới | EQ chia 5 năng lực, kết quả từng loại, nút bắt đầu đánh giá |
| 20 | 20_aq-tong-quan.html | Mới | AQ chia 5 năng lực, kết quả từng loại, nút bắt đầu đánh giá |
| 21 | 21_giai-thich-eq-aq-iq.html | Hiệu chỉnh | Giải thích EQ, AQ, IQ |
| 22a | 22a_hoc-ba-lop-1-5_trong.html | Hiệu chỉnh | Học bạ lớp 1–5: trạng thái trống |
| 22b | 22b_hoc-ba-lop-1-5_co-du-lieu.html | Hiệu chỉnh | Học bạ lớp 1–5: nhập điểm, mức T/H/C, nhận xét từng môn, hình bảng điểm |
| 23a | 23a_hoc-ba-lop-6-tro-len_trong.html | Hiệu chỉnh | Học bạ lớp 6+: trạng thái trống |
| 23b | 23b_hoc-ba-lop-6-tro-len_co-du-lieu.html | Hiệu chỉnh | Học bạ lớp 6+: nhập HK1/HK2, cả năm tự tính, Đạt/Chưa đạt, xếp loại |
| 24a | 24a_hoc-ba-dashboard_trong.html | Mới | Dashboard học bạ: trạng thái trống |
| 24b | 24b_hoc-ba-dashboard_co-du-lieu.html | Mới | Dashboard học bạ theo cấp TH, THCS, THPT |
| 25 | 25_chieu-cao-nhap-thong-tin.html | Hiệu chỉnh | Nhập thời gian dậy thì trước khi xem dự đoán |
| 26 | 26_chieu-cao-du-doan.html | Hiệu chỉnh | 1 kết quả miễn phí; khóa phác đồ |
| 27 | 27_chieu-cao-phac-do.html | Hiệu chỉnh | Mở khóa, nhập mục tiêu, xem phác đồ |
| 28 | 28_tiem-chung.html | Hiệu chỉnh | Chỉ mở sổ khi người dùng chọn |
| 29 | 29_thai-ky.html | Hiệu chỉnh | Thiết kế mới; tiêu chuẩn Vinmec |
| 30 | 30_nhat-ky-khoanh-khac.html | Hiệu chỉnh | Gợi ý cột mốc theo giai đoạn; mới nhất ở trên |
| 31 | 31_giao-duc-danh-sach-video.html | Mới | 3 nhóm tuổi gần nhất; chủ đề; sub-category; khóa gói |
| 32 | 32_giao-duc-chi-tiet-bai-tap.html | Mới | Video xoay ngang; tên, nội dung, loại, tần suất, lợi ích, dụng cụ |
| 33 | 33_kien-thuc-cham-con-danh-sach.html | Mới | Mục "Bài viết" chuyển vào Tiện ích với tên "Kiến thức chăm con": danh sách bài, lọc theo chủ đề |
| 34 | 34_kien-thuc-cham-con-bai-viet.html | Mới | Chi tiết bài viết, lưu bài, chia sẻ, bài liên quan |
| 35 | 35_game-lat-the-chon-chu-de.html | Hiệu chỉnh | Game lật thẻ (độc lập, không tính điểm IQ): 4 chủ đề, bảng kích thước và thời gian theo tuổi |
| 36a | 36a_game-lat-the-choi_3x4-5-7-tuoi.html | Hiệu chỉnh | Game lật thẻ, lưới 3×4 (bé 5–7 tuổi, 60 giây): thắng ván khi ghép hết cặp trước giờ, +1 điểm |
| 36b | 36b_game-lat-the-choi_6x6-tren-14-tuoi.html | Hiệu chỉnh | Game lật thẻ, lưới 6×6 (trên 14 tuổi, 90 giây): 36 thẻ, 18 cặp |
| 37 | 37_thong-bao.html | Mới | Thông báo (tab thứ 3): nhắc cập nhật bấm vào đi thẳng bước 1 |
| 38 | 38_tai-khoan-menu.html | Hiệu chỉnh | Thêm Giới thiệu, Góc chuyên gia, Kiếm tiền, Hạng bố mẹ, Nhắc nhở; hiển thị phiên bản |
| 39 | 39_cai-dat-nhac-nho.html | Mới | Cài đặt nhắc nhở: ngày, giờ, nhắc lại một lần, xem trước thông báo |
| 40 | 40_kiem-tien-affiliate.html | Mới | Ví, lịch sử giao dịch, mã giới thiệu, rút tiền (tài khoản nhận, CCCD, MST), chống gian lận |
| 41 | 41_hang-bo-me.html | Mới | Hạng bố mẹ theo số tuần cập nhật/tháng (tối đa 4), số bài đánh giá, điểm của con |
| 42 | 42_gioi-thieu.html | Mới | Nền tảng, tầm nhìn, sứ mệnh |
| 43 | 43_goc-chuyen-gia.html | Mới | Hội đồng cố vấn và tư vấn |
| 44 | 44_gioi-han-thiet-bi.html | Mới | Free 1 thiết bị, VIP 5 thiết bị |
| 45 | 45_chon-be.html | Mới | Chọn hồ sơ của bé: ảnh, tên, tuổi, ô Mẹ bầu, nút Thêm bé |
| 46 | 46_them-khoanh-khac.html | Mới | Thêm khoảnh khắc: chọn cột mốc, ngày, ảnh, ghi chú |

## Cần khách xác nhận (đang dùng số liệu hoặc nội dung minh họa)
- Mức thưởng "xxx đ" mỗi lượt đăng ký và "y%" hoa hồng (màn 22).
- Cách hiểu câu "giữ 10% thuế, trừ khi rút" (màn 22).
- Ngưỡng và tên các hạng bố mẹ (màn 23).
- Giá gói VIP 1 năm (màn 26); gói 6 tháng 680.000 đ lấy từ Figma cũ.
- Bảng tiêu chuẩn thai kỳ Vinmec (màn 17), bảng WHO (màn 03, 10).
- Nội dung Giới thiệu và thông tin chuyên gia (màn 24, 25).
- Hình minh họa PQ, IQ, EQ, AQ, GPA đang là huy hiệu chữ, thay bằng hình gốc trong Figma.

## Quy ước giao diện (dễ bảo trì)
- Dùng class Bootstrap 5 trước; chỉ khi class không đáp ứng mới viết CSS riêng.
- Mọi tinh chỉnh kích thước theo Flutter Material 3 nằm ở **theme.css** (nguồn duy nhất, ghi đè biến `--bs-*`). Sửa xong chạy `python3 tools/apply-theme.py` để nhúng vào mọi màn (nhúng inline để plugin HTML→Figma vẫn đọc được).
- Kiểm tra tự động ở khổ 390px: `node tools/audit.mjs` (chữ tràn, nút nhỏ hơn 44px, trang tràn ngang). Chụp màn: `node tools/shot.mjs <thư mục> <số màn...>`.
- Cỡ chạm: nút cao 48px, ô nhập 56px, dòng danh sách 56px, thanh điều hướng 80px, AppBar 56px.
