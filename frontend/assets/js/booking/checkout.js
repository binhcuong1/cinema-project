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

function formatCurrency(amount) {
    const roundedAmount = Math.round(amount);
    return roundedAmount.toLocaleString('vi-VN') + ' VNĐ';
}

function formatDisplayDate(dateString) {
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = days[date.getDay()];
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}/${month}/${year}`;
}

async function fetchData(endpoint, params = {}, method = 'get', data = {}) {
    try {
        const response = await axios({ method, url: endpoint, params, data, withCredentials: true });
        if (!response.data.success) throw new Error(response.data.message || "Dữ liệu không hợp lệ");
        return response.data.data;
    } catch (error) {
        console.error(`Lỗi khi gọi ${endpoint}:`, error.response ? error.response.data : error.message);
        throw error;
    }
}

async function loadTicketTypes() {
    try {
        const ticketTypes = await fetchData('/api/ticket-types/');
        ticketTypeMapping = ticketTypes.reduce((map, ticket) => {
            if (ticket.da_xoa !== 1) {
                map[ticket.ma_loai] = {
                    ten_loai: ticket.ten_loai,
                    don_gia: ticket.don_gia || 50000,
                };
            }
            return map;
        }, {});
    } catch (error) {
        console.error('Lỗi khi tải danh sách loại vé:', error);
        throw error;
    }
}

async function loadSnacks() {
    try {
        const snacks = await fetchData('/api/popcorn-drink/');
        snackMapping = snacks.reduce((map, snack) => {
            if (snack.da_xoa !== 1) {
                map[snack.ma_bap_nuoc] = {
                    ten_bap_nuoc: snack.ten_bap_nuoc,
                    don_gia: snack.don_gia || 30000,
                };
            }
            return map;
        }, {});
    } catch (error) {
        console.error('Lỗi khi tải danh sách bắp nước:', error);
        throw error;
    }
}

// Hàm kiểm tra dữ liệu đặt vé từ sessionStorage và xử lý callback
async function checkBookingData() {
    bookingSummary = JSON.parse(sessionStorage.getItem('bookingSummary')) || {};
    bookingData = JSON.parse(sessionStorage.getItem('bookingData')) || {};
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('paymentSuccess') === 'true') {
        const maDatVe = urlParams.get('maDatVe') || 'N/A';
        try {
            // Lấy dữ liệu từ server dựa trên maDatVe
            console.log('Gọi API /api/bookings/detail với maDatVe:', maDatVe);
            const serverBookingData = await fetchData(`/api/bookings/detail/${maDatVe}`);
            if (serverBookingData) {
                bookingSummary = serverBookingData; // Cập nhật nếu server trả về dữ liệu
                let bookingData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
                bookingData = { ...bookingData, ...bookingSummary };
                sessionStorage.setItem('bookingSummary', JSON.stringify(bookingSummary));
                sessionStorage.setItem('bookingData', JSON.stringify(bookingData));
            } else {
                console.warn('Server không trả về dữ liệu cho maDatVe:', maDatVe, '- Sử dụng dữ liệu tạm thời.');
            }
            // Tải ánh xạ trước khi xử lý email
            await Promise.all([loadTicketTypes(), loadSnacks()]);
        } catch (error) {
            console.error('Lỗi khi gọi API /api/bookings/detail:', error);
            console.warn('Sử dụng dữ liệu tạm thời từ bookingSummary:', bookingSummary);
            // Tải ánh xạ ngay cả khi server lỗi
            await Promise.all([loadTicketTypes(), loadSnacks()]);
        }

        // Ẩn phần chọn phương thức thanh toán bên trái
        const paymentSelection = document.querySelector('.payment-form');
        if (paymentSelection) {
            paymentSelection.style.display = 'none';
        } else {
            console.warn('Không tìm thấy phần tử .payment-form để ẩn');
        }

        // Ẩn timer container
        const timerContainer = document.querySelector('.timer-container');
        if (timerContainer) {
            timerContainer.style.display = 'none';
        } else {
            console.warn('Không tìm thấy phần tử .timer-container để ẩn');
        }

        // Hiển thị thông báo đặt vé thành công ngay lập tức
        const ticketInfoBox = document.querySelector('.ticket-info-box');
        if (ticketInfoBox) {
            ticketInfoBox.innerHTML = `
                <div class="success-message">
                    <h2>Đặt vé thành công!</h2>
                    <p>Chi tiết vé:</p>
                    <p>- Phim: ${bookingData.movieName || 'LẬT MẶT 8'}</p>
                    <p>- Ghế: ${bookingSummary.trang_thai_ghe_suat_chieu?.join(', ') || 'D06'}</p>
                    <p>- Tổng tiền: ${formatCurrency(bookingSummary.tong_tien || 65000)}</p>
                    <p>- Thời gian đặt: ${new Date().toLocaleString('vi-VN')}</p>
                    <p id="email-status">Đang gửi email xác nhận...</p>
                </div>
            `;
            clearInterval(timeoutId);
            isTimerRunning = false;

            try {
                console.time('saveBooking');
                const saveResponse = await saveBooking();
                console.timeEnd('saveBooking');

                if (saveResponse && saveResponse.success) {
                    console.time('sendTicketEmail');
                    const emailSent = await sendTicketEmail(maDatVe);
                    console.timeEnd('sendTicketEmail');

                    const emailStatus = document.getElementById('email-status');
                    if (emailStatus) {
                        emailStatus.innerHTML = emailSent 
                            ? 'Email xác nhận đã được gửi thành công!'
                            : 'Gửi email xác nhận thất bại. Vui lòng kiểm tra lại sau!';
                    }

                    if (emailSent) {
                        const successMessage = document.querySelector('.success-message');
                        successMessage.innerHTML += `
                            <p>Cảm ơn bạn đã đặt vé! Trang sẽ tự động chuyển về trang chọn suất chiếu sau 30 giây...</p>
                            <p><a href="/frontend/pages/booking/select-showtime.html" style="color: #ff6200; text-decoration: underline;">Nhấn vào đây để chuyển hướng ngay</a></p>
                        `;
                        setTimeout(() => {
                            window.location.href = '/frontend/pages/booking/select-showtime.html';
                        }, 30000);
                    }
                } else {
                    console.error('Lỗi khi lưu thông tin đơn hàng:', saveResponse);
                    const emailStatus = document.getElementById('email-status');
                    if (emailStatus) {
                        emailStatus.innerHTML = 'Lưu đơn hàng thất bại. Vui lòng kiểm tra lại sau!';
                    }
                }
            } catch (error) {
                console.error('Lỗi khi xử lý thanh toán thành công:', error);
                const emailStatus = document.getElementById('email-status');
                if (emailStatus) {
                    emailStatus.innerHTML = 'Có lỗi xảy ra trong quá trình xử lý. Vui lòng kiểm tra lại sau!';
                }
            }
        } else {
            console.error('Không tìm thấy phần tử .ticket-info-box');
        }
    } else {
        // Nếu không phải trả về từ VNPay, render thông tin vé như bình thường
        await renderTicketInfo();
    }
}

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
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lưu đặt vé:', error.response ? error.response.data : error.message);
        return { success: false, message: 'Lỗi khi lưu đơn hàng' };
    }
}

async function sendTicketEmail(ma_dat_ve) {
    const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
    let bookingData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
    bookingData = { ...bookingData, ...bookingSummary }; // Đảm bảo đồng bộ dữ liệu

    try {
        const [movieData, scheduleData, theaterData] = await Promise.all([
            fetchData(`/api/movies/${bookingData.movieId || bookingSummary.movieId}`),
            fetchData(`/api/schedules/${bookingData.showtimeId || bookingSummary.showtimeId}`),
            fetchData(`/api/theaters/${bookingData.theaterId || bookingSummary.theaterId}`)
        ]);

        const thoiGianChieu = `${bookingData.showtime || '11:00'} ${bookingData.formattedDate || formatDisplayDate(new Date(scheduleData.ngay_chieu || new Date()))}`;
        let ticketDetails = '';
        if (bookingSummary.ct_loai_ve && Object.keys(bookingSummary.ct_loai_ve).length > 0) {
            ticketDetails = Object.entries(bookingSummary.ct_loai_ve)
                .filter(([_, so_luong]) => so_luong > 0)
                .map(([ma_loai, so_luong]) => {
                    const tenLoai = ticketTypeMapping[ma_loai]?.ten_loai || ma_loai;
                    const donGia = ticketTypeMapping[ma_loai]?.don_gia || 50000;
                    const thanhTien = donGia * so_luong;
                    return `
                        <tr style="background-color: #2a3b5a;">
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${tenLoai}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${formatCurrency(donGia)}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${so_luong}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${formatCurrency(thanhTien)}</td>
                        </tr>`;
                })
                .join('');
        }

        let snackDetailsSection = '';
        if (bookingSummary.ct_bap_nuoc && Object.keys(bookingSummary.ct_bap_nuoc).length > 0) {
            const snackDetails = Object.entries(bookingSummary.ct_bap_nuoc)
                .filter(([_, so_luong]) => so_luong > 0)
                .map(([ma_bap_nuoc, so_luong]) => {
                    const tenBapNuoc = snackMapping[ma_bap_nuoc]?.ten_bap_nuoc || ma_bap_nuoc;
                    const donGia = snackMapping[ma_bap_nuoc]?.don_gia || 30000;
                    const thanhTien = donGia * so_luong;
                    return `
                        <tr style="background-color: #2a3b5a;">
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${tenBapNuoc}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${formatCurrency(donGia)}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${so_luong}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${formatCurrency(thanhTien)}</td>
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
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Xác nhận đặt vé</title><style>@media only screen and (max-width: 600px) {.container{padding:16px!important}.grid{grid-template-columns:1fr!important}.grid div{text-align:left!important}table{min-width:100%!important}.cta-button{padding:10px 20px!important;font-size:12px!important}}</style></head>
            <body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#ffffff;margin:0;padding:0;background:linear-gradient(135deg,#0a0e17,#1a2a44)">
                <div class="container" style="max-width:600px;margin:20px auto;background:linear-gradient(135deg,#0a0e17,#1a2a44);border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.3);padding:30px;box-sizing:border-box">
                    <div style="text-align:center;padding-bottom:20px;border-bottom:1px solid rgba(255,98,0,0.2)">
                        <h2 style="margin:0;font-size:24px;color:#ff6200;font-weight:700">CBHD Cinema</h2>
                        <p style="margin:5px 0 0;font-size:14px;color:#ffffff;opacity:0.8">Xác nhận đặt vé xem phim</p>
                    </div>
                    <div style="margin:20px 0">
                        <h3 style="margin:0 0 15px 0;font-size:18px;color:#ff6200;font-weight:600;text-transform:uppercase">Chi tiết đơn vé</h3>
                        <div class="grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
                            <div style="font-size:14px;color:#ffffff"><strong>Mã đơn hàng:</strong> ${ma_dat_ve || 'N/A'}</div>
                            <div style="font-size:14px;color:#ffffff;text-align:right"><strong>Chi nhánh:</strong> ${theaterData.ten_rap || 'Cinestar Quốc Thanh'}</div>
                            <div style="font-size:14px;color:#ffffff"><strong>Phim:</strong> ${movieData.ten_phim || bookingSummary.movieName || 'LẤT MẶT 8'}</div>
                            <div style="font-size:14px;color:#ffffff;text-align:right"><strong>Phòng chiếu:</strong> ${scheduleData.ma_phong || '03'}</div>
                            <div style="font-size:14px;color:#ffffff"><strong>Thời gian:</strong> ${thoiGianChieu}</div>
                            <div style="font-size:14px;color:#ffffff;text-align:right"><strong>Tổng tiền:</strong> ${formatCurrency(bookingSummary.tong_tien || 65000)}</div>
                            <div style="grid-column:span 2;font-size:14px;color:#ffffff"><strong>Ghế:</strong> ${bookingSummary.trang_thai_ghe_suat_chieu?.join(', ') || 'D06'}</div>
                        </div>
                    </div>
                    <div style="margin:20px 0">
                        <h3 style="margin:0 0 10px 0;font-size:18px;color:#ff6200;font-weight:600">Chi tiết vé</h3>
                        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
                            <thead>
                                <tr style="background-color:#1a2a44">
                                    <th style="padding:12px;font-weight:600;color:#ffffff;text-align:left;border-bottom:2px solid #ff6200">Loại vé</th>
                                    <th style="padding:12px;font-weight:600;color:#ffffff;text-align:left;border-bottom:2px solid #ff6200">Đơn giá</th>
                                    <th style="padding:12px;font-weight:600;color:#ffffff;text-align:left;border-bottom:2px solid #ff6200">Số lượng</th>
                                    <th style="padding:12px;font-weight:600;color:#ffffff;text-align:left;border-bottom:2px solid #ff6200">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>${ticketDetails || '<tr><td colspan="4" style="padding:12px;border-bottom:1px solid #ff6200;text-align:center;color:#ffffff">Không có thông tin vé</td></tr>'}</tbody>
                        </table>
                    </div>
                    ${snackDetailsSection}
                    <p style="font-size:14px;color:#ffffff;text-align:center;margin:20px 0;opacity:0.8">Cảm ơn bạn đã đặt vé tại CBHD Cinema! Vui lòng đến rạp trước 15 phút để nhận vé. Chúc bạn xem phim vui vẻ!</p>
                    <div style="text-align:center;padding-top:20px;border-top:1px solid rgba(255,98,0,0.2)">
                        <p style="font-size:12px;color:#ffffff;margin:5px 0;opacity:0.7">CBHD Cinema - Hệ thống rạp chiếu phim hiện đại</p>
                        <p style="font-size:12px;color:#ffffff;margin:5px 0;opacity:0.7">Hotline: 1900 1234 | Email: support@cbhd-cinema.com</p>
                        <p style="font-size:12px;color:#ffffff;margin:5px 0;opacity:0.7">© 2025 CBHD Cinema. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>`;

        const emailData = {
            to: userData.ten_dang_nhap || 'user@example.com',
            subject: `Xác nhận đặt vé xem phim tại ${theaterData.ten_rap || 'Cinestar Quốc Thanh'}`,
            html: emailHtml,
        };

        const response = await axios.post('/api/bookings/send-email', emailData, { withCredentials: true });
        console.log('Email thông tin vé đã được gửi:', response.data);
        return true;
    } catch (error) {
        console.error('Lỗi khi gửi email:', error.response ? error.response.data : error.message);
        return false;
    }
}

async function handlePaymentSelection(nextPage) {
    const vnpayBtn = document.getElementById('vnpay-payment');
    const momoBtn = document.getElementById('momo-payment'); // Thêm nút MoMo
    const payNowBtn = document.getElementById('pay-now');

    if (payNowBtn) {
        payNowBtn.addEventListener('click', async () => {
            console.log('Chọn thanh toán ngay - Bắt đầu xử lý');
            sessionStorage.setItem('paymentInfo', JSON.stringify({ paymentMethod: 'paynow' }));

            const ticketInfoBox = document.querySelector('.ticket-info-box');
            if (ticketInfoBox) {
                ticketInfoBox.innerHTML = `
                    <div class="success-message">
                        <h2>Đặt vé thành công!</h2>
                        <p>Chi tiết vé:</p>
                        <p>- Phim: ${bookingSummary.movieName || 'LẤT MẶT 8'}</p>
                        <p>- Ghế: ${bookingSummary.trang_thai_ghe_suat_chieu?.join(', ') || 'D06'}</p>
                        <p>- Tổng tiền: ${formatCurrency(bookingSummary.tong_tien || 65000)}</p>
                        <p>- Thời gian đặt: ${new Date().toLocaleString('vi-VN')}</p>
                        <p id="email-status">Đang gửi email xác nhận...</p>
                    </div>
                `;
                clearInterval(timeoutId);
                isTimerRunning = false;

                try {
                    console.time('saveBooking');
                    const response = await saveBooking();
                    console.timeEnd('saveBooking');

                    if (response && response.success) {
                        const maDatVe = response.data?.ma_dat_ve || 'N/A';
                        console.time('sendTicketEmail');
                        const emailSent = await sendTicketEmail(maDatVe);
                        console.timeEnd('sendTicketEmail');

                        const emailStatus = document.getElementById('email-status');
                        if (emailStatus) {
                            emailStatus.innerHTML = emailSent 
                                ? 'Đã gửi email đặt vé!'
                                : 'Gửi email xác nhận thất bại. Vui lòng kiểm tra lại sau!';
                        }

                        if (emailSent) {
                            const successMessage = document.querySelector('.success-message');
                            successMessage.innerHTML += '<p>Trang sẽ tự động chuyển hướng sau 5 giây...</p>';
                            setTimeout(() => {
                                window.location.href = '/frontend/pages/booking/select-showtime.html';
                            }, 5000);
                        }
                    } else {
                        console.error('Lỗi khi lưu thông tin đơn hàng:', response);
                        const emailStatus = document.getElementById('email-status');
                        if (emailStatus) {
                            emailStatus.innerHTML = 'Lưu đơn hàng hoặc gửi email thất bại. Vui lòng kiểm tra lại sau!';
                        }
                    }
                } catch (error) {
                    console.error('Lỗi trong handlePaymentSelection:', error);
                    const emailStatus = document.getElementById('email-status');
                    if (emailStatus) {
                        emailStatus.innerHTML = 'Gửi email xác nhận thất bại. Vui lòng kiểm tra lại sau!';
                    }
                }
            } else {
                console.error('Không tìm thấy phần tử .ticket-info-box');
            }
        });
    }

    if (vnpayBtn) {
        vnpayBtn.addEventListener('click', async () => {
            console.log('Chọn thanh toán qua VNPay');
            sessionStorage.setItem('paymentInfo', JSON.stringify({ paymentMethod: 'vnpay' }));

            try {
                const maDatVe = `ORDER_${Date.now()}`;
                const response = await axios.post('/api/vnpay/create-qr', {
                    ma_dat_ve: maDatVe,
                    tongTien: bookingSummary.tong_tien || 65000,
                }, { withCredentials: true });

                if (response.data.payUrl) {
                    window.location.href = response.data.payUrl;
                } else {
                    throw new Error('Không thể tạo link thanh toán VNPay');
                }
            } catch (error) {
                console.error('Lỗi khi tạo link thanh toán VNPay:', error);
                alert('Lỗi khi tạo link thanh toán VNPay. Vui lòng thử lại!');
            }
        });
    }

    if (momoBtn) {
        momoBtn.addEventListener('click', async () => {
            console.log('Chọn thanh toán qua MoMo');
            sessionStorage.setItem('paymentInfo', JSON.stringify({ paymentMethod: 'momo' }));

            try {
                const maDatVe = `ORDER_${Date.now()}`;
                const response = await axios.post('/api/momo/create-payment', {
                    ma_dat_ve: maDatVe,
                    tongTien: bookingSummary.tong_tien || 65000,
                }, { withCredentials: true });

                if (response.data.payUrl) {
                    window.location.href = response.data.payUrl;
                } else {
                    throw new Error('Không thể tạo link thanh toán MoMo');
                }
            } catch (error) {
                console.error('Lỗi khi tạo link thanh toán MoMo:', error);
                alert('Lỗi khi tạo link thanh toán MoMo. Vui lòng thử lại!');
            }
        });
    }
}

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

async function renderTicketInfo() {
    const ticketInfoBox = document.querySelector('.ticket-info-box');
    if (!ticketInfoBox) {
        console.error('Không tìm thấy ticket-info-box trong DOM');
        return;
    }

    try {
        const bookingData = JSON.parse(sessionStorage.getItem('bookingData') || '{}');
        const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
        const movieId = bookingSummary.movieId || bookingData.movieId;
        const showtimeId = bookingSummary.showtimeId || bookingData.showtimeId;

        if (!movieId || !showtimeId) {
            console.warn('movieId hoặc showtimeId không tồn tại:', { movieId, showtimeId });
            throw new Error('Thiếu thông tin cần thiết để render vé');
        }

        const [movieData, scheduleData, theaterData] = await Promise.all([
            fetchData(`/api/movies/${movieId}`),
            fetchData(`/api/schedules/${showtimeId}`),
            fetchData(`/api/theaters/${bookingData.theaterId || bookingSummary.theaterId}`)
        ]);

        await Promise.all([loadTicketTypes(), loadSnacks()]);

        const ticketHeader = document.querySelector('.ticket-header');
        if (ticketHeader) {
            ticketHeader.innerHTML = `
                <div class="ticket-movie-title">${movieData.ten_phim?.toUpperCase() || 'LẤT MẶT 8: VÒNG TAY NẶNG'} (${movieData.gioi_han_tuoi || '13'})</div>
                <div class="ticket-theater">${theaterData.ten_rap || 'Cinestar Quốc Thanh'}</div>
                <div class="ticket-theater-address">${theaterData.dia_chi || '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh'}</div>
            `;
        }

        let ticketTypesDisplay = '-';
        if (bookingSummary.ct_loai_ve && Object.keys(bookingSummary.ct_loai_ve).length > 0) {
            ticketTypesDisplay = Object.entries(bookingSummary.ct_loai_ve)
                .filter(([_, qty]) => qty > 0)
                .map(([typeId, qty]) => {
                    const ticketName = ticketTypeMapping[typeId]?.ten_loai || typeId || 'Không xác định';
                    return `${ticketName} x${qty}`;
                })
                .filter(Boolean)
                .join(', ') || '-';
        } else if (bookingSummary.tickets?.length > 0) {
            ticketTypesDisplay = bookingSummary.tickets[0]?.name || 'Người Lớn';
        }

        let snacksDisplay = '-';
        if (bookingSummary.ct_bap_nuoc && Object.keys(bookingSummary.ct_bap_nuoc).length > 0) {
            snacksDisplay = Object.entries(bookingSummary.ct_bap_nuoc)
                .filter(([_, qty]) => qty > 0)
                .map(([snackId, qty]) => {
                    const snackName = snackMapping[snackId]?.ten_bap_nuoc || snackId || 'Không xác định';
                    return `${snackName} x${qty}`;
                })
                .filter(Boolean)
                .join(', ') || '-';
        } else if (bookingSummary.snacks?.length > 0) {
            snacksDisplay = bookingSummary.snacks
                .map(s => `${s.name} x${s.quantity}`)
                .join(', ') || '-';
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
                <div class="ticket-total-price">${formatCurrency(totalPrice)}</div>
            </div>
        `;

        ticketInfoBox.innerHTML = `
            <div class="ticket-header">
                ${ticketHeader ? ticketHeader.innerHTML : ''}
            </div>
            ${ticketInfoItemsHTML}
            ${ticketTotalHTML}
        `;
    } catch (error) {
        console.error('Lỗi khi render thông tin vé:', error);
        ticketInfoBox.innerHTML = '<p class="error">Không thể tải thông tin vé. Vui lòng thử lại!</p>';
    }
}

// Hàm khởi tạo trang checkout và kiểm tra callback ngay lập tức
async function initializeCheckout() {
    try {
        await checkBookingData(); // Kiểm tra callback ngay khi khởi tạo
        // Chỉ khởi động timer nếu không phải paymentSuccess=true
        const urlParams = new URLSearchParams(window.location.search);
        if (!document.querySelector('.success-message') && urlParams.get('paymentSuccess') !== 'true') {
            startTimer();
        }
        handlePaymentSelection('/frontend/pages/booking/ticket-confirmation.html');
    } catch (error) {
        console.error('Lỗi khi khởi tạo checkout:', error);
    }
}

// Kiểm tra callback ngay khi script được tải
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'checkout') {
        initializeCheckout();
    }
});

//#endregion