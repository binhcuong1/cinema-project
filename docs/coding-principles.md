# Nguyên tắc viết code: Web Rạp Chiếu Phim

## 1. KISS (Keep It Simple, Stupid)
- **Ý nghĩa:** Giữ code đơn giản, tránh phức tạp hóa.
- **Áp dụng:** Viết hàm ngắn, làm một việc duy nhất.
  ```javascript
  // đúng
  function getMovies() { ... }
  function bookTicket() { ... }
  // Sai
  function getMoviesAndBookTicket() { ... }

## 2. Readable Code (Code dễ đọc)
- **Ý nghĩa:** Code phải dễ hiểu

  // Đúng
  const movieList = [];
  // Sai
  const ml = [];

  // Thêm comment

  // Lấy danh sách phim từ database
  async function getMovies() { ... }

## 3. Error Handling
- **Ý nghĩa:** Xử lý lỗi để tránh crash

// Front-end: Xử lý lỗi API:

fetch('http://localhost:3000/movies')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => alert('Lỗi kết nối API'));

## 4. Commit message cụ thể

// git commit -m "Add movie list API"

## 5. No Dead Code (Không để code dư)
- **Ý nghĩa:** Xóa console.log hoặc code không dùng trước khi commit

## 6. File Structure (Cấu trúc file)
- **Ý nghĩa:** Tôn trọng cấu trúc: controllers/, routes/, models/ (back-end); pages/, assets/ (front-end)


---

### **Lưu ý**
- Không viết các dòng code quá dài, dài quá hãy xuống dòng.