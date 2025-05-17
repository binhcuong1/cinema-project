// quick-booking.js
axios.defaults.baseURL = 'http://127.0.0.1:3000';

// Biến lưu trữ lựa chọn của người dùng
let bookingData = {
    theaterId: '',
    theaterName: '',
    movieId: '',
    movieName: '',
    date: '',
    formattedDate: '',
    showtimeId: '',
    showtime: '',
    formattedShowtime: ''
};

// Hàm hiển thị thông báo lỗi
function showError(container, message) {
    container.innerHTML = `<p class='error'>${message}</p>`;
}

// Hàm chung để lấy và hiển thị danh sách vào dropdown
async function fetchAndRenderOptions(endpoint, dropdownId, valueKey = 'id', labelKey = 'name', nameOfOption) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    try {
        const response = await axios.get(endpoint);
        const data = response.data;
        if (data.success !== true) throw new Error("Dữ liệu không hợp lệ");

        dropdown.innerHTML = '';

        if (data.data.length === 0) {
            dropdown.innerHTML = `<div>Không có dữ liệu</div>`;
            return;
        }

        const fragment = document.createDocumentFragment();
        data.data.forEach(item => {
            console.log('item: ', item); // Log từng item để kiểm tra
            const div = document.createElement('div');
            div.setAttribute('data-value', item[valueKey] || ''); // Đảm bảo data-value luôn có giá trị

            if (labelKey === 'date') {
                const date = new Date(item[labelKey]);
                const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
                const dayName = days[date.getDay()];
                const day = date.getDate().toString().padStart(2, '0');
                const month = (date.getMonth() + 1).toString().padStart(2, '0');
                div.textContent = `${dayName}, ${day}/${month}`;
            } else if (labelKey === 'time') {
                const [hours, minutes] = (item[labelKey] || '00:00:00').split(':');
                div.textContent = `${hours}:${minutes}`;
            } else {
                div.textContent = item[labelKey] || 'Không có tên'; // Đảm bảo textContent luôn có giá trị
            }

            console.log('div created: ', div.textContent, 'data-value: ', div.getAttribute('data-value')); // Log để kiểm tra div
            div.addEventListener('click', async () => {
                const stepElement = div.closest('.booking-step');
                const stepBtn = stepElement.querySelector('.step-btn');
                if (stepBtn) {
                    const stepLabel = stepBtn.querySelector('.step-label');
                    if (stepLabel) {
                        stepLabel.textContent = div.textContent;
                    }
                    stepBtn.setAttribute('data-value', item[valueKey]);
                    const dropdown = document.getElementById(dropdownId);
                    if (dropdown) {
                        dropdown.classList.remove('active');
                    }
                    stepBtn.classList.remove('active');
                    const chevron = stepBtn.querySelector('.fas.fa-chevron-down');
                    if (chevron) {
                        chevron.classList.remove('active');
                    }

                    if (dropdownId === 'theater-dropdown') {
                        bookingData.theaterId = item[valueKey];
                        bookingData.theaterName = item[labelKey];
                        await fetchAndRenderOptions(`/api/movies/`, 'movie-dropdown', 'ma_phim', 'ten_phim', 'phim');
                    } else if (dropdownId === 'movie-dropdown') {
                        bookingData.movieId = item[valueKey];
                        bookingData.movieName = item[labelKey];
                        const theaterId = document.getElementById('select-theater')?.getAttribute('data-value');
                        if (theaterId) {
                            await fetchAndRenderOptions(`/api/schedules/movie/${item[valueKey]}/dates?theaterId=${theaterId}`, 'date-dropdown', 'date', 'date', 'ngày');
                        }
                    } else if (dropdownId === 'date-dropdown') {
                        bookingData.date = item[valueKey];
                        bookingData.formattedDate = div.textContent;
                        const movieId = document.getElementById('select-movie')?.getAttribute('data-value');
                        const theaterId = document.getElementById('select-theater')?.getAttribute('data-value');
                        if (movieId && theaterId) {
                            await fetchAndRenderOptions(
                                `/api/schedules/movie/${movieId}/${item[valueKey]}/showtimes?theaterId=${theaterId}`,
                                'showtime-dropdown',
                                'ma_lich_chieu',
                                'time',
                                'suất'
                            );
                        }
                    } else if (dropdownId === 'showtime-dropdown') {
                        bookingData.showtimeId = item[valueKey];
                        bookingData.showtime = div.textContent;
                        bookingData.formattedShowtime = div.textContent;
                    }

                    enableNextSteps(dropdownId);
                }
            });

            fragment.appendChild(div);
        });

        dropdown.appendChild(fragment);
        console.log('Number of items added: ', fragment.childNodes.length); // Log số lượng item được thêm
    } catch (error) {
        console.error(`Lỗi khi lấy ${dropdownId}:`, error);
        dropdown.innerHTML = `<div>Không có dữ liệu</div>`;
    }
}

