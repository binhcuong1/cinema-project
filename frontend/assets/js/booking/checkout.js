axios.defaults.baseURL = 'http://127.0.0.1:3000';

//#region === Khu vực Biến Toàn Cục ===

let timer = 300; // 5 phút = 300 giây
let timeoutId = null;
let isTimerRunning = false;

// Biến lưu thông tin đặt vé
let bookingSummary = {};

// Ánh xạ mã-tên cho loại vé và bắp nước
let ticketTypeMapping = {};
let snackMapping = {};

//#endregion

//#region === Khu vực Hàm Chung ===

// Hàm định dạng ngày (ví dụ: "Thứ Năm, 15/05/2025")
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

// Hàm lấy danh sách loại vé và tạo ánh xạ mã-tên
async function loadTicketTypes() {
    try {
        const ticketTypes = await fetchData('/api/ticket-types/');
        ticketTypeMapping = ticketTypes.reduce((map, ticket) => {
            if (ticket.da_xoa !== 1) {
                map[ticket.ma_loai] = ticket.ten_loai;
            }
            return map;
        }, {});
    } catch (error) {
        console.error('Lỗi khi tải danh sách loại vé:', error);
        throw error;
    }
}

// Hàm lấy danh sách bắp nước và tạo ánh xạ mã-tên
async function loadSnacks() {
    try {
        const snacks = await fetchData('/api/popcorn-drink/');
        snackMapping = snacks.reduce((map, snack) => {
            if (snack.da_xoa !== 1) {
                map[snack.ma_bap_nuoc] = snack.ten_bap_nuoc;
            }
            return map;
        }, {});
    } catch (error) {
        console.error('Lỗi khi tải danh sách bắp nước:', error);
        throw error;
    }
}

// Hàm kiểm tra dữ liệu đặt vé từ sessionStorage
function checkBookingData() {
    bookingSummary = JSON.parse(sessionStorage.getItem('bookingSummary')) || {};

    // Xử lý khi không có dữ liệu
    if (!bookingSummary || !Object.keys(bookingSummary).length) {
        alert('Không có thông tin đặt vé. Vui lòng thử lại!');
        window.location.href = '/frontend/pages/booking/seat-selection.html';
    }
}

// Hàm xử lý lựa chọn thanh toán
function handlePaymentSelection(nextPage) {
    const momoBtn = document.getElementById('momo-payment');
    const onsiteBtn = document.getElementById('onsite-payment');

    if (momoBtn) {
        momoBtn.addEventListener('click', () => {
            console.log('Chọn thanh toán qua MoMo');
            sessionStorage.setItem('paymentInfo', JSON.stringify({ paymentMethod: 'momo' }));
            console.log('Redirecting to:', nextPage);
            window.location.href = nextPage;
        });
    }

    if (onsiteBtn) {
        onsiteBtn.addEventListener('click', () => {
            console.log('Chọn thanh toán tại rạp');
            sessionStorage.setItem('paymentInfo', JSON.stringify({ paymentMethod: 'onsite' }));
            console.log('Redirecting to:', nextPage);
            window.location.href = nextPage;
        });
    }
}

// Hàm đếm ngược thời gian
function startTimer() {
    if (isTimerRunning) clearInterval(timeoutId);
    isTimerRunning = true;
    timer = 300; // Reset timer về 5 phút

    const timerElement = document.querySelector('.timer');
    if (timerElement) {
        timeoutId = setInterval(() => {
            timer--;
            const minutes = Math.floor(timer / 60).toString().padStart(2, '0');
            const seconds = (timer % 60).toString().padStart(2, '0');
            timerElement.textContent = `${minutes}:${seconds}`;

            if (timer <= 0) {
                clearInterval(timeoutId);
                isTimerRunning = false;
                alert('Thời gian giữ vé đã hết. Vui lòng đặt lại!');
                window.location.href = '/frontend/pages/booking/seat-selection.html';
            }
        }, 1000);
    }
}

//#endregion

//#region === Khu vực Render Động ===

