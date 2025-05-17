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
async function fetchData(endpoint, params = {}, method = 'get', data = {}) {
    try {
        const response = await axios({ method, url: endpoint, params, data, withCredentials: true });
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
    if (!bookingSummary || !Object.keys(bookingSummary).length) {
        alert('Không có thông tin đặt vé. Vui lòng thử lại!');
        window.location.href = '/frontend/pages/booking/seat-selection.html';
    }
}

// Hàm gửi dữ liệu đặt vé lên server
async function saveBooking() {
    const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
    const thoiGianDat = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z/, '');
    const bookingData = {
        ...bookingSummary,
        ma_tai_khoan: userData.ma_tai_khoan || '',
        ten_dang_nhap: userData.ten_dang_nhap || '',
        thoi_gian_dat: thoiGianDat,
        trang_thai: 'completed',
    };
    console.log('Danh sách ghế gửi đi:', bookingSummary.trang_thai_ghe_suat_chieu);
    try {
        const response = await axios.post('/api/bookings', bookingData, { withCredentials: true });
        console.log('Đặt vé thành công, lưu vào database:', response.data);
        return response.data; // Trả về dữ liệu từ response.data
    } catch (error) {
        console.error('Lỗi khi lưu đặt vé:', error);
        alert('Lỗi khi lưu thông tin đặt vé. Vui lòng thử lại!');
        return false;
    }
}

