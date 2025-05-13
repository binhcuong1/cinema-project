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
    document.getElementById('genre').innerHTML = `<i class="fas fa-ticket-alt"></i> ${'Không có thông tin'}`;
    document.getElementById('duration').innerHTML = `<i class="fas fa-clock"></i> ${movieData.thoi_luong_phut || 'N/A'}'`;
    document.getElementById('country').innerHTML = `<i class="fas fa-globe"></i> ${scheduleData.ten_am_thanh}`;
    document.getElementById('language').innerHTML = `<i class="fas fa-language"></i> ${scheduleData.ten_am_thanh}`;
    const ageRating = movieData.gioi_han_tuoi || 'N/A';
    const ageNumber = ageRating && typeof ageRating === 'string' ? ageRating.replace('T', '') : 'N/A';
    document.getElementById('age-rating').innerHTML = `<i class="fas fa-user-alt"></i> ${ageRating}: Phim dành cho khán giả từ đủ ${ageNumber} tuổi trở lên (${ageRating}+)`;
    document.getElementById('director').innerHTML = `<strong>Đạo diễn:</strong> ${'Không có thông tin'}`;
    document.getElementById('actors').innerHTML = `<strong>Diễn viên:</strong> ${'Không có thông tin'}`;
    document.getElementById('music').innerHTML = `<strong>Âm thanh:</strong> ${scheduleData.ten_am_thanh}`;
    document.getElementById('release-date').innerHTML = `<strong>Khởi chiếu:</strong> ${movieData.ngay_phat_hanh ? formatDisplayDate(movieData.ngay_phat_hanh) : 'Không có thông tin'}`;
    document.getElementById('synopsis').textContent = movieData.noi_dung_phim || 'Không có mô tả';
    document.getElementById('trailer-link').href = '#' || '#';
}

// Hàm khởi tạo hiển thị chi tiết khi trang tải
async function initializeSeatSelection() {
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
    if (!bookingData) {
        alert("Vui lòng chọn thông tin đặt vé trước!");
        window.location.href = "/frontend/pages/booking.html";
        return;
    }
    console.table(bookingData);
    try {
        // Cập nhật thông tin rạp, ngày, suất chiếu
        updateBookingDetails(bookingData);

        // Gọi API để lấy thông tin phim
        const movieData = await fetchData(`/api/movies/${bookingData.movieId}`);
        if (!movieData) throw new Error("Không có dữ liệu phim");

        const scheduleData = await fetchData(`/api/schedules/${bookingData.showtimeId}`);
        if (!scheduleData) throw new Error("Không có dữ liệu lịch chiếu");

        // Cập nhật thông tin phim
        updateMovieDetails(movieData, scheduleData);

        // Render danh sách loại vé
        await renderTicketOptions();

        // Render sơ đồ ghế
        await renderSeats();
    } catch (error) {
        console.error("Lỗi khi khởi tạo:", error);
        showError(document.getElementById('booking-details'), error.message || "Đã xảy ra lỗi khi tải thông tin phim.");
    }
}

//#endregion

//#region === Khu vực Render Loại Vé ===

// Hàm tạo thẻ HTML cho một loại vé
function createTicketOption(ticketType) {
    const quantityId = `${ticketType.ma_loai}-quantity`;
    const price = parseFloat(ticketType.don_gia).toLocaleString('vi-VN');
    return `
        <div class="ticket-option">
            <p>${ticketType.ten_loai}</p>
            <p>Đơn</p>
            <p class="price">${price} VNĐ</p>
            <div class="counter">
                <button onclick="updateTicketQuantity('${ticketType.ma_loai}', -1)">-</button>
                <span id="${quantityId}">${ticketQuantities[ticketType.ma_loai] || 0}</span>
                <button onclick="updateTicketQuantity('${ticketType.ma_loai}', 1)">+</button>
            </div>
        </div>
    `;
}

// Hàm render danh sách loại vé từ API
async function renderTicketOptions() {
    const ticketOptionsContainer = document.querySelector('.ticket-options');
    try {
        const ticketTypes = await fetchData('/api/ticket-types/');
        ticketOptionsContainer.innerHTML = '';

        ticketTypes.forEach(ticketType => {
            if (ticketType.da_xoa !== 1) {
                const ticketOption = createTicketOption(ticketType);
                ticketOptionsContainer.innerHTML += ticketOption;

                // Khởi tạo hoặc cập nhật ticketQuantities và ticketPrices
                if (!ticketQuantities[ticketType.ma_loai]) {
                    ticketQuantities[ticketType.ma_loai] = 0;
                }
                if (!ticketPrices[ticketType.ma_loai]) {
                    ticketPrices[ticketType.ma_loai] = parseFloat(ticketType.don_gia);
                }
            }
        });
    } catch (error) {
        console.error('Lỗi khi tải danh sách loại vé:', error);
        showError(ticketOptionsContainer, 'Không thể tải danh sách loại vé.');
    }
}

