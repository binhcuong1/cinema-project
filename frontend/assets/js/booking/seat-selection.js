axios.defaults.baseURL = 'http://127.0.0.1:3000';

//#region === Khu vực Hàm Chung ===

// Hàm hiển thị thông báo lỗi trong container
function showError(container, message) {
    container.innerHTML = `<p class='error'>${message}</p>`;
    console.error(`Lỗi: ${message}`);
}

// Hàm định dạng ngày (ví dụ: "Thứ Sáu, 18/04/2025")
function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
}

// Hàm gọi API chung với xử lý lỗi
async function fetchData(endpoint, params = {}) {
    try {
        const response = await axios.get(endpoint, { params });
        if (!response.data.success) throw new Error(response.data.message || "Dữ liệu không hợp lệ");
        return response.data.data;
    } catch (error) {
        console.error(`Lỗi khi gọi ${endpoint}:`, error);
        throw error;
    }
}

//#endregion

//#region === Khu vực Hiển thị Chi Tiết ===

// Hàm cập nhật thông tin rạp, ngày, suất chiếu từ sessionStorage
function updateBookingDetails(bookingData) {
    const theaterDisplay = document.getElementById('theater-display');
    const dateDisplay = document.getElementById('date-display');
    const showtimeDisplay = document.getElementById('showtime-display');

    theaterDisplay.innerHTML = `<strong>Rạp:</strong> ${bookingData.theaterName}`;
    dateDisplay.innerHTML = `<strong>Ngày:</strong> ${bookingData.formattedDate}`;
    showtimeDisplay.innerHTML = `<strong>Suất chiếu:</strong> ${bookingData.formattedShowtime}`;
}

// Hàm cập nhật thông tin phim từ dữ liệu API
function updateMovieDetails(movieData, scheduleData) {
    document.getElementById('movie-title').textContent = `${movieData.ten_phim?.toUpperCase() || 'Không có tiêu đề'} (${movieData.gioi_han_tuoi || 'N/A'})`;
    document.getElementById('movie-poster').src = movieData.image || '/frontend/assets/images/default-poster.webp';
    document.getElementById('movie-poster').alt = `${movieData.ten_phim || 'Phim'} Poster`;
    document.getElementById('genre').innerHTML = `<i class="fas fa-ticket-alt"></i> ${'Không có thông tin'}`; // Thêm trường the_loai nếu API có
    document.getElementById('duration').innerHTML = `<i class="fas fa-clock"></i> ${movieData.thoi_luong_phut || 'N/A'}'`;
    document.getElementById('country').innerHTML = `<i class="fas fa-globe"></i> ${scheduleData.ten_am_thanh}`; // Thêm trường quoc_gia nếu API có
    document.getElementById('language').innerHTML = `<i class="fas fa-language"></i> ${scheduleData.ten_am_thanh}`; // Thêm trường ngon_ngu nếu API có
    // Kiểm tra gioi_han_tuoi trước khi sử dụng
    const ageRating = movieData.gioi_han_tuoi || 'N/A';
    const ageNumber = ageRating && typeof ageRating === 'string' ? ageRating.replace('T', '') : 'N/A';
    document.getElementById('age-rating').innerHTML = `<i class="fas fa-user-alt"></i> ${ageRating}: Phim dành cho khán giả từ đủ ${ageNumber} tuổi trở lên (${ageRating}+)`;
    document.getElementById('director').innerHTML = `<strong>Đạo diễn:</strong> ${'Không có thông tin'}`; // Thêm trường dao_dien nếu API có
    document.getElementById('actors').innerHTML = `<strong>Diễn viên:</strong> ${'Không có thông tin'}`; // Thêm trường dien_vien nếu API có
    document.getElementById('music').innerHTML = `<strong>Âm thanh:</strong> ${scheduleData.ten_am_thanh}`; // Thêm trường am_nhac nếu API có
    document.getElementById('release-date').innerHTML = `<strong>Khởi chiếu:</strong> ${movieData.ngay_phat_hanh ? formatDisplayDate(movieData.ngay_phat_hanh) : 'Không có thông tin'}`;
    document.getElementById('synopsis').textContent = movieData.noi_dung_phim || 'Không có mô tả';
    document.getElementById('trailer-link').href = '#' || '#'; // Thêm trường trailer nếu API có
}

// Hàm khởi tạo hiển thị chi tiết khi trang tải
async function initializeSeatSelection() {
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
    if (!bookingData) {
        alert("Vui lòng chọn thông tin đặt vé trước!");
        window.location.href = "/frontend/pages/booking.html";
        return;
    }
    console.table(bookingData); // Để debug
    try {
        // Cập nhật thông tin rạp, ngày, suất chiếu
        updateBookingDetails(bookingData);

        // Gọi API để lấy thông tin phim
        const movieData = await fetchData(`/api/movies/${bookingData.movieId}`);
        if (!movieData) {
            throw new Error("Không có dữ liệu phim");
        }
        
        const scheduleData = await fetchData(`/api/schedules/${bookingData.showtimeId}`);
        if (!scheduleData) {
            throw new Error("Không có dữ liệu lịch chiếu");
        }

        // Cập nhật thông tin phim
        updateMovieDetails(movieData, scheduleData);
    } catch (error) {
        console.error("Lỗi khi khởi tạo:", error);
        showError(document.getElementById('booking-details'), error.message || "Đã xảy ra lỗi khi tải thông tin phim.");
    }
}

//#endregion

document.addEventListener('DOMContentLoaded', () => {
    initializeSeatSelection();
});