// Hàm gửi email thông tin vé
async function sendTicketEmail(ma_dat_ve) {
    const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
    const bookingData = JSON.parse(sessionStorage.getItem('bookingData')) || {};

    // Gọi API đồng thời
    const [movieData, scheduleData, theaterData] = await Promise.all([
        fetchData(`/api/movies/${bookingData.movieId}`),
        fetchData(`/api/schedules/${bookingData.showtimeId}`),
        fetchData(`/api/theaters/${bookingData.theaterId}`)
    ]);

    // Định dạng thời gian chiếu
    const thoiGianChieu = `${bookingData.showtime || '11:00'} ${bookingData.formattedDate || formatDisplayDate(new Date(scheduleData.ngay_chieu))}`;

    // Tạo nội dung bảng chi tiết loại vé
    let ticketDetails = '';
    if (bookingSummary.ct_loai_ve && Object.keys(bookingSummary.ct_loai_ve).length > 0) {
        ticketDetails = Object.entries(bookingSummary.ct_loai_ve)
            .filter(([_, so_luong]) => so_luong > 0)
            .map(([ma_loai, so_luong]) => {
                const tenLoai = ticketTypeMapping[ma_loai] || ma_loai;
                const donGia = 50000;
                const thanhTien = donGia * so_luong;
                return `
                    <tr style="background-color: #2a3b5a;">
                        <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${tenLoai}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${donGia.toLocaleString('vi-VN')} VNĐ</td>
                        <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${so_luong}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${thanhTien.toLocaleString('vi-VN')} VNĐ</td>
                    </tr>`;
            })
            .join('');
    }

    // Tạo nội dung bảng chi tiết bắp nước
    let snackDetailsSection = '';
    if (bookingSummary.ct_bap_nuoc && Object.keys(bookingSummary.ct_bap_nuoc).length > 0) {
        const snackDetails = Object.entries(bookingSummary.ct_bap_nuoc)
            .filter(([_, so_luong]) => so_luong > 0)
            .map(([ma_bap_nuoc, so_luong]) => {
                const tenBapNuoc = snackMapping[ma_bap_nuoc] || ma_bap_nuoc;
                const donGia = 30000;
                const thanhTien = donGia * so_luong;
                return `
                    <tr style="background-color: #2a3b5a;">
                        <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${tenBapNuoc}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${donGia.toLocaleString('vi-VN')} VNĐ</td>
                        <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${so_luong}</td>
                        <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${thanhTien.toLocaleString('vi-VN')} VNĐ</td>
                    </tr>`;
            })
            .join('');
        snackDetailsSection = `
            <h3 style="margin: 20px 0 10px 0; font-size: 18px; color: #ff6200; font-weight: 600;">Chi tiết bắp nước</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                <thead>
                    <tr style="background-color: #1a2a44;">
                        <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; border-bottom: 2px solid #ff6200;">Sản phẩm</th>
                        <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; border-bottom: 2px solid #ff6200;">Đơn giá</th>
                        <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; border-bottom: 2px solid #ff6200;">Số lượng</th>
                        <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; border-bottom: 2px solid #ff6200;">Thành tiền</th>
                    </tr>
                </thead>
                <tbody>${snackDetails}</tbody>
            </table>`;
    }

    const emailHtml = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Xác nhận đặt vé</title>
            <style>
                @media only screen and (max-width: 600px) {
                    .container { padding: 16px !important; }
                    .grid { grid-template-columns: 1fr !important; }
                    .grid div { text-align: left !important; }
                    table { min-width: 100% !important; }
                    .cta-button { padding: 10px 20px !important; font-size: 12px !important; }
                }
            </style>
        </head>
        <body style="font-family: 'Helvetica Neue', Arial, sans-serif; color: #ffffff; margin: 0; padding: 0; background: linear-gradient(135deg, #0a0e17, #1a2a44);">
            <div class="container" style="max-width: 600px; margin: 20px auto; background: linear-gradient(135deg, #0a0e17, #1a2a44); border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.3); padding: 30px; box-sizing: border-box;">
                <!-- Header -->
                <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid rgba(255, 98, 0, 0.2);">
                    <h2 style="margin: 0; font-size: 24px; color: #ff6200; font-weight: 700;">CBHD Cinema</h2>
                    <p style="margin: 5px 0 0; font-size: 14px; color: #ffffff; opacity: 0.8;">Xác nhận đặt vé xem phim</p>
                </div>

                <!-- Thông tin đơn vé -->
                <div style="margin: 20px 0;">
                    <h3 style="margin: 0 0 15px 0; font-size: 18px; color: #ff6200; font-weight: 600; text-transform: uppercase;">Chi tiết đơn vé</h3>
                    <div class="grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
                        <div style="font-size: 14px; color: #ffffff;"><strong>Mã đơn hàng:</strong> ${ma_dat_ve || 'N/A'}</div>
                        <div style="font-size: 14px; color: #ffffff; text-align: right;"><strong>Chi nhánh:</strong> ${theaterData.ten_rap || 'Cinestar Quốc Thanh'}</div>
                        <div style="font-size: 14px; color: #ffffff;"><strong>Phim:</strong> ${movieData.ten_phim || bookingSummary.movieName || 'LẤT MẶT 8'}</div>
                        <div style="font-size: 14px; color: #ffffff; text-align: right;"><strong>Phòng chiếu:</strong> ${scheduleData.ma_phong || '03'}</div>
                        <div style="font-size: 14px; color: #ffffff;"><strong>Thời gian:</strong> ${thoiGianChieu}</div>
                        <div style="font-size: 14px; color: #ffffff; text-align: right;"><strong>Tổng tiền:</strong> ${bookingSummary.tong_tien?.toLocaleString('vi-VN') || 65000} VNĐ</div>
                        <div style="grid-column: span 2; font-size: 14px; color: #ffffff;"><strong>Ghế:</strong> ${bookingSummary.trang_thai_ghe_suat_chieu?.join(', ') || 'D06'}</div>
                    </div>
                </div>

                <!-- Chi tiết vé -->
                <div style="margin: 20px 0;">
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #ff6200; font-weight: 600;">Chi tiết vé</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 20px;">
                        <thead>
                            <tr style="background-color: #1a2a44;">
                                <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; border-bottom: 2px solid #ff6200;">Loại vé</th>
                                <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; border-bottom: 2px solid #ff6200;">Đơn giá</th>
                                <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; border-bottom: 2px solid #ff6200;">Số lượng</th>
                                <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; border-bottom: 2px solid #ff6200;">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>${ticketDetails || '<tr><td colspan="4" style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: center; color: #ffffff;">Không có thông tin vé</td></tr>'}</tbody>
                    </table>
                </div>

                <!-- Chi tiết bắp nước -->
                ${snackDetailsSection}

                <!-- Lời cảm ơn -->
                <p style="font-size: 14px; color: #ffffff; text-align: center; margin: 20px 0; opacity: 0.8;">Cảm ơn bạn đã đặt vé tại CBHD Cinema! Vui lòng đến rạp trước 15 phút để nhận vé. Chúc bạn xem phim vui vẻ!</p>

                <!-- Footer -->
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255, 98, 0, 0.2);">
                    <p style="font-size: 12px; color: #ffffff; margin: 5px 0; opacity: 0.7;">CBHD Cinema - Hệ thống rạp chiếu phim hiện đại</p>
                    <p style="font-size: 12px; color: #ffffff; margin: 5px 0; opacity: 0.7;">Hotline: 1900 1234 | Email: support@cbhd-cinema.com</p>
                    <p style="font-size: 12px; color: #ffffff; margin: 5px 0; opacity: 0.7;">© 2025 CBHD Cinema. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>`;

    const emailData = {
        to: userData.ten_dang_nhap || 'user@example.com',
        subject: `Xác nhận đặt vé xem phim tại ${theaterData.ten_rap || 'Cinestar Quốc Thanh'}`,
        html: emailHtml,
    };

    try {
        const response = await axios.post('/api/bookings/send-email', emailData, { withCredentials: true });
        console.log('Email thông tin vé đã được gửi:', response.data);
        return true;
    } catch (error) {
        console.error('Lỗi khi gửi email:', error.response?.data || error.message);
        alert('Gửi email thất bại: ' + (error.response?.data?.message || error.message));
        return false;
    }
}

async function handlePaymentSelection(nextPage) {
    const momoBtn = document.getElementById('momo-payment');
    const payNowBtn = document.getElementById('pay-now');
    const loadingOverlay = document.getElementById('loading-overlay'); // Lấy overlay

    if (momoBtn) {
        momoBtn.addEventListener('click', () => {
            console.log('Chọn thanh toán qua MoMo');
            sessionStorage.setItem('paymentInfo', JSON.stringify({ paymentMethod: 'momo' }));
            window.location.href = nextPage;
        });
    }

    if (payNowBtn) {
        payNowBtn.addEventListener('click', async () => {
            console.log('Chọn thanh toán ngay');
            sessionStorage.setItem('paymentInfo', JSON.stringify({ paymentMethod: 'paynow' }));

            // Hiển thị loading
            if (loadingOverlay) loadingOverlay.style.display = 'flex';

            try {
                // Giả sử thanh toán thành công
                const response = await saveBooking();
                
                if (response && response.success) {
                    const maDatVe = response.data?.ma_dat_ve || 'N/A';
                    const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
                    
                    const emailSent = await sendTicketEmail(maDatVe);
                    
                    const ticketInfoBox = document.querySelector('.ticket-info-box');
                    ticketInfoBox.innerHTML = `
                        <div class="success-message">
                            <h2>Đặt vé thành công!</h2>
                            <p>Chi tiết vé:</p>
                            <p>- Phim: ${bookingSummary.movieName || 'LẤT MẶT 8'}</p>
                            <p>- Ghế: ${bookingSummary.trang_thai_ghe_suat_chieu?.join(', ') || 'D06'}</p>
                            <p>- Tổng tiền: ${bookingSummary.tong_tien || 65000} VNĐ</p>
                            <p>- Thời gian đặt: ${new Date().toLocaleString('vi-VN')}</p>
                            <p>${emailSent ? 'Email xác nhận đã được gửi đến ' + (userData.ten_dang_nhap || 'user@example.com') + '.' : 'Gửi email xác nhận thất bại. Vui lòng kiểm tra lại sau!'}</p>
                            <a href="/frontend/pages/booking/select-showtime.html">Quay lại chọn phim</a>
                        </div>
                    `;
                    clearInterval(timeoutId);
                    isTimerRunning = false;
                    alert('Đặt vé thành công! Vui lòng kiểm tra email để biết thêm chi tiết.');
                    window.location.href = '/frontend/pages/booking/select-showtime.html';
                } else {
                    alert('Đặt vé thất bại. Vui lòng thử lại!');
                }
            } catch (error) {
                console.error('Lỗi trong handlePaymentSelection:', error);
                alert('Đã có lỗi xảy ra. Vui lòng thử lại!');
            } finally {
                // Ẩn loading sau khi hoàn tất (dù thành công hay thất bại)
                if (loadingOverlay) loadingOverlay.style.display = 'none';
            }
        });
    }
}

// Hàm đếm ngược thời gian
function startTimer() {
    if (isTimerRunning) clearInterval(timeoutId);
    isTimerRunning = true;
    timer = 300;

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
        const bookingData = JSON.parse(sessionStorage.getItem('bookingData')) || {};
        const userData = JSON.parse(sessionStorage.getItem('userData')) || {};

        console.table('bookingData', bookingData);
        console.table('bookingSummary', bookingSummary);
        console.table('userData', userData);

        const movieId = bookingSummary.movieId || bookingData.movieId;
        const showtimeId = bookingSummary.showtimeId || bookingData.showtimeId;

        // Gọi API đồng thời
        const [movieData, scheduleData, theaterData] = await Promise.all([
            fetchData(`/api/movies/${movieId}`),
            fetchData(`/api/schedules/${showtimeId}`),
            fetchData(`/api/theaters/${bookingData.theaterId}`)
        ]);

        await Promise.all([loadTicketTypes(), loadSnacks()]);

        const ticketHeader = document.querySelector('.ticket-header');
        ticketHeader.innerHTML = `
            <div class="ticket-movie-title">${movieData.ten_phim?.toUpperCase() || 'LẤT MẶT 8: VÒNG TAY NẶNG'} (${movieData.gioi_han_tuoi || '13'})</div>
            <div class="ticket-theater">${theaterData.ten_rap || 'Cinestar Quốc Thanh (TPHCM)'}</div>
            <div class="ticket-theater-address">${theaterData.dia_chi || '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh'}</div>
        `;

        let ticketTypesDisplay = '-';
        if (Object.keys(bookingSummary.ct_loai_ve || {}).length > 0) {
            ticketTypesDisplay = Object.entries(bookingSummary.ct_loai_ve)
                .map(([typeId, qty]) => qty > 0 ? `${ticketTypeMapping[typeId] || typeId} x${qty}` : '')
                .filter(Boolean)
                .join(', ');
        } else if (bookingSummary.tickets?.length > 0) {
            ticketTypesDisplay = bookingSummary.tickets[0]?.name || 'Người Lớn';
        }

        let snacksDisplay = '-';
        if (Object.keys(bookingSummary.ct_bap_nuoc || {}).length > 0) {
            snacksDisplay = Object.entries(bookingSummary.ct_bap_nuoc)
                .map(([snackId, qty]) => qty > 0 ? `${snackMapping[snackId] || snackId} x${qty}` : '')
                .filter(Boolean)
                .join(', ');
        } else if (bookingSummary.snacks?.length > 0) {
            snacksDisplay = bookingSummary.snacks.map(s => `${s.name} x${s.quantity}`).join(', ') || '-';
        }

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

        const totalPrice = bookingSummary.tong_tien || bookingSummary.totalPrice || 65000;
        const ticketTotalHTML = `
            <div class="ticket-total">
                <div class="ticket-total-label">SỐ TIỀN CẦN THANH TOÁN:</div>
                <div class="ticket-total-price">${totalPrice.toLocaleString('vi-VN')} VNĐ</div>
            </div>
        `;

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
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';

    try {
        checkBookingData();
        await renderTicketInfo();
        startTimer();
        handlePaymentSelection('/frontend/pages/booking/ticket-confirmation.html');
    } catch (error) {
        console.error('Lỗi khi khởi tạo checkout:', error);
    } finally {
        if (loadingOverlay) loadingOverlay.style.display = 'none';
    }
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