// Kích hoạt các bước tiếp theo dựa trên lựa chọn hiện tại
function enableNextSteps(dropdownId) {
    const movieBtn = document.getElementById('select-movie');
    const dateBtn = document.getElementById('select-date');
    const showtimeBtn = document.getElementById('select-showtime');
    const bookNowBtn = document.getElementById('book-now');

    if (dropdownId === 'theater-dropdown' && movieBtn) {
        movieBtn.disabled = false;
    } else if (dropdownId === 'movie-dropdown' && dateBtn) {
        dateBtn.disabled = false;
    } else if (dropdownId === 'date-dropdown' && showtimeBtn) {
        showtimeBtn.disabled = false;
    } else if (dropdownId === 'showtime-dropdown' && bookNowBtn) {
        bookNowBtn.disabled = false;
    }
}

// Tải danh sách rạp
async function loadTheaters() {
    await fetchAndRenderOptions('/api/theaters/', 'theater-dropdown', 'ma_rap', 'ten_rap', 'rạp');
}

// Tải danh sách phim dựa trên rạp đã chọn
function setupMovies() {
    // Logic đã được tích hợp vào fetchAndRenderOptions khi chọn rạp
}

// Tải danh sách ngày dựa trên phim đã chọn
function setupDates() {
    // Logic đã được tích hợp vào fetchAndRenderOptions khi chọn phim
}

// Tải danh sách suất dựa trên ngày đã chọn
function setupShowtimes() {
    // Logic đã được tích hợp vào fetchAndRenderOptions khi chọn ngày
}

// Xử lý sự kiện mở/đóng dropdown
function setupDropdowns() {
    const steps = document.querySelectorAll('.booking-step');
    steps.forEach(step => {
        const btn = step.querySelector('.step-btn');
        const dropdown = step.querySelector('.step-dropdown');
        if (btn && dropdown) {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (btn.disabled) return;
                const isActive = dropdown.classList.contains('active');
                document.querySelectorAll('.step-dropdown').forEach(d => d.classList.remove('active'));
                document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('active'));
                if (!isActive) {
                    dropdown.classList.add('active');
                    btn.classList.add('active');
                }
            });
        }
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.step-dropdown').forEach(d => d.classList.remove('active'));
        document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('active'));
    });
}

// Xử lý nút "Đặt Ngay"
function setupBooking() {
    const bookNowBtn = document.getElementById('book-now');
    if (bookNowBtn) {
        bookNowBtn.addEventListener('click', () => {
            if (!bookingData.theaterId || !bookingData.movieId || !bookingData.date || !bookingData.showtimeId) {
                alert("Vui lòng chọn đầy đủ thông tin (rạp, phim, ngày, suất)!");
                return;
            }

            sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
            console.table(bookingData);
            window.location.href = "/frontend/pages/booking/seat-selection.html";
        });
    }
}

// Khởi tạo trang
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'index') {
        loadTheaters();
        setupMovies();
        setupDates();
        setupShowtimes();
        setupDropdowns();
        setupBooking();
    }
});