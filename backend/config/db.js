const mysql = require('mysql2');
require('dotenv').config(); // // Lấy mấy thông tin từ file .env

// Tạo một đường dây liên lạc tới cơ sở dữ liệu
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  timezone: '+07:00'
});

// Kiểm tra kết nối được không?
connection.connect(err => {
  if (err) {
    console.error("Lỗi kết nối database!", err.message);
    process.exit(1); // Thoát chương trình nếu kết nối thất bại
  }
  console.log('Đã kết nối tới MySQL');
});

module.exports = connection;