axios.defaults.baseURL = 'http://127.0.0.1:3000';

//#region === Khu vực Hàm Chung ===

// Hàm hiển thị thông báo lỗi trong container
function showError(container, message) {
    container.innerHTML = `<p class='error'>${message}</p>`;
}

// Hàm chung để lấy và hiển thị danh sách vào dropdown
async function fetchAndRenderOptions(endpoint, selectId, valueKey = 'id', labelKey = 'name', nameOfOption) {
    const select = document.getElementById(selectId);
    if (!select) return;

    try {
        const response = await axios.get(endpoint);
        const data = response.data;
        console.table(data.data); // Kiểm tra dữ liệu từ API
        if (data.success !== true) throw new Error("Dữ liệu không hợp lệ");

        select.innerHTML = '<option value="">Chọn ' + nameOfOption + '</option>';

        if (data.data.length === 0) {
            select.innerHTML += "<option value=''>Không có dữ liệu</option>";
            return;
        }
        
        const fragment = document.createDocumentFragment();
        data.data.forEach(item => {
            const option = document.createElement('option');
            
            // Trường hợp đặc biệt cho booking-showtime: value là ma_lich_chieu, hiển thị time
            if (selectId === 'booking-showtime') {
                option.value = item.ma_lich_chieu || ''; // Đảm bảo không undefined
                const [hours, minutes] = (item.time || '00:00:00').split(':'); // Xử lý nếu time không tồn tại
                option.textContent = `${hours}:${minutes}`; // Hiển thị HH:mm
            } else {
                option.value = item[valueKey];
                if (labelKey === 'date') {
                    const date = new Date(item[labelKey]);
                    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
                    const dayName = days[date.getDay()];
                    const day = date.getDate().toString().padStart(2, '0');
                    const month = (date.getMonth() + 1).toString().padStart(2, '0');
                    option.textContent = `${dayName}, ${day}/${month}`;
                } else if (labelKey === 'time') {
                    const [hours, minutes] = (item[labelKey] || '00:00:00').split(':');
                    option.textContent = `${hours}:${minutes}`;
                } else {
                    option.textContent = item[labelKey];
                }
            }
            fragment.appendChild(option);
        });

        select.appendChild(fragment);
    } catch (error) {
        console.error(`Lỗi khi lấy ${selectId}:`, error);
        select.innerHTML = '<option value="">Chọn ' + nameOfOption + '</option>';

        if (error.response && error.response.status === 404) {
            select.innerHTML += "<option value=''>Không tìm thấy lịch chiếu</option>";
        } else {
            showError(select, error.message || "Đã có lỗi xảy ra");
        }
    }
}

//#endregion

//#region === Khu vực Hiển thị Danh sách Lựa chọn ===

// Tải danh sách rạp
async function loadTheaters() {
    await fetchAndRenderOptions('/api/theaters/', 'booking-theater', 'ma_rap', 'ten_rap', 'rạp');
}

// Tải danh sách phim dựa trên rạp đã chọn
function setupMovies() {
    const theaterSelect = document.getElementById('booking-theater');
    const movieSelect = document.getElementById('booking-movie');
    theaterSelect.addEventListener('change', async function () {
        const theaterId = this.value;
        if (theaterId) {
            // Bỏ disabled và tải danh sách phim
            movieSelect.disabled = false;
            await fetchAndRenderOptions(`/api/movies/`, 'booking-movie', 'ma_phim', 'ten_phim', 'phim');
        } else {
            // Nếu không chọn rạp, disable lại dropdown phim và xóa dữ liệu
            movieSelect.disabled = true;
            movieSelect.innerHTML = '<option value="">Chọn phim</option>';
        }
        // Reset các dropdown sau
        resetDropdown('booking-date', 'ngày');
        resetDropdown('booking-showtime', 'suất');
    });
}

// Tải danh sách ngày dựa trên phim đã chọn
function setupDates() {
    const movieSelect = document.getElementById('booking-movie');
    const dateSelect = document.getElementById('booking-date');
    const theaterSelect = document.getElementById('booking-theater');

    movieSelect.addEventListener('change', async function () {
        const movieId = this.value;
        const theaterId = theaterSelect.value;
        if (movieId && theaterId) {
            // Bỏ disabled và tải danh sách ngày
            dateSelect.disabled = false;
            await fetchAndRenderOptions(`/api/schedules/movie/${movieId}/dates?theaterId=${theaterId}`, 'booking-date', 'date', 'date', 'ngày');
        } else {
            // Nếu không chọn phim, disable lại dropdown ngày và xóa dữ liệu
            dateSelect.disabled = true;
            dateSelect.innerHTML = '<option value="">Chọn ngày</option>';
        }
        // Reset dropdown suất
        resetDropdown('booking-showtime', 'suất');
    });
}

