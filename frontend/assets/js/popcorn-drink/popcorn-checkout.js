axios.defaults.baseURL = 'http://127.0.0.1:3000';

//#region === Khu vực Biến Toàn Cục ===

let timer = 300; // 5 phút = 300 giây
let timeoutId = null;
let isTimerRunning = false;

// Biến lưu thông tin đơn hàng bắp nước
let popcornOrder = {};

// Ánh xạ mã-tên cho bắp nước
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

// Hàm kiểm tra dữ liệu đơn hàng từ sessionStorage và xử lý callback
async function checkOrderData() {
    popcornOrder = JSON.parse(sessionStorage.getItem('popcornOrder')) || {};
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('paymentSuccess') === 'true') {

        const maDonDat = urlParams.get('maDonDat') || 'N/A';
        
        try {
            console.log('Gọi API /api/bookings/popcorn-order với maDonDat:', maDonDat);
            const serverOrderData = await fetchData(`/api/bookings/popcorn-order/${maDonDat}`);
            if (serverOrderData) {
                popcornOrder = serverOrderData;
                sessionStorage.setItem('popcornOrder', JSON.stringify(popcornOrder));
            } else {
                console.warn('Server không trả về dữ liệu cho maDonDat:', maDonDat, '- Sử dụng dữ liệu tạm thời.');
            }
            await loadSnacks();
        } catch (error) {
            console.error('Lỗi khi gọi API /api/bookings/popcorn-order:', error);
            console.warn('Sử dụng dữ liệu tạm thời từ popcornOrder:', popcornOrder);
            await loadSnacks();
        }

        const paymentSelection = document.querySelector('.payment-form');
        if (paymentSelection) {
            paymentSelection.style.display = 'none';
        } else {
            console.warn('Không tìm thấy phần tử .payment-form để ẩn');
        }

        const timerContainer = document.querySelector('.timer-container');
        if (timerContainer) {
            timerContainer.style.display = 'none';
        } else {
            console.warn('Không tìm thấy phần tử .timer-container để ẩn');
        }

        const orderInfoBox = document.querySelector('.ticket-info-box');
        if (orderInfoBox) {
            orderInfoBox.innerHTML = `
                <div class="success-message">
                    <h2>Đặt hàng bắp nước thành công!</h2>
                    <p>Chi tiết đơn hàng:</p>
                    <p>- Rạp: ${popcornOrder?.ten_rap || 'Cinema Hai Bà Trưng'}</p>
                    <p>- Tổng tiền: ${formatCurrency(popcornOrder?.tong_tien || 120000)}</p>
                    <p>- Thời gian đặt: ${new Date(popcornOrder?.thoi_gian_dat).toLocaleString('vi-VN')}</p>
                    <p id="email-status">Đang gửi email xác nhận...</p>
                </div>
            `;
            clearInterval(timeoutId);
            isTimerRunning = false;

            try {
                console.time('savePopcornOrder');
                const saveResponse = await savePopcornOrder();
                console.timeEnd('savePopcornOrder');

                if (saveResponse && saveResponse.success) {
                    console.time('sendPopcornOrderEmail');
                    const emailSent = await sendPopcornOrderEmail(maDonDat);
                    console.timeEnd('sendPopcornOrderEmail');

                    const emailStatus = document.getElementById('email-status');
                    if (emailStatus) {
                        emailStatus.innerHTML = emailSent 
                            ? 'Email xác nhận đã được gửi thành công!'
                            : 'Gửi email xác nhận thất bại. Vui lòng kiểm tra lại sau!';
                    }

                    if (emailSent) {
                        const successMessage = document.querySelector('.success-message');
                        successMessage.innerHTML += `
                            <p>Cảm ơn bạn đã đặt hàng! Trang sẽ tự động chuyển về trang đặt bắp nước sau 30 giây...</p>
                            <p><a href="/frontend/pages/popcorn-drink/popcorn-drink.html" style="color: #ff6200; text-decoration: underline;">Nhấn vào đây để chuyển hướng ngay</a></p>
                        `;
                        setTimeout(() => {
                            window.location.href = '/frontend/pages/popcorn-drink/popcorn-drink.html';
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
        await renderOrderInfo();
    }
}

async function savePopcornOrder() {
    const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
    const thoiGianDat = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z/, '');
    const orderData = {
        ...popcornOrder.order,
        ma_tai_khoan: userData.ma_tai_khoan || popcornOrder.order?.ma_tai_khoan || '',
        ten_dang_nhap: userData.ten_dang_nhap || popcornOrder.order?.ten_dang_nhap || '',
        thoi_gian_dat: thoiGianDat,
        trang_thai: 'completed',
        items: popcornOrder.items || [],
    };
    
    try {
        const response = await axios.post('/api/bookings/popcorn-order', orderData, { withCredentials: true });
        console.log('Đặt hàng bắp nước thành công, lưu vào database:', response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lưu đặt hàng:', error.response ? error.response.data : error.message);
        return { success: false, message: 'Lỗi khi lưu đơn hàng' };
    }
}

async function sendPopcornOrderEmail(ma_don_dat) {
    const userData = JSON.parse(sessionStorage.getItem('userData')) || {};
    try {
        const theaterData = await fetchData(`/api/theaters/${popcornOrder.ma_rap}`);

        console.table('popcornOrder: ', popcornOrder);

        let snackDetails = '';
        if (popcornOrder.items && popcornOrder.items.length > 0) {
            snackDetails = popcornOrder.items
                .map(item => {
                    const tenBapNuoc = item.ten_bap_nuoc || snackMapping[item.ma_bap_nuoc]?.ten_bap_nuoc || 'Không xác định';
                    const donGia = item.don_gia || snackMapping[item.ma_bap_nuoc]?.don_gia || 30000;
                    const thanhTien = donGia * item.so_luong;
                    return `
                        <tr style="background-color: #2a3b5a;">
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${tenBapNuoc}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${formatCurrency(donGia)}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${item.so_luong}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 14px; color: #ffffff;">${formatCurrency(thanhTien)}</td>
                        </tr>`;
                })
                .join('');
        }

        const emailHtml = `
            <!DOCTYPE html>
            <html lang="vi">
            <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Xác nhận đặt bắp nước</title><style>@media only screen and (max-width: 600px) {.container{padding:16px!important}.grid{grid-template-columns:1fr!important}.grid div{text-align:left!important}table{min-width:100%!important}.cta-button{padding:10px 20px!important;font-size:12px!important}}</style></head>
            <body style="font-family:'Helvetica Neue',Arial,sans-serif;color:#ffffff;margin:0;padding:0;background:linear-gradient(135deg,#0a0e17,#1a2a44)">
                <div class="container" style="max-width:600px;margin:20px auto;background:linear-gradient(135deg,#0a0e17,#1a2a44);border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.3);padding:30px;box-sizing:border-box">
                    <div style="text-align:center;padding-bottom:20px;border-bottom:1px solid rgba(255,98,0,0.2)">
                        <h2 style="margin:0;font-size:24px;color:#ff6200;font-weight:700">CBHD Cinema</h2>
                        <p style="margin:5px 0 0;font-size:14px;color:#ffffff;opacity:0.8">Xác nhận đặt bắp nước</p>
                    </div>
                    <div style="margin:20px 0">
                        <h3 style="margin:0 0 15px 0;font-size:18px;color:#ff6200;font-weight:600;text-transform:uppercase">Chi tiết đơn hàng</h3>
                        <div class="grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px">
                            <div style="font-size:14px;color:#ffffff"><strong>Mã đơn hàng:</strong> ${ma_don_dat || 'N/A'}</div>
                            <div style="font-size:14px;color:#ffffff;text-align:right"><strong>Chi nhánh:</strong> ${theaterData.ten_rap || 'Cinema Hai Bà Trưng'}</div>
                            <div style="font-size:14px;color:#ffffff"><strong>Thời gian đặt:</strong> ${popcornOrder.thoi_gian_dat}</div>
                            <div style="font-size:14px;color:#ffffff;text-align:right"><strong>Tổng tiền:</strong> ${formatCurrency(popcornOrder.tong_tien || 609000)}</div>
                        </div>
                    </div>
                    <div style="margin:20px 0">
                        <h3 style="margin:0 0 10px 0;font-size:18px;color:#ff6200;font-weight:600">Chi tiết bắp nước</h3>
                        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:20px">
                            <thead>
                                <tr style="background-color:#1a2a44">
                                    <th style="padding:12px;font-weight:600;color:#ffffff;text-align:left;border-bottom:2px solid #ff6200">Sản phẩm</th>
                                    <th style="padding:12px;font-weight:600;color:#ffffff;text-align:left;border-bottom:2px solid #ff6200">Đơn giá</th>
                                    <th style="padding:12px;font-weight:600;color:#ffffff;text-align:left;border-bottom:2px solid #ff6200">Số lượng</th>
                                    <th style="padding:12px;font-weight:600;color:#ffffff;text-align:left;border-bottom:2px solid #ff6200">Thành tiền</th>
                                </tr>
                            </thead>
                            <tbody>${snackDetails || '<tr><td colspan="4" style="padding:12px;border-bottom:1px solid #ff6200;text-align:center;color:#ffffff">Không có thông tin bắp nước</td></tr>'}</tbody>
                        </table>
                    </div>
                    <p style="font-size:14px;color:#ffffff;text-align:center;margin:20px 0;opacity:0.8">Cảm ơn bạn đã đặt bắp nước tại CBHD Cinema! Vui lòng đến quầy trước 15 phút để nhận hàng. Chúc bạn có trải nghiệm tuyệt vời!</p>
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
            subject: `Xác nhận đặt bắp nước tại ${theaterData.ten_rap || 'Cinema Hai Bà Trưng'}`,
            html: emailHtml,
        };

        const response = await axios.post('/api/bookings/send-email', emailData, { withCredentials: true });
        console.log('Email thông tin đơn hàng đã được gửi:', response.data);
        return true;
    } catch (error) {
        console.error('Lỗi khi gửi email:', error.response ? error.response.data : error.message);
        return false;
    }
}

async function handlePaymentSelection(nextPage) {
    const vnpayBtn = document.getElementById('vnpay-payment');
    const momoBtn = document.getElementById('momo-payment');
    const payNowBtn = document.getElementById('pay-now');

    if (payNowBtn) {
        payNowBtn.addEventListener('click', async () => {
            console.log('Chọn thanh toán ngay - Bắt đầu xử lý');
            sessionStorage.setItem('paymentInfo', JSON.stringify({ paymentMethod: 'paynow' }));

            const orderInfoBox = document.querySelector('.ticket-info-box');
            if (orderInfoBox) {
                orderInfoBox.innerHTML = `
                    <div class="success-message">
                        <h2>Đặt hàng bắp nước thành công!</h2>
                        <p>Chi tiết đơn hàng:</p>
                        <p>- Rạp: ${popcornOrder.ten_rap || 'Cinema Hai Bà Trưng'}</p>
                        <p>- Tổng tiền: ${formatCurrency(popcornOrder.tong_tien || 609000)}</p>
                        <p>- Thời gian đặt: ${new Date(popcornOrder.thoi_gian_dat).toLocaleString('vi-VN')}</p>
                        <p id="email-status">Đang gửi email xác nhận...</p>
                    </div>
                `;
                clearInterval(timeoutId);
                isTimerRunning = false;

                try {
                    console.time('savePopcornOrder');
                    const response = await savePopcornOrder();
                    console.timeEnd('savePopcornOrder');

                    if (response && response.success) {
                        const maDonDat = response.data?.ma_don_dat || 'N/A';
                        console.time('sendPopcornOrderEmail');
                        const emailSent = await sendPopcornOrderEmail(maDonDat);
                        console.timeEnd('sendPopcornOrderEmail');

                        const emailStatus = document.getElementById('email-status');
                        if (emailStatus) {
                            emailStatus.innerHTML = emailSent 
                                ? 'Đã gửi email đặt hàng!'
                                : 'Gửi email xác nhận thất bại. Vui lòng kiểm tra lại sau!';
                        }

                        if (emailSent) {
                            const successMessage = document.querySelector('.success-message');
                            successMessage.innerHTML += '<p>Trang sẽ tự động chuyển hướng sau 5 giây...</p>';
                            setTimeout(() => {
                                window.location.href = '/frontend/pages/popcorn-drink/popcorn-drink.html';
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
                const maDonDat = `ORDER_${Date.now()}`;
                const response = await axios.post('/api/vnpay/popcorn/create-qr', {
                    ma_don_dat: maDonDat,
                    tongTien: popcornOrder.tong_tien || 609000,
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
                const maDonDat = `ORDER_${Date.now()}`;
                const response = await axios.post('/api/momo/popcorn/create-qr', {
                    ma_don_dat: maDonDat,
                    tongTien: popcornOrder.tong_tien || 609000,
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
                alert('Thời gian giữ đơn hàng đã hết. Vui lòng đặt lại!');
                window.location.href = '/frontend/pages/popcorn-drink/popcorn-drink.html';
            }
        }, 1000);
    }
}

async function renderOrderInfo() {
    const orderInfoBox = document.querySelector('.ticket-info-box');
    if (!orderInfoBox) {
        console.error('Không tìm thấy ticket-info-box trong DOM');
        return;
    }

    try {
        const theaterData = await fetchData(`/api/theaters/${popcornOrder.ma_rap}`);
        await loadSnacks();

        const ticketHeader = document.querySelector('.ticket-header');
        if (ticketHeader) {
            ticketHeader.innerHTML = `
                <div class="ticket-theater">${theaterData.ten_rap || 'Cinema Hai Bà Trưng'}</div>
                <div class="ticket-theater-address">${theaterData.dia_chi || '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, TP. Hồ Chí Minh'}</div>
            `;
        }

        let snacksDisplay = '-';
        if (popcornOrder.items && popcornOrder.items.length > 0) {
            snacksDisplay = popcornOrder.items
                .map(item => {
                    const snackName = item.ten_bap_nuoc || snackMapping[item.ma_bap_nuoc]?.ten_bap_nuoc || 'Không xác định';
                    return `${snackName} x${item.so_luong}`;
                })
                .join(', ') || '-';
        }

        const orderInfoItems = [
            { icon: 'far fa-calendar-alt', label: 'Thời gian đặt:', value: new Date(popcornOrder.thoi_gian_dat).toLocaleString('vi-VN') },
            { icon: 'fas fa-utensils', label: 'Bắp nước:', value: snacksDisplay },
        ];

        const orderInfoItemsHTML = orderInfoItems.map(item => `
            <div class="ticket-info-item">
                <div class="ticket-info-icon"><i class="${item.icon}"></i></div>
                <div class="ticket-info-text">
                    <span class="ticket-info-label">${item.label}</span>
                    <span class="ticket-info-value">${item.value}</span>
                </div>
            </div>
        `).join('');

        const totalPrice = popcornOrder.tong_tien || 609000;
        const orderTotalHTML = `
            <div class="ticket-total">
                <div class="ticket-total-label">SỐ TIỀN CẦN THANH TOÁN:</div>
                <div class="ticket-total-price">${formatCurrency(totalPrice)}</div>
            </div>
        `;

        orderInfoBox.innerHTML = `
            <div class="ticket-header">
                ${ticketHeader ? ticketHeader.innerHTML : ''}
            </div>
            ${orderInfoItemsHTML}
            ${orderTotalHTML}
        `;
    } catch (error) {
        console.error('Lỗi khi render thông tin đơn hàng:', error);
        orderInfoBox.innerHTML = '<p class="error">Không thể tải thông tin đơn hàng. Vui lòng thử lại!</p>';
    }
}

// Hàm khởi tạo trang checkout và kiểm tra callback ngay lập tức
async function initializeCheckout() {
    try {
        await checkOrderData(); 
        // Chỉ khởi động timer nếu không phải paymentSuccess=true
        const urlParams = new URLSearchParams(window.location.search);
        if (!document.querySelector('.success-message') && urlParams.get('paymentSuccess') !== 'true') {
            startTimer();
        }
        handlePaymentSelection('/frontend/pages/popcorn-drink/popcorn-drink.html');
    } catch (error) {
        console.error('Lỗi khi khởi tạo checkout:', error);
    }
}

// Kiểm tra callback ngay khi script được tải
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'popcorn-checkout') {
        initializeCheckout();
    }
});

//#endregion