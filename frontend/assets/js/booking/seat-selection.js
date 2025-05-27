axios.defaults.baseURL = 'http://127.0.0.1:3000';

//#region === Khu vực Biến Toàn Cục ===

let timer = 300; // 5 phút = 300 giây
let timeoutId = null;
let isTimerRunning = false;

// Biến lưu danh sách ghế và ghế đã chọn
let seats = [];
const selectedSeats = [];

// Biến lưu số lượng và giá vé
const ticketQuantities = {};
const ticketPrices = {};

// Biến lưu số lượng và giá bắp nước (khởi tạo động từ API)
const snackQuantities = {};
const snackPrices = {};

let bookingSummary = {};

//#endregion

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

// Hàm thu thập dữ liệu để gửi đến trang thanh toán
function collectBookingData() {
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData')) || {};

    // Thu thập thông tin phim và suất chiếu
    bookingSummary = {
        ma_lich_chieu: bookingData.showtimeId || '',
        ma_hinh_thuc: '',
        ma_tai_khoan: '',
        thoi_gian_dat: new Date().toISOString(),
        so_luong_ghe: selectedSeats.length,
        tong_tien: updateTotalPrice(),
        ct_loai_ve: ticketQuantities,
        ct_bap_nuoc: snackQuantities,
        trang_thai_ghe_suat_chieu: selectedSeats,
    };

    // Lưu vào sessionStorage để sử dụng ở trang thanh toán
    sessionStorage.setItem('bookingSummary', JSON.stringify(bookingSummary));
    console.log('Booking Summary:', bookingSummary);
}

function collectUserData(user) {
    const userData = {
        ten_dang_nhap: user.ten_dang_nhap || '',
        ma_tai_khoan: user.ma_tai_khoan || '',
    };

    // Lưu vào sessionStorage để sử dụng ở trang thanh toán
    sessionStorage.setItem('userData', JSON.stringify(userData));
    console.log('userData', sessionStorage.getItem('userData'));
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
    document.getElementById('duration').innerHTML = `<i class="fas fa-clock"></i> ${movieData.thoi_luong_phut || 'N/A'}'`;
    document.getElementById('country').innerHTML = `<i class="fas fa-globe"></i> ${scheduleData.ten_am_thanh}`;
    document.getElementById('language').innerHTML = `<i class="fas fa-language"></i> ${scheduleData.ten_am_thanh}`;
    const ageRating = movieData.gioi_han_tuoi || 'N/A';
    const ageNumber = ageRating && typeof ageRating === 'string' ? ageRating.replace('T', '') : 'N/A';
    document.getElementById('age-rating').innerHTML = `<i class="fas fa-user-alt"></i> ${ageRating}: Phim dành cho khán giả từ đủ ${ageNumber} tuổi trở lên (${ageRating}+)`;
    document.getElementById('music').innerHTML = `<strong>Âm thanh:</strong> ${scheduleData.ten_am_thanh}`;
    document.getElementById('release-date').innerHTML = `<strong>Khởi chiếu:</strong> ${movieData.ngay_phat_hanh ? formatDisplayDate(movieData.ngay_phat_hanh) : 'Không có thông tin'}`;
    document.getElementById('synopsis').textContent = movieData.noi_dung_phim || 'Không có mô tả';
    document.getElementById('trailer-link').href = movieData.trailer || 'Không có trailer';
}