// Tải danh sách suất dựa trên ngày đã chọn
function setupShowtimes() {
    const dateSelect = document.getElementById('booking-date');
    const showtimeSelect = document.getElementById('booking-showtime');
    const movieSelect = document.getElementById('booking-movie');
    const theaterSelect = document.getElementById('booking-theater'); // Thêm tham chiếu đến theaterSelect

    dateSelect.addEventListener('change', async function () {
        const date = this.value;
        const movieId = movieSelect.value;
        const theaterId = theaterSelect.value; // Lấy theaterId từ booking-theater

        if (date && movieId && theaterId) {
            // Bỏ disabled và tải danh sách suất
            showtimeSelect.disabled = false;
            await fetchAndRenderOptions(
                `/api/schedules/movie/${movieId}/${date}/showtimes?theaterId=${theaterId}`,
                'booking-showtime',
                'time',
                'time',
                'suất'
            );
        } else {
            // Nếu không chọn ngày, disable lại dropdown suất và xóa dữ liệu
            showtimeSelect.disabled = true;
            showtimeSelect.innerHTML = '<option value="">Chọn suất</option>';
        }
    });
}

// Hàm reset dropdown
function resetDropdown(selectId, nameOfOption) {
    const select = document.getElementById(selectId);
    if (select) {
        select.disabled = true;
        select.innerHTML = '<option value="">Chọn ' + nameOfOption + '</option>';
    }
}

//#endregion

//#region === Khu vực Nút Đặt Vé Nhanh ===

async function bookingNow() {
    const dateSelect = document.getElementById('booking-date');
    const showtimeSelect = document.getElementById('booking-showtime');
    const movieSelect = document.getElementById('booking-movie');
    const theaterSelect = document.getElementById('booking-theater');

    // Lấy giá trị từ các dropdown
    const theater = theaterSelect.value;
    const movie = movieSelect.value;
    const date = dateSelect.value;
    const showtimeId = showtimeSelect.value;

    // Kiểm tra xem tất cả các trường đã được chọn chưa
    if (!theater || !movie || !date || !showtimeId) {
        alert("Vui lòng chọn đầy đủ thông tin (rạp, phim, ngày, suất)!");
        return;
    }

    // Lấy tên rạp và tên phim để hiển thị
    const theaterName = theaterSelect.options[theaterSelect.selectedIndex].text;
    const movieName = movieSelect.options[movieSelect.selectedIndex].text;

    // Lấy thời gian hiển thị từ option được chọn
    const showtimeText = showtimeSelect.options[showtimeSelect.selectedIndex].text || '00:00';
    const [hours, minutes] = showtimeText.split(':');
    const formattedShowtime = `${hours}:${minutes.padEnd(2, '0')}`; // Đảm bảo định dạng HH:MM

    // Định dạng ngày hiển thị
    const dateObj = new Date(date);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[dateObj.getDay()];
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const formattedDate = `${dayName}, ${day}/${month}`;

    // Tạo đối tượng chứa dữ liệu
    const bookingData = {
        theaterId: theater,
        theaterName: theaterName,
        movieId: movie,
        movieName: movieName,
        date: date,
        formattedDate: formattedDate,
        showtimeId: showtimeId,
        showtime: showtimeText, // Thời gian hiển thị (HH:mm)
        formattedShowtime: formattedShowtime 
    };
    
    // Lưu dữ liệu vào sessionStorage
    sessionStorage.setItem('bookingData', JSON.stringify(bookingData));

    const bookinggData = JSON.parse(sessionStorage.getItem('bookingData'));
    console.table(bookinggData);

    // Chuyển hướng sang trang seat-selection.html
    window.location.href = "/frontend/pages/booking/seat-selection.html";
}

//#endregion




document.addEventListener('DOMContentLoaded', () => {
    // Tải danh sách rạp
    loadTheaters();

    // Thiết lập sự kiện cho các dropdown
    setupMovies();
    setupDates();
    setupShowtimes();

    // Gắn sự kiện cho nút Đặt Vé Ngay
    const bookNowBtn = document.querySelector('.book-now-btn');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', async (e) => {
            e.preventDefault(); // Ngăn form submit mặc định
            await bookingNow();
        });
    }
});