// Hàm render thông tin vé phim trên checkout.html
async function renderTicketInfo() {
    const ticketInfoBox = document.querySelector('.ticket-info-box');
    if (!ticketInfoBox) return;

    try {
        // Lấy dữ liệu từ sessionStorage
        const bookingData = JSON.parse(sessionStorage.getItem('bookingData')) || {};

        console.table('bookingData', bookingData);
        console.table('bookingSummary', bookingSummary);

        const movieId = bookingSummary.movieId || bookingData.movieId;
        const showtimeId = bookingSummary.showtimeId || bookingData.showtimeId;

        // Gọi API để lấy thông tin phim, lịch chiếu và rạp
        const movieData = await fetchData(`/api/movies/${movieId}`);
        const scheduleData = await fetchData(`/api/schedules/${showtimeId}`);
        const theaterData = await fetchData(`/api/theaters/${bookingData.theaterId}`);

        // Lấy ánh xạ mã-tên cho loại vé và bắp nước
        await loadTicketTypes();
        await loadSnacks();

        // Cập nhật thông tin phim
        const ticketHeader = document.querySelector('.ticket-header');
        ticketHeader.innerHTML = `
            <div class="ticket-movie-title">${movieData.ten_phim?.toUpperCase() || 'LẤT MẶT 8: VÒNG TAY NẶNG'} (T${movieData.gioi_han_tuoi || '13'})</div>
            <div class="ticket-theater">${theaterData.ten_rap || 'Cinestar Quốc Thanh (TPHCM)'}</div>
            <div class="ticket-theater-address">${theaterData.dia_chi || '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh'}</div>
        `;

        // Ánh xạ mã loại vé thành tên
        let ticketTypesDisplay = '-';
        if (Object.keys(bookingSummary.ct_loai_ve || {}).length > 0) {
            ticketTypesDisplay = Object.entries(bookingSummary.ct_loai_ve)
                .map(([typeId, qty]) => {
                    if (qty > 0) {
                        const typeName = ticketTypeMapping[typeId] || typeId; // Nếu không tìm thấy tên, giữ nguyên mã
                        return `${typeName} x${qty}`;
                    }
                    return '';
                })
                .filter(Boolean)
                .join(', ');
        } else if (bookingSummary.tickets?.length > 0) {
            ticketTypesDisplay = bookingSummary.tickets[0]?.name || 'Người Lớn';
        }

        // Ánh xạ mã bắp nước thành tên
        let snacksDisplay = '-';
        if (Object.keys(bookingSummary.ct_bap_nuoc || {}).length > 0) {
            snacksDisplay = Object.entries(bookingSummary.ct_bap_nuoc)
                .map(([snackId, qty]) => {
                    if (qty > 0) {
                        const snackName = snackMapping[snackId] || snackId; // Nếu không tìm thấy tên, giữ nguyên mã
                        return `${snackName} x${qty}`;
                    }
                    return '';
                })
                .filter(Boolean)
                .join(', ');
        } else if (bookingSummary.snacks?.length > 0) {
            snacksDisplay = bookingSummary.snacks.map(s => `${s.name} x${s.quantity}`).join(', ') || '-';
        }

        // Cập nhật các mục thông tin vé
        const ticketInfoItems = [
            { icon: 'far fa-calendar-alt', label: 'Thời gian:', value: `${bookingData.showtime || '11:00'} ${bookingData.formattedDate || formatDisplayDate(new Date())}` },
            { icon: 'fas fa-film', label: 'Phòng chiếu:', value: scheduleData.ma_phong || '03' },
            { icon: 'fas fa-ticket-alt', label: 'Số vé:', value: bookingSummary.so_luong_ghe || bookingSummary.seats?.length || '1' },
            { icon: 'fas fa-user', label: 'Loại vé:', value: ticketTypesDisplay },
            { icon: 'fas fa-couch', label: 'Ghế:', value: bookingSummary.trang_thai_ghe_suat_chieu?.join(', ') || bookingSummary.seats?.join(', ') || 'D06' },
            { icon: 'fas fa-utensils', label: 'Bắp nước:', value: snacksDisplay },
        ];

        const ticketInfoItemsHTML = ticketInfoItems.map(item => `
            <div class="ticket-info-item">
                <div class="ticket-info-icon"><i class="${item.icon}"></i></div>
                <div class="ticket-info-text">
                    <span class="ticket-info-label">${item.label}</span>
                    <span class="ticket-info-value">${item.value}</span>
                </div>
            </div>
        `).join('');

        // Cập nhật tổng tiền
        const totalPrice = bookingSummary.tong_tien || bookingSummary.totalPrice || 65000;
        const ticketTotalHTML = `
            <div class="ticket-total">
                <div class="ticket-total-label">SỐ TIỀN CẦN THANH TOÁN:</div>
                <div class="ticket-total-price">${totalPrice.toLocaleString('vi-VN')} VNĐ</div>
            </div>
        `;

        // Gộp HTML và render
        ticketInfoBox.innerHTML = `
            <div class="ticket-header">
                ${ticketHeader.innerHTML}
            </div>
            ${ticketInfoItemsHTML}
            ${ticketTotalHTML}
        `;
    } catch (error) {
        console.error('Lỗi khi render thông tin vé:', error);
        ticketInfoBox.innerHTML = '<p class="error">Không thể tải thông tin vé.</p>';
    }
}

// Hàm khởi tạo trang checkout
async function initializeCheckout() {
    checkBookingData();
    await renderTicketInfo();
    startTimer();
    handlePaymentSelection('/frontend/pages/booking/ticket-confirmation.html');
}

//#endregion

//#region === Khu vực Khởi Tạo ===

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'checkout') {
        initializeCheckout();
    }
});

//#endregion