// Hàm khởi tạo hiển thị chi tiết khi trang tải
async function initializeSeatSelection() {
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
    if (!bookingData) {
        alert("Vui lòng chọn thông tin đặt vé trước!");
        window.location.href = "/frontend/pages/booking/select-showtime.html";
        return;
    }
    console.table('bookingData: ', bookingData);
    try {
        updateBookingDetails(bookingData);
        const movieData = await fetchData(`/api/movies/${bookingData.movieId}`);
        if (!movieData) throw new Error("Không có dữ liệu phim");

        const scheduleData = await fetchData(`/api/schedules/${bookingData.showtimeId}`);
        if (!scheduleData) throw new Error("Không có dữ liệu lịch chiếu");

        updateMovieDetails(movieData, scheduleData);
        await renderTicketOptions();
        await renderSeats();
        await renderSnacks(); // Thêm render bắp nước
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

// Hàm cập nhật số lượng vé
function updateTicketQuantity(type, change) {
    const quantityElement = document.getElementById(`${type}-quantity`);
    let quantity = ticketQuantities[type] || 0;
    quantity += change;

    if (quantity < 0) quantity = 0;
    if (quantity > 10) quantity = 10;

    ticketQuantities[type] = quantity;
    quantityElement.textContent = quantity;

    updateTotalPrice();

    const minusButton = quantityElement.previousElementSibling;
    const plusButton = quantityElement.nextElementSibling;
    minusButton.disabled = quantity === 0;
    plusButton.disabled = quantity === 10;

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

// Hàm tạo HTML cho một mục bắp nước
function createSnackOption(snack) {
    const snackId = snack.ma_bap_nuoc;
    const price = parseFloat(snack.don_gia).toLocaleString('vi-VN');
    return `
        <div class="snack-option">
            <img src="${snack.image || '/frontend/assets/images/default-snack.png'}" alt="${snack.ten_bap_nuoc}">
            <div class="info">
                <p>${snack.ten_bap_nuoc}</p>
                <p class="price">${price} VNĐ</p>
                <div class="counter">
                    <button onclick="updateSnackQuantity('${snackId}', -1)">-</button>
                    <span id="${snackId}-quantity">${snackQuantities[snackId] || 0}</span>
                    <button onclick="updateSnackQuantity('${snackId}', 1)">+</button>
                </div>
            </div>
        </div>
    `;
}

// Hàm render danh sách bắp nước từ API
async function renderSnacks() {
    const snackOptionsContainer = document.getElementById('snack-options');
    try {
        const snacks = await fetchData('/api/popcorn-drink/');
        snackOptionsContainer.innerHTML = '';

        // Phân loại bắp nước theo ten_loai
        const groupedSnacks = {};
        snacks.forEach(snack => {
            if (snack.da_xoa !== 1) {
                const category = snack.ten_loai || 'Khác';
                if (!groupedSnacks[category]) {
                    groupedSnacks[category] = [];
                }
                groupedSnacks[category].push(snack);

                snackQuantities[snack.ma_bap_nuoc] = 0;
                snackPrices[snack.ma_bap_nuoc] = parseFloat(snack.don_gia);
            }
        });

        // Render từng nhóm
        for (const category in groupedSnacks) {
            snackOptionsContainer.innerHTML += `
                <div style="width: 100%; text-align: center; color: #ff6200; font-size: 18px; margin: 20px 0 10px;">
                    ${category}
                </div>
            `;
            groupedSnacks[category].forEach(snack => {
                const snackOption = createSnackOption(snack);
                snackOptionsContainer.innerHTML += snackOption;
            });
        }
    } catch (error) {
        console.error('Lỗi khi tải danh sách bắp nước:', error);
        showError(snackOptionsContainer, 'Không thể tải danh sách bắp nước.');
    }
}

// Hàm cập nhật số lượng bắp nước
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

// Hàm tính tổng tiền
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

// Hàm hiển thị/ẩn thanh tạm tính
function updateSummaryBarVisibility() {
    const summaryBar = document.getElementById('summary-bar');
    const summaryTheater = document.getElementById('summary-theater');
    const summaryShowtime = document.getElementById('summary-showtime');
    const summaryTime = document.getElementById('summary-time');
    const summaryTitle = document.querySelector('#summary-bar h4');

    const bookingData = JSON.parse(sessionStorage.getItem('bookingData')) || {};

    summaryTitle.textContent = `${bookingData.movieName?.toUpperCase() || 'Không có tiêu đề'})`;
    summaryTheater.textContent = bookingData.theaterName || 'Chưa chọn';
    summaryShowtime.textContent = bookingData.formattedShowtime || 'Chưa chọn';

    if (summaryTime && isTimerRunning) {
        const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
        const seconds = (timer % 60).toString().padStart(2, '0');
        summaryTime.textContent = `${minutes}:${seconds}`;
    } else if (summaryTime && !isTimerRunning) {
        summaryTime.textContent = '00:00';
    }

    if (bookingData.theaterName && bookingData.formattedShowtime) {
        summaryBar.style.display = 'flex';
    } else {
        summaryBar.style.display = 'none';
    }
}

// Hàm xử lý khi nhấn nút "Đặt Vé"
async function proceedToCheckout(event) {
    event.preventDefault();

    // Kiểm tra xem có ghế nào được chọn không
    if (selectedSeats.length === 0) {
        alert("Vui lòng chọn ít nhất một ghế trước khi đặt vé!");
        return;
    }

    // Kiểm tra số lượng vé và ghế
    const totalTickets = getTotalTickets();
    if (selectedSeats.length !== totalTickets) {
        alert("Số ghế đã chọn không khớp với số lượng vé! Vui lòng kiểm tra lại.");
        return;
    }

    // Thu thập dữ liệu
    collectBookingData();

    try {
        // Gọi API để kiểm tra trạng thái đăng nhập
        const response = await axios.get('/api/users/me', { withCredentials: true });

        // Kiểm tra trạng thái đăng nhập
        if (response.data.success === 'true') {
            collectUserData(response.data.data);
            window.location.href = "/frontend/pages/booking/checkout.html";
        } else {
            alert("Vui lòng đăng nhập để tiếp tục đặt vé!");
            return;
        }
    } catch (error) {
        console.error('Lỗi khi gọi API /api/users/me:', error);
        if (error.response) {
            if (error.response.status === 401) {
                alert("Vui lòng đăng nhập để tiếp tục đặt vé!");
            } else {
                alert("Đã xảy ra lỗi khi kiểm tra trạng thái đăng nhập. Vui lòng thử lại!");
            }
        } else {
            console.log('Lỗi không xác định, có thể do mạng hoặc server');
            alert("Không thể kết nối đến server. Vui lòng kiểm tra kết nối và thử lại!");
        }
    }
}

// Thêm sự kiện cho nút "Đặt Vé"
document.addEventListener('DOMContentLoaded', () => {
    const checkoutButton = document.querySelector('#summary-bar a');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', proceedToCheckout);
    }
});

//#endregion

//#region === Khu vực Quản lý Ghế ===

// Hàm render sơ đồ ghế
async function renderSeats() {
    const seatGrid = document.getElementById('seat-grid');
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData'));
    if (!bookingData || !bookingData.showtimeId) {
        showError(seatGrid, 'Không có thông tin lịch chiếu để tải sơ đồ ghế.');
        return;
    }

    try {
        const scheduleResponse = await fetchData(`/api/schedules/${bookingData.showtimeId}`);
        const scheduleData = scheduleResponse;
        if (!scheduleData || !scheduleData.ma_phong) throw new Error('Không có thông tin phòng chiếu.');
        const ma_phong = scheduleData.ma_phong;

        const roomSeatsResponse = await axios.get(`/api/seats/${ma_phong}`);
        const roomSeatsData = roomSeatsResponse.data;
        if (!roomSeatsData || !roomSeatsData.seats_per_row) {
            throw new Error('Không thể lấy cấu trúc ghế.');
        }

        const seatsPerRow = roomSeatsData.seats_per_row;
        seats = [];
        for (let i = 0; i < seatsPerRow.length; i++) {
            const rowLabel = String.fromCharCode(65 + i); // A, B, C, ...
            const seatCount = seatsPerRow[i]; // Số ghế mỗi hàng từ API
            for (let j = 1; j <= seatCount; j++) {
                const seatId = `${rowLabel}${j}`;
                seats.push({ id: seatId, status: 'available' });
            }
        }

        const bookedSeatsResponse = await fetchData(`/api/bookings/${bookingData.showtimeId}`);
        const bookedSeats = bookedSeatsResponse?.booked_seats || [];
        seats.forEach(seat => {
            if (bookedSeats.includes(seat.id)) {
                seat.status = 'sold';
            }
        });

        const previouslySelectedSeats = JSON.parse(sessionStorage.getItem('selectedSeats')) || [];
        seats.forEach(seat => {
            if (previouslySelectedSeats.includes(seat.id) && seat.status !== 'sold' && !selectedSeats.includes(seat.id)) {
                seat.status = 'selected';
                selectedSeats.push(seat.id);
            }
        });

        seatGrid.innerHTML = '';
        const rows = [...new Set(seats.map(seat => seat.id.charAt(0)))];
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
                seatElement.setAttribute('data-id', seat.id);
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

// Hàm đếm ngược thời gian
function startTimer() {
    if (isTimerRunning) clearInterval(timeoutId);
    isTimerRunning = true;
    timer = 300;

    timeoutId = setInterval(() => {
        timer--;
        const summaryTime = document.getElementById('summary-time');
        if (summaryTime) {
            const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
            const seconds = (timer % 60).toString().padStart(2, '0');
            summaryTime.textContent = `${minutes}:${seconds}`;
        }

        if (timer <= 0) {
            clearInterval(timeoutId);
            isTimerRunning = false;
            resetSelectedSeats();
        }
    }, 1000);
}

// Hàm reset các ghế đã chọn
function resetSelectedSeats() {
    selectedSeats.forEach(seatId => {
        const seat = seats.find(s => s.id === seatId);
        if (seat && seat.status === 'selected') {
            seat.status = 'available';
        }
    });
    selectedSeats.length = 0;
    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    updateSeatDisplay();
    updateSummaryBarVisibility();
}

// Hàm xử lý chọn ghế
function selectSeat(seatId) {
    const messageSelectedSeat = 'Việc chọn ghế của bạn không được để trống 1 ghế ở bên trái, giữa hoặc bên phải trên cùng một hàng ghế mà bạn vừa chọn!';
    const seat = seats.find(s => s.id === seatId);
    if (!seat) return;

    const totalTickets = getTotalTickets();
    const row = seatId.charAt(0);
    const seatNumber = parseInt(seatId.slice(1));

    if (seat.status === 'sold') {
        return;
    }

    if (seat.status === 'available') {
        if (selectedSeats.length >= totalTickets) {
            alert('Bạn đã chọn đủ số ghế theo số lượng vé!');
            return;
        }

        const rowSeats = seats.filter(s => s.id.charAt(0) === row);
        const seatIndex = rowSeats.findIndex(s => s.id === seatId);

        const selectedIndices = rowSeats
            .map((s, index) => (selectedSeats.includes(s.id) || s.id === seatId) ? index : -1)
            .filter(index => index !== -1);

        const soldIndices = rowSeats
            .map((s, index) => s.status === 'sold' ? index : -1)
            .filter(index => index !== -1);

        const allIndices = [...selectedIndices, ...soldIndices];
        if (allIndices.length > 0) {
            const minIndex = Math.min(...allIndices);
            const maxIndex = Math.max(...allIndices);

            let availableCount = 0;
            for (let i = minIndex; i <= maxIndex; i++) {
                if (rowSeats[i].status === 'available' && i !== seatIndex) {
                    availableCount++;
                }
            }

            if (availableCount === 1) {
                alert(messageSelectedSeat);
                return;
            }
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

    if (selectedSeats.length > 0 && !isTimerRunning) {
        startTimer();
    } else if (selectedSeats.length === 0) {
        clearInterval(timeoutId);
        isTimerRunning = false;
        const summaryTime = document.getElementById('summary-time');
        if (summaryTime) summaryTime.textContent = '00:00';
    }

    sessionStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
    console.log('selectedSeats: ', sessionStorage.getItem('selectedSeats'));
    updateSeatDisplay();
    updateSummaryBarVisibility();
}

// Hàm cập nhật giới hạn chọn ghế dựa trên số lượng vé
function updateSeatSelectionLimit() {
    const totalTickets = getTotalTickets();
    const seatGrid = document.getElementById('seat-grid');

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

// Hàm cập nhật giao diện ghế
function updateSeatDisplay() {
    const seatGrid = document.getElementById('seat-grid');
    seats.forEach(seat => {
        const seatElement = document.querySelector(`.seat[data-id="${seat.id}"]`);
        if (seatElement) {
            seatElement.className = `seat ${seat.status}`;
        }
    });
}

//#endregion

//#region === Khu vực Khởi Tạo ===

document.addEventListener('DOMContentLoaded', () => {
    sessionStorage.removeItem('selectedSeats');
    Object.keys(ticketQuantities).forEach(key => ticketQuantities[key] = 0);
    Object.keys(snackQuantities).forEach(key => snackQuantities[key] = 0);
    selectedSeats.length = 0;

    initializeSeatSelection();
});

//#endregion