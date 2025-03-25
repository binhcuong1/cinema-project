# Web Rạp Chiếu Phim

## 1. Giới thiệu dự án
Dự án **Web Rạp Chiếu Phim** được phát triển bởi nhóm 1 trong đồ án tại Trường Đại học Công nghệ TP. HCM. Mục tiêu là xây dựng một website cho phép người dùng xem danh sách phim, quản lý cụm rạp, đặt vé trực tuyến, và quản lý tài khoản cá nhân.

### Thông tin nhóm
- **Nhóm trưởng:** Dương Bình Cương - MSSV: 2280600332
- **Thành viên:**
  - Lý Minh Hải - MSSV: 2280600804
  - Phan Chí Quốc Bảo - MSSV: 2280600223
  - Chế Quốc Đạt - MSSV: 2280600566
- **Giảng viên hướng dẫn:** Thầy Phạm Bửu Tài - Email: buutai@gmail.com

---

## 2. Cấu trúc dự án
cinema-project/
│
├── backend/                # Mã nguồn back-end (Node.js, Express)
├── frontend/               # Mã nguồn front-end (HTML/CSS/JS)
├── docs/                   # Tài liệu dự án (phân tích, bảng mô tả)
├── tests/                  # Tài liệu kiểm thử
└── README.md               # File này
Chi tiết cách sử dụng từng phần, xem file `docs/usage.md`.

## 3. Yêu cầu cài đặt
### Phần mềm cần thiết
- **Node.js:** Phiên bản 16.x trở lên (khuyến nghị LTS).
  - Kiểm tra: `node -v` và `npm -v`.
- **Trình duyệt:** Chrome, Firefox (để chạy front-end).
- **Database :** MySQL.
- **Công cụ hỗ trợ:** Git (quản lý mã nguồn).

### Cài đặt Node.js
1. Tải Node.js từ [nodejs.org](https://nodejs.org) (chọn LTS).
2. Cài đặt, đảm bảo chọn "Add to PATH".
3. Kiểm tra cài đặt:
node -v
npm -v

Nếu thấy phiên bản (ví dụ: `v20.10.0`, `9.8.1`), cài đặt thành công.

---

## 4. Hướng dẫn cài đặt và chạy dự án

### 4.1. Back-end
1. Di chuyển vào thư mục back-end: cd backend
2. Cài đặt các thư viện: npm install
3. Tạo file `.env` để cấu hình:
PORT=3000
MONGO_URI=mongodb://localhost:27017/cinema_db
4. Chạy server:
node server.js
Server sẽ chạy tại `http://localhost:3000`.

### 4.2. Front-end (HTML/CSS/JS)
1. Di chuyển vào thư mục front-end:
2. Mở file `index.html` trong trình duyệt (Chrome/Firefox) để xem giao diện.
3. Chạy dự án: npm start

Giao diện sẽ chạy tại `http://localhost:3000`.

---

## 5. Tính năng chính
- **Danh sách phim:** Xem thông tin phim (tên, thể loại, thời lượng, trailer).
- **Quản lý cụm rạp:** Chọn rạp để xem phim đang chiếu, sắp chiếu, suất chiếu.
- **Đặt vé:** Chọn suất chiếu, ghế ngồi, và đặt vé (hiển thị ghế trống/đã đặt).
- **Quản lý tài khoản:** Đăng nhập, đăng ký, xem lịch sử đặt vé.
- **Tìm kiếm phim:** Tìm phim theo tên, thể loại.

---

## 6. Công nghệ sử dụng
- **Back-end:** Node.js, Express.
- **Front-end:** HTML, CSS, JavaScript (hoặc React nếu nhóm chọn).
- **Database:** MySQL.
- **Công cụ hỗ trợ:** Git, npm, Postman.

---

## 7. Kiểm thử
- **Test API:** Dùng Postman, xem hướng dẫn tại `tests/api/test_api.md`.
- **Test giao diện:** Dùng Chrome/Firefox, xem hướng dẫn tại `tests/ui/test_ui.md`.

---

## 8. Hướng dẫn làm việc nhóm
- Xem file `docs/usage.md` để hiểu cấu trúc và nhiệm vụ từng thành viên.
- Mọi thắc mắc, liên hệ nhóm trưởng ([Dương Bình Cương], email: [binhcuongpy2014@gmail.com]).

---

## 9. Ghi chú
- Dự án đang phát triển, các tính năng có thể được cập nhật.
- Nếu gặp lỗi cài đặt, kiểm tra Node.js và npm đã cài đúng chưa.

