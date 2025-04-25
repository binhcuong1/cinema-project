# Front-end: Web Rạp Chiếu Phim (HTML/CSS/JS)

## 1. Giới thiệu
Phần front-end của dự án "Web Rạp Chiếu Phim" chịu trách nhiệm xây dựng giao diện người dùng để hiển thị danh sách phim, cụm rạp, đặt vé, và quản lý tài khoản,.. Phần này sử dụng HTML, CSS, JavaScript cơ bản để gọi API từ back-end và hiển thị dữ liệu.

### Người phụ trách
- **Chế Quốc Đạt** (chính): Xây dựng giao diện.
- **Lý Minh Hải** (hỗ trợ): Hỗ trợ gọi API.

---

## 2. Cấu trúc thư mục
    frontend/
    │
    ├── assets/                 # Tài nguyên tĩnh
    │   ├── css/                # File CSS
    │   │   └── style.css       # CSS chính cho giao diện
    │   ├── js/                 # File JavaScript
    │   │   └── main.js         # JS chính (gọi API, xử lý giao diện)
    │   └── images/             # Hình ảnh (poster phim, logo)
    │
    ├── pages/                  # Các trang HTML
    │   ├── index.html          # Trang chủ (danh sách phim)
    │   ├── theater.html        # Trang chọn rạp (lịch chiếu theo rạp)
    │   ├── booking.html        # Trang đặt vé (chọn ghế, suất chiếu)
    │   ├── search.html         # Trang tìm kiếm phim
    │   └── profile.html        # Trang tài khoản người dùng
    │
    └── README.md               # File này

---

## 3. Yêu cầu cài đặt
- **Trình duyệt:** Chrome, Firefox (để chạy và kiểm tra giao diện).
- **Back-end:** Đảm bảo back-end (trong thư mục `backend/`) đang chạy tại `http://localhost:3000` để gọi API.
- **Công cụ (tùy chọn):** VS Code (để chỉnh sửa code), Live Server (extension VS Code để chạy HTML).

---

## 4. Hướng dẫn chạy front-end
1. Đảm bảo back-end đang chạy (xem `../backend/README.md`).
2. Mở thư mục `frontend/` trong VS Code.
3. Mở file `index.html` bằng Live Server (nhấp chuột phải > "Open with Live Server") hoặc kéo file vào trình duyệt.
4. Truy cập các trang khác (`theater.html`, `booking.html`,...) tương tự.

---

## 5. Tính năng chính
- **Trang chủ (`index.html`):** Hiển thị danh sách phim (gọi API `/movies`).
- **Chọn rạp (`theater.html`):** Hiển thị danh sách cụm rạp và lịch chiếu (gọi API `/theaters`).
- **Đặt vé (`booking.html`):** Chọn suất chiếu, ghế ngồi, và đặt vé (gọi API `/bookings`).
- **Tìm kiếm (`search.html`):** Tìm phim theo tên/thể loại (gọi API `/movies?search=...`).
- **Tài khoản (`profile.html`):** Đăng nhập, đăng ký, xem lịch sử đặt vé (gọi API `/users`).

---

## 6. Cách gọi API từ back-end
- Sử dụng `fetch` trong JavaScript để gọi API. Ví dụ, lấy danh sách phim:
  ```javascript
  fetch('http://localhost:3000/movies')
    .then(response => response.json())
    .then(data => {
      console.log(data); // Dữ liệu phim
      // Hiển thị lên giao diện
    })
    .catch(error => console.error('Lỗi:', error));

Các API chính:
/movies: Lấy danh sách phim.
/theaters: Lấy danh sách cụm rạp.
/bookings: Đặt vé (POST).

## 7. Hướng dẫn làm việc
Chế Quốc Đạt:
- Bắt đầu với index.html, tạo giao diện danh sách phim.
- Dùng main.js để gọi API và hiển thị dữ liệu.
- Thêm CSS trong style.css để làm đẹp giao diện.
- Lý Minh Hải (hỗ trợ): Giúp xử lý gọi API nếu gặp khó khăn.
- Tester (Phan Chí Quốc Bảo): Kiểm tra giao diện trên Chrome/Firefox, báo lỗi nếu có.

## 8. Lưu ý
Đảm bảo back-end chạy trước khi kiểm tra giao diện.
Nếu gặp lỗi gọi API, kiểm tra URL (http://localhost:3000) và xem console trình duyệt.
Tham khảo ../docs/usage.md để hiểu cấu trúc tổng thể.