//#endregion

//#region === Khu vực Quản lý Vé ===

// Biến lưu số lượng và giá vé (sẽ được cập nhật từ API)
const ticketQuantities = {};
const ticketPrices = {};

// Hàm cập nhật số lượng vé
function updateTicketQuantity(type, change) {
    const quantityElement = document.getElementById(`${type}-quantity`);
    let quantity = ticketQuantities[type] || 0;
    quantity += change;

    // Giới hạn số lượng từ 0 đến 10
    if (quantity < 0) quantity = 0;
    if (quantity > 10) quantity = 10;

    ticketQuantities[type] = quantity;
    quantityElement.textContent = quantity;

    // Cập nhật tổng tiền
    updateTotalPrice();

    // Cập nhật trạng thái nút - và +
    const minusButton = quantityElement.previousElementSibling;
    const plusButton = quantityElement.nextElementSibling;
    minusButton.disabled = quantity === 0;
    plusButton.disabled = quantity === 10;

    // Cập nhật hiển thị thanh tạm tính
    updateSummaryBarVisibility();
}

// Hàm tính tổng số lượng vé
function getTotalTickets() {
    let totalTickets = 0;
    for (const type in ticketQuantities) {
        totalTickets += ticketQuantities[type];
    }
    return totalTickets;
}

//#endregion

//#region === Khu vực Quản lý Bắp Nước ===

const snackQuantities = {
    'combo-gau': 0,
    'combo-co-gau': 0,
    'combo-nhi-gau': 0,
    'sprite-32oz': 0,
    'coke-zero-32oz': 0,
    'coke-32oz': 0,
    'fanta-32oz': 0,
    'nuoc-cam-teppy': 0,
    'nuoc-suoi-dasani': 0,
    'nuoc-trai-cay-nutriboost': 0,
    'snack-thai': 0,
    'poca-wavy-54gr': 0,
    'khoai-tay-lays-stax-100g': 0,
    'snack-partyz-30-33gr': 0,
    'poca-khoai-tay-54gr': 0
};

const snackPrices = {
    'combo-gau': 119000,
    'combo-co-gau': 129000,
    'combo-nhi-gau': 259000,
    'sprite-32oz': 37000,
    'coke-zero-32oz': 37000,
    'coke-32oz': 37000,
    'fanta-32oz': 37000,
    'nuoc-cam-teppy': 28000,
    'nuoc-suoi-dasani': 20000,
    'nuoc-trai-cay-nutriboost': 28000,
    'snack-thai': 25000,
    'poca-wavy-54gr': 28000,
    'khoai-tay-lays-stax-100g': 59000,
    'snack-partyz-30-33gr': 20000,
    'poca-khoai-tay-54gr': 28000
};

function updateSnackQuantity(type, change) {
    const quantityElement = document.getElementById(`${type}-quantity`);
    let quantity = snackQuantities[type];
    quantity += change;

    if (quantity < 0) quantity = 0;
    if (quantity > 10) quantity = 10;

    snackQuantities[type] = quantity;
    quantityElement.textContent = quantity;

    updateTotalPrice();

    const minusButton = quantityElement.previousElementSibling;
    const plusButton = quantityElement.nextElementSibling;
    minusButton.disabled = quantity === 0;
    plusButton.disabled = quantity === 10;

    updateSummaryBarVisibility();
}

//#endregion

//#region === Khu vực Tính Tổng Tiền và Thanh Tạm Tính ===

function updateTotalPrice() {
    let totalTickets = 0;
    for (const type in ticketQuantities) {
        totalTickets += (ticketQuantities[type] || 0) * (ticketPrices[type] || 0);
    }

    let totalSnacks = 0;
    for (const type in snackQuantities) {
        totalSnacks += snackQuantities[type] * snackPrices[type];
    }

    const total = totalTickets + totalSnacks;
    document.getElementById('summary-total').textContent = `${total.toLocaleString('vi-VN')} VNĐ`;
    return total;
}

function updateSummaryBarVisibility() {
    const theater = document.getElementById('theater-display').textContent.split(': ')[1];
    const showtime = document.getElementById('showtime-display').textContent.split(': ')[1];
    const summaryBar = document.getElementById('summary-bar');

    if (theater !== 'Chưa chọn' && showtime !== 'Chưa chọn') {
        summaryBar.style.display = 'flex';
    } else {
        summaryBar.style.display = 'none';
    }
}

//#endregion

//#region === Khu vực Quản lý Ghế ===

// Biến lưu danh sách ghế và ghế đã chọn
let seats = [];
const selectedSeats = [];

