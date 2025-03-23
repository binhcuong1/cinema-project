## Hướng dẫn sử dụng dự án: Web Rạp Chiếu Phim

### 1. Tổng quan
File này hướng dẫn cách sử dụng các thành phần trong dự án "Web Rạp Chiếu Phim". Đọc rõ để hiểu mục đích và cách làm việc.

### 2. Cấu trúc thư mục tổng thể

    cinema-project/
    │
    ├── backend/                # Thư mục cho phần back-end (Node.js)
    ├── frontend/               # Thư mục cho phần front-end (HTML/CSS/JS hoặc React)
    ├── docs/                   # Tài liệu dự án (phân tích, bảng mô tả, hướng dẫn)
    ├── tests/                  # Thư mục cho kiểm thử (tester)
    └── README.md               # File mô tả dự án 

### 3. Cấu trúc chi tiết cho Back-end (Node.js)

        backend/
    │
    ├── config/                 # Cấu hình (database, môi trường)
    │   └── db.js               # Cấu hình kết nối database (MySQL)
    │
    ├── controllers/            # Xử lý logic (controller) cho API
    │   ├── movieController.js  # Quản lý phim (danh sách phim, chi tiết phim)
    │   ├── theaterController.js # Quản lý cụm rạp (danh sách rạp, lịch chiếu)
    │   ├── bookingController.js # Quản lý đặt vé (chọn ghế, đặt vé)
    │   └── userController.js   # Quản lý tài khoản người dùng
    │
    ├── models/                 # Định nghĩa schema/model cho database
    │   ├── Movie.js            # Schema phim (tên, thể loại, thời lượng)
    │   ├── Theater.js          # Schema cụm rạp (tên, địa chỉ, phòng chiếu)
    │   ├── Showtime.js         # Schema suất chiếu (rạp, phim, thời gian, ghế)
    │   └── User.js             # Schema người dùng (email, mật khẩu, lịch sử vé)
    │
    ├── routes/                 # Định nghĩa các route API
    │   ├── movieRoutes.js      # Route cho phim (GET /movies, GET /movies/:id)
    │   ├── theaterRoutes.js    # Route cho cụm rạp (GET /theaters, GET /showtimes)
    │   ├── bookingRoutes.js    # Route cho đặt vé (POST /bookings)
    │   └── userRoutes.js       # Route cho người dùng (POST /login, POST /register)
    │
    ├── middleware/             # Middleware (xác thực, xử lý lỗi)
    │   ├── auth.js             # Xác thực người dùng (nếu cần đăng nhập để đặt vé)
    │   └── errorHandler.js     # Xử lý lỗi API
    │
    ├── package.json            # File quản lý dependencies (Express, mongoose,...)
    ├── server.js               # File chính để chạy server (khởi động Express)
    └── .env                    # File lưu biến môi trường (DB URI, port)

### 4. Cấu trúc chi tiết cho Front-end (HTML/CSS/JS)
Phần front-end sẽ hiển thị giao diện người dùng, gọi API từ back-end để lấy dữ liệu (phim, rạp, suất chiếu).

    frontend/
    │
    ├── assets/                 # Tài nguyên tĩnh (hình ảnh, CSS, JS)
    │   ├── css/                # File CSS
    │   │   └── style.css       # CSS chính
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
    └── README.md               # Hướng dẫn chạy front-end

### 5. Cấu trúc thư mục Docs

    docs/
    │
    ├── analysis/               # Phân tích đề tài
    │   └── project_analysis.md # File phân tích (yêu cầu, mục tiêu)
    ├── designs/                # Thiết kế
    │   └── db_schema.md        # Sơ đồ cơ sở dữ liệu
    └── usage.md                # Mô tả kiến trúc dự án

### 6. Cấu trúc thư mục Tests

    tests/
    │
    ├── api/                    # Kiểm thử API
    │   └── test_api.md         # Hướng dẫn test API bằng Postman
    └── ui/                     # Kiểm thử giao diện
        └── test_ui.md          # Hướng dẫn test giao diện (trình duyệt)