// Hàm render sơ đồ ghế
async function renderSeats() {
    const seatGrid = document.getElementById('seat-grid');
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
    if (!bookingData || !bookingData.showtimeId) {
        showError(seatGrid, 'Không có thông tin lịch chiếu để tải sơ đồ ghế.');
        return;
    }

    try {
        // Lấy thông tin lịch chiếu để biết phòng chiếu
        const scheduleResponse = await fetchData(`/api/schedules/${bookingData.showtimeId}`);
        const scheduleData = scheduleResponse;
        if (!scheduleData || !scheduleData.ma_phong) 
            throw new Error('Không có thông tin phòng chiếu.');
        const ma_phong = scheduleData.ma_phong;

        // Lấy cấu trúc ghế từ API
        const roomSeatsResponse = await axios.get(`/api/seats/${ma_phong}`);
        const roomSeatsData = roomSeatsResponse.data;
        if (!roomSeatsData || !roomSeatsData.seats_per_row) {
            throw new Error('Không thể lấy cấu trúc ghế.');
        }
        
        const seatsPerRow = roomSeatsData.seats_per_row;
        
        // Tạo danh sách ghế từ seats_per_row
        seats = [];
        for (let i = 0; i < seatsPerRow.length; i++) {
            const rowLabel = String.fromCharCode(65 + i);
            const seatCount = seatsPerRow[i];
            for (let j = 1; j <= seatCount; j++) {
                const seatId = `${rowLabel}${j}`;
                seats.push({ id: seatId, status: 'available' });
            }
        }
        
        // Lấy danh sách ghế đã đặt từ API
        const bookedSeatsResponse = await fetchData(`/api/bookings/${bookingData.showtimeId}`);
        const bookedSeats = bookedSeatsResponse?.booked_seats || [];
        console.table(bookedSeats);
        // Cập nhật trạng thái ghế đã đặt
        seats.forEach(seat => {
            if (bookedSeats.includes(seat.id)) {
                seat.status = 'sold';
            }
        });
        
        // Khôi phục trạng thái ghế đã chọn từ sessionStorage
        const previouslySelectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats')) || [];
        seats.forEach(seat => {
            if (previouslySelectedSeats.includes(seat.id) && seat.status !== 'sold') {
                seat.status = 'selected';
                selectedSeats.push(seat.id);
            }
        });

        // Render ghế
        seatGrid.innerHTML = '';
        const rows = [...new Set(seats.map(seat => seat.id.charAt(0)))]; // Lấy danh sách hàng duy nhất
        rows.forEach(row => {
            const rowSeats = seats.filter(seat => seat.id.startsWith(row));
            const rowElement = document.createElement('div');
            rowElement.classList.add('seat-row');
            const labelElement = document.createElement('div');
            labelElement.classList.add('row-label');
            labelElement.textContent = row;
            rowElement.appendChild(labelElement);
            rowSeats.forEach(seat => {
                const seatElement = document.createElement('div');
                seatElement.classList.add('seat', seat.status);
                seatElement.textContent = seat.id;
                seatElement.addEventListener('click', () => selectSeat(seat.id));
                rowElement.appendChild(seatElement);
            });
            seatGrid.appendChild(rowElement);
        });

    } catch (error) {
        console.error('Lỗi khi tải sơ đồ ghế:', error);
        showError(seatGrid, 'Không thể tải sơ đồ ghế.');
    }
}

// Hàm xử lý chọn ghế
function selectSeat(seatId) {
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    const totalTickets = getTotalTickets();

    if (seat.status === 'sold') {
        return; // Không cho phép chọn ghế đã bán
    }

    if (seat.status === 'available') {
        // Kiểm tra giới hạn số ghế được chọn
        if (selectedSeats.length >= totalTickets) {
            alert('Bạn đã chọn đủ số ghế theo số lượng vé!');
            return;
        }
        seat.status = 'selected';
        selectedSeats.push(seatId);
    } else if (seat.status === 'selected') {
        seat.status = 'available';
        const index = selectedSeats.indexOf(seatId);
        if (index > -1) {
            selectedSeats.splice(index, 1);
        }
    }

    // Lưu danh sách ghế đã chọn vào sessionStorage
    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));

    // Cập nhật giao diện
    renderSeats();
    updateSummaryBarVisibility();
}

// Hàm cập nhật giới hạn chọn ghế dựa trên số lượng vé
function updateSeatSelectionLimit() {
    const totalTickets = getTotalTickets();
    const seatGrid = document.getElementById('seat-grid');

    // Nếu số lượng vé thay đổi, kiểm tra số ghế đã chọn
    if (selectedSeats.length > totalTickets) {
        while (selectedSeats.length > totalTickets) {
            const seatId = selectedSeats.pop();
            const seat = seats.find(s => s.id === seatId);
            if (seat) {
                seat.status = 'available';
            }
        }
        sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
        renderSeats();
    }
}

//#endregion

document.addEventListener('DOMContentLoaded', () => {
    initializeSeatSelection();
    // Khởi tạo các hàm khác nếu cần (ví dụ: renderSeats)
});