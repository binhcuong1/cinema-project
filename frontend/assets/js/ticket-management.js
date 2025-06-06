// Cấu hình base URL cho API
axios.defaults.baseURL = 'http://127.0.0.1:3000';

//#region === Khu vực Biến Toàn Cục ===

let tickets = []; // Danh sách vé
let currentPage = 1; // Trang hiện tại
let totalPages = 1; // Tổng số trang
let pageSize = 6; // Số vé mỗi trang

// Bộ lọc
const filters = {
    search: '',
    startDate: '',
    endDate: ''
};

//#endregion

//#region === Khu vực Hàm Chung ===

// Hàm hiển thị thông báo lỗi trong container
function showError(container, message) {
    container.innerHTML = `<p class='error'>${message}</p>`;
    console.error(`Lỗi: ${message}`);
}

// Hàm định dạng ngày giờ (ví dụ: "20:00 - 22:00, 18/04/2025")
function formatShowtime(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const startHours = start.getHours().toString().padStart(2, '0');
    const startMinutes = start.getMinutes().toString().padStart(2, '0');
    const endHours = end.getHours().toString().padStart(2, '0');
    const endMinutes = end.getMinutes().toString().padStart(2, '0');
    const day = start.getDate().toString().padStart(2, '0');
    const month = (start.getMonth() + 1).toString().padStart(2, '0');
    const year = start.getFullYear();
    return `${startHours}:${startMinutes} - ${endHours}:${endMinutes}, ${day}/${month}/${year}`;
}

// Hàm gọi API chung với xử lý lỗi
async function fetchData(endpoint, params = {}) {
    try {
        const response = await axios.get(endpoint, { params, withCredentials: true });
        if (!response.data.success) throw new Error(response.data.message || "Dữ liệu không hợp lệ");
        return response.data.data;
    } catch (error) {
        console.error(`Lỗi khi gọi ${endpoint}:`, error);
        throw error;
    }
}

// Hàm định dạng tiền tệ (ví dụ: "150,000 VNĐ")
function formatCurrency(amount) {
    return parseFloat(amount).toLocaleString('vi-VN') + ' VNĐ';
}

//#endregion

//#region === Khu vực Render Dữ Liệu ===

// Hàm tạo HTML cho một dòng vé trong bảng
function createTicketRow(ticket) {
    const isCanceled = ticket.da_xoa === 1;
    const status = isCanceled ? 'Đã hủy' : 'Đã đặt';
    const statusClass = isCanceled ? 'canceled' : 'active';

    return `
        <tr>
            <td>${ticket.ma_ve || 'N/A'}</td>
            <td>${ticket.ten_khach_hang || 'N/A'}</td>
            <td>${ticket.email || 'N/A'}</td>
            <td>${ticket.ten_phim || 'N/A'}</td>
            <td>${ticket.ten_rap || 'N/A'}</td>
            <td>${formatShowtime(ticket.thoi_gian_bat_dau, ticket.thoi_gian_ket_thuc)}</td>
            <td>${ticket.so_luong_ghe || 0}</td>
            <td>${formatCurrency(ticket.tong_tien)}</td>
            <td class="${statusClass}">${status}</td> <!-- Hiển thị trạng thái -->
            <td>
                <button class="action-btn view-btn" data-id="${ticket.ma_ve}">Xem</button>
                ${!isCanceled ? `<button class="action-btn edit-btn" data-id="${ticket.ma_ve}">Sửa</button>` : ''}
                ${!isCanceled ? `<button class="action-btn cancel-btn" data-id="${ticket.ma_ve}">Hủy</button>` : ''}
            </td>
        </tr>
    `;
}

// Hàm render danh sách vé
async function renderTickets() {
    const ticketList = document.getElementById('ticket-list');
    try {
        const params = {
            page: currentPage,
            pageSize: pageSize,
            search: filters.search,
            startDate: filters.startDate,
            endDate: filters.endDate
        };
        const response = await fetchData('/api/bookings', params);
        tickets = response.tickets || [];
        totalPages = response.totalPages || 1;
        ticketList.innerHTML = '';

        if (tickets.length === 0) {
            ticketList.innerHTML = '<tr><td colspan="9" style="text-align: center;">Không có vé nào phù hợp.</td></tr>';
            return;
        }

        tickets.forEach(ticket => {
            ticketList.innerHTML += createTicketRow(ticket);
        });

        updatePagination();
    } catch (error) {
        console.error('Lỗi khi tải danh sách vé:', error);
        showError(ticketList, 'Không thể tải danh sách vé.');
    }
}

// Hàm render chi tiết vé trong modal
async function renderTicketDetails(ticket) {
    const modalContent = document.getElementById('modal-content');
    const ma_dat_ve = ticket.ma_ve || ticket.ma_dat_ve;

    try {
        // Gọi API để lấy chi tiết đặt vé
        const bookingDetail = await fetchData(`/api/bookings/detail/${ma_dat_ve}`);

        // Lấy dữ liệu từ bookingDetail
        const booking = bookingDetail.booking;
        const ticketDetailsData = bookingDetail.ticketDetails || [];
        const snackDetailsData = bookingDetail.snackDetails || [];
        const seatDetails = bookingDetail.seatDetails || [];

        // Gộp danh sách ghế thành chuỗi
        const seats = seatDetails
            .map(seat => `${seat.ten_ghe}`)
            .join(', ');

        // Định dạng thời gian chiếu
        const thoiGianChieu = `${formatShowtime(booking.thoi_gian_bat_dau, booking.thoi_gian_ket_thuc)}`;

        // Xử lý chi tiết vé
        let ticketDetails = '';
        if (ticketDetailsData.length > 0) {
            ticketDetails = ticketDetailsData
                .map(({ ten_loai, don_gia, so_luong }, index) => {
                    const thanhTien = don_gia * so_luong;
                    return `
                        <tr style="background-color: #2a3b5a;">
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 16px; color: #ffffff;">${ten_loai || `Loại vé ${index + 1}`}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 16px; color: #ffffff;">${formatCurrency(don_gia)}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 16px; color: #ffffff;">${so_luong}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 16px; color: #ffffff;">${formatCurrency(thanhTien)}</td>
                        </tr>`;
                })
                .join('');
        } else {
            ticketDetails = '<tr><td colspan="4" style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: center; font-size: 16px; color: #ffffff">Không có thông tin vé</td></tr>';
        }

        // Xử lý chi tiết bắp nước
        let snackDetailsSection = '';
        if (snackDetailsData.length > 0) {
            const snackDetails = snackDetailsData
                .map(({ ten_bap_nuoc, don_gia, so_luong }, index) => {
                    const thanhTien = don_gia * so_luong;
                    return `
                        <tr style="background-color: #2a3b5a;">
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 16px; color: #ffffff;">${ten_bap_nuoc || `Sản phẩm ${index + 1}`}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 16px; color: #ffffff;">${formatCurrency(don_gia)}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 16px; color: #ffffff;">${so_luong}</td>
                            <td style="padding: 12px; border-bottom: 1px solid #ff6200; text-align: left; font-size: 16px; color: #ffffff;">${formatCurrency(thanhTien)}</td>
                        </tr>`;
                })
                .join('');
            snackDetailsSection = `
                <h3 style="margin: 20px 0 10px 0; font-size: 20px; color: #ff6200; font-weight: 600;">Chi tiết bắp nước</h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 16px; margin-bottom: 20px;">
                    <thead>
                        <tr style="background-color: #1a2a44;">
                            <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; font-size: 16px; border-bottom: 2px solid #ff6200;">Sản phẩm</th>
                            <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; font-size: 16px; border-bottom: 2px solid #ff6200;">Đơn giá</th>
                            <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; font-size: 16px; border-bottom: 2px solid #ff6200;">Số lượng</th>
                            <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; font-size: 16px; border-bottom: 2px solid #ff6200;">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>${snackDetails}</tbody>
                </table>`;
        }

        // Tạo HTML cho modal với thanh cuộn
        const modalHtml = `
            <div style="max-height: 80vh; overflow-y: auto; padding: 20px;">
                <div style="margin: 20px 0">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px">
                        <div style="font-size: 16px; color: #ffffff"><strong>Mã vé:</strong> ${booking.ma_dat_ve || 'N/A'}</div>
                        <div style="font-size: 16px; color: #ffffff; text-align: right"><strong>Chi nhánh:</strong> ${booking.ten_rap || 'Cinestar Quốc Thanh'}</div>
                        <div style="font-size: 16px; color: #ffffff"><strong>Phim:</strong> ${booking.ten_phim || 'LẤT MẶT 8'}</div>
                        <div style="font-size: 16px; color: #ffffff; text-align: right"><strong>Phòng chiếu:</strong> ${booking.ten_phong || '03'}</div>
                        <div style="font-size: 16px; color: #ffffff"><strong>Thời gian:</strong> ${thoiGianChieu}</div>
                        <div style="font-size: 16px; color: #ffffff; text-align: right"><strong>Tổng tiền:</strong> ${formatCurrency(booking.tong_tien || 65000)}</div>
                        <div style="grid-column: span 2; font-size: 16px; color: #ffffff"><strong>Ghế:</strong> ${seats || 'D06'}</div>
                    </div>
                </div>
                <div style="margin: 20px 0">
                    <h3 style="margin: 0 0 10px 0; font-size: 20px; color: #ff6200; font-weight: 600">Chi tiết vé</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 16px; margin-bottom: 20px">
                        <thead>
                            <tr style="background-color: #1a2a44">
                                <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; font-size: 16px; border-bottom: 2px solid #ff6200">Loại vé</th>
                                <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; font-size: 16px; border-bottom: 2px solid #ff6200">Đơn giá</th>
                                <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; font-size: 16px; border-bottom: 2px solid #ff6200">Số lượng</th>
                                <th style="padding: 12px; font-weight: 600; color: #ffffff; text-align: left; font-size: 16px; border-bottom: 2px solid #ff6200">Thành tiền</th>
                            </tr>
                        </thead>
                        <tbody>${ticketDetails}</tbody>
                    </table>
                </div>
                ${snackDetailsSection}
                <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255, 98, 0, 0.2)">
                    <p style="font-size: 14px; color: #ffffff; margin: 5px 0; opacity: 0.7">CBHD Cinema - Hệ thống rạp chiếu phim hiện đại</p>
                    <p style="font-size: 14px; color: #ffffff; margin: 5px 0; opacity: 0.7">Hotline: 1900 1234 | Email: support@cbhd-cinema.com</p>
                    <p style="font-size: 14px; color: #ffffff; margin: 5px 0; opacity: 0.7">© 2025 CBHD Cinema. All rights reserved.</p>
                </div>
            </div>
        `;

        modalContent.innerHTML = modalHtml;
        document.getElementById('ticket-modal').classList.add('active');
    } catch (error) {
        console.error('Lỗi khi tải chi tiết vé:', error);
        modalContent.innerHTML = `<p style="color: #ff6200; text-align: center;">Không thể tải chi tiết vé. Vui lòng thử lại! (${error.message})</p>`;
        document.getElementById('ticket-modal').classList.add('active');
    }
}

// Hàm cập nhật giao diện phân trang
function updatePagination() {
    const pageInfo = document.getElementById('page-info');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    pageInfo.textContent = `Trang ${currentPage}/${totalPages}`;
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

//#endregion

//#region === Khu vực Xử Lý Sửa Chỗ ngồi ===

async function editTicketSeat(ticketId) {
    try {
        const bookingDetail = await fetchData(`/api/bookings/detail/${ticketId}`);
        const maLichChieu = bookingDetail.booking.ma_lich_chieu;
        const maPhong = bookingDetail.booking.ma_phong;
        const tenPhong = bookingDetail.booking.ten_phong;

        if (!maLichChieu || !maPhong || !tenPhong)
            throw new Error('Không thể lấy thông tin lịch chiếu hoặc phòng chiếu');

        viewSeats(maLichChieu, maPhong, tenPhong, ticketId);
    } catch (error) {
        console.error('Lỗi khi mở sơ đồ ghế: ', error);
        alert("Không thể hiển thị sơ đồ ghế: " + (error.message || "Lỗi không xác định."));
    }
}

// Hàm hiển thị modal sơ đồ ghế
async function viewSeats(ma_lich_chieu, ma_phong, ten_phong, ticketId) {
    try {
        // Gọi API để lấy danh sách ghế
        const seatsResponse = await axios.get(`/api/seats/${ma_phong}`);
        if (seatsResponse.data.success !== "true") {
            throw new Error("Không thể lấy danh sách ghế!");
        }

        const seatsPerRow = seatsResponse.data.seats_per_row || [];
        if (!seatsPerRow || seatsPerRow.length === 0) {
            throw new Error("Không có thông tin ghế cho phòng chiếu nàcd y!");
        }

        const bookingsResponse = await axios.get(`/api/bookings/${ma_lich_chieu}`);
        if (!bookingsResponse.data.success) {
            throw new Error("Không thể lấy danh sách ghế đã đặt!");
        }
        const bookedSeats = (bookingsResponse.data.data.booked_seats || []).map(
            (seat) => seat.trim().toUpperCase()
        );

        // Tạo danh sách ghế
        const seats = [];
        for (let i = 0; i < seatsPerRow.length; i++) {
            const rowLabel = String.fromCharCode(65 + i);
            const seatCount = seatsPerRow[i];
            for (let j = 1; j <= seatCount; j++) {
                const seatId = `${rowLabel}${j}`;
                const status = bookedSeats.includes(seatId) ? "sold" : "available";
                seats.push({ id: seatId, status });
            }
        }
        
        const bookingDetail = await fetchData(`/api/bookings/detail/${ticketId}`);
        const currentSeats = bookingDetail.seatDetails.map(seat => seat.ten_ghe.trim().toUpperCase());

        // Tạo modal hiển thị sơ đồ ghế
        const modal = document.createElement("div");
        modal.className = "modal-overlay";
        modal.id = "seat-modal";
        modal.innerHTML = `
            <div class="room-modal-container">
                <button class="close-form-btn">×</button>
                <h2>Sơ đồ ghế phòng chiếu ${ten_phong}</h2>
                <div class="legend">
                    <p><span style="background: linear-gradient(to bottom, #ffeb3b, #ffd600);"></span>Ghế màu vàng: Ghế đã chọn bởi vé hiện tại</p>
                    <p><span style="background: linear-gradient(to bottom, #e53935, #c62828);"></span>Ghế màu đỏ: Ghế đã đặt bởi người khác</p>
                </div>
                <div class="seat-selection">
                    <div class="screen">Màn Hình</div>
                    <div class="seat-grid" id="seat-grid"></div>
                </div>
                <button class="save-seats-btn">Lưu thay đổi</button>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add("active");

        const closeBtn = modal.querySelector(".close-form-btn");
        closeBtn.addEventListener("click", () => {
            modal.remove();
        });

        // Danh sách ghế được chọn
        let selectedSeats = [...currentSeats];
        const initialSeatCount = currentSeats.length;

        const seatGrid = modal.querySelector("#seat-grid");
        renderSeats(seats, seatGrid, selectedSeats, bookedSeats);

        // Thêm sự kiện chọn ghế
        seatGrid.addEventListener("click", (e) => {
            const seatElement = e.target.closest(".seat");
            if (!seatElement || seatElement.classList.contains("sold")) return;

            const seatId = seatElement.textContent;

            if (selectedSeats.includes(seatId)) {
                selectedSeats = selectedSeats.filter(id => id !== seatId);
                seatElement.classList.remove("selected");
            } else if (!selectedSeats.includes(seatId) && selectedSeats.length < initialSeatCount) {
                selectedSeats.push(seatId);
                seatElement.classList.add("selected");
            }
        });

        // Thêm sự kiện lưu ghế
        const saveBtn = modal.querySelector(".save-seats-btn");
        saveBtn.addEventListener("click", async () => {
            if (selectedSeats.length != initialSeatCount) {
                alert('Số lượng đã chọn khác với số lượng ghế ban đầu!');
                return;
            }

            try {
                const response = await axios.put(`/api/bookings/update-seats/`, {
                    ma_dat_ve: ticketId,
                    ma_lich_chieu,
                    seats: selectedSeats,
                    ma_phong: ma_phong
                });
                if (response.data.success) {
                    alert("Cập nhật ghế thành công!");
                    modal.remove();
                    renderTickets(); // Tải lại danh sách vé
                } else {
                    throw new Error("Không thể cập nhật ghế!");
                }
            } catch (error) {
                console.error("Lỗi khi cập nhật ghế:", error);
                alert("Lỗi: " + (error.message || "Không thể cập nhật ghế."));
            }
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách ghế:", error);
        alert("Lỗi: " + (error.message || "Không thể lấy danh sách ghế."));
    }
}

// Hàm render ghế
function renderSeats(seats, seatGrid, selectedSeats, bookedSeats) {
    seatGrid.innerHTML = "";
    const rows = [...new Set(seats.map(row => row.id.charAt(0)))];

    rows.forEach((row) => {
        const rowSeats = seats.filter((seat) => seat.id.startsWith(row));
        const rowElement = document.createElement("div");
        rowElement.classList.add("seat-row");

        const labelElement = document.createElement("div");
        labelElement.classList.add("row-label");
        labelElement.textContent = row;
        rowElement.appendChild(labelElement);

        rowSeats.forEach((seat) => {
            const seatElement = document.createElement("div");
            seatElement.classList.add("seat");

            // Ghế đã được đặt bởi người khác
            if (bookedSeats.includes(seat.id) && !selectedSeats.includes(seat.id)) {
                seatElement.classList.add("sold");
            }
            // Ghế hiện tại được chọn bởi vé này
            else if (selectedSeats.includes(seat.id)) {
                seatElement.classList.add("selected");
            }
            // Ghế trống
            else {
                seatElement.classList.add("available");
            }

            seatElement.textContent = seat.id;
            rowElement.appendChild(seatElement);
        });

        seatGrid.appendChild(rowElement);
    });
}

//#endregion

//#region === Khu vực Quản lý Phân Trang ===

// Hàm chuyển đến trang trước
function goToPreviousPage() {
    if (currentPage > 1) {
        currentPage--;
        renderTickets();
    }
}

// Hàm chuyển đến trang sau
function goToNextPage() {
    if (currentPage < totalPages) {
        currentPage++;
        renderTickets();
    }
}

//#endregion

//#region === Khu vực Xử lý Sự Kiện ===

// Hàm xử lý khi nhấn nút "Xem" để hiển thị modal
function handleViewTicket(event) {
    const ticketId = event.target.getAttribute('data-id');
    const ticket = tickets.find(t => t.ma_ve == ticketId);
    if (ticket) {
        renderTicketDetails(ticket);
        document.getElementById('ticket-modal').classList.add('active');
    }
}

// Hàm xử lý khi nhấn nút "Sửa"
function handleEditTicket(event) {
    const ticketId = event.target.getAttribute('data-id');

    if (ticketId) {
        editTicketSeat(ticketId);
        // document.getElementById('ticket-modal').classList.add('active');
    }
}

// Hàm xử lý khi nhấn nút "Hủy"
async function handleCancelTicket(event) {
    const ma_dat_ve = event.target.getAttribute('data-id');

    // Kiểm tra trạng thái vé trước khi hiển thị modal
    const ticket = tickets.find(t => t.ma_ve == ma_dat_ve);
    if (!ticket) {
        alert('Không tìm thấy vé để hủy.');
        return;
    }
    if (ticket.trang_thai === 'Đã hủy') {
        alert('Vé đã bị hủy, không thể thực hiện hành động này.');
        return;
    }

    // Kiểm tra thời gian chiếu
    const showtimeStart = new Date(ticket.thoi_gian_bat_dau);
    const now = new Date();
    const hoursDiff = (showtimeStart - now) / (1000 * 60 * 60); // Chênh lệch giờ

    if (hoursDiff < 0) {
        alert('Không thể hủy vé vì suất chiếu đã diễn ra.');
        return;
    }
    if (hoursDiff < 24) {
        alert('Không thể hủy vé vì đã quá gần giờ chiếu (dưới 24 giờ).');
        return;
    }

    // Hiển thị modal
    const modal = document.getElementById('cancel-ticket-modal');
    modal.style.display = 'flex';

    // Xử lý nút "Xác nhận" và "Hủy bỏ" bằng Promise
    const userConfirmed = await new Promise(resolve => {
        const confirmBtn = document.getElementById('cancel-ticket-confirm');
        const closeBtn = document.getElementById('cancel-ticket-close');

        confirmBtn.addEventListener('click', () => {
            resolve(true);
            modal.style.display = 'none';
        }, { once: true });

        closeBtn.addEventListener('click', () => {
            resolve(false);
            modal.style.display = 'none';
        }, { once: true });

        // Đóng modal khi nhấn ra ngoài
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                resolve(false);
                modal.style.display = 'none';
            }
        }, { once: true });
    });

    if (userConfirmed) {
        try {
            const response = await axios.post(`/api/bookings/cancel/${ma_dat_ve}`, {}, {
                validateStatus: function (status) {
                    return status >= 200 && status < 500; // Chấp nhận mã trạng thái từ 200 đến 499
                },
            });

            if (!response.data.success) {
                throw new Error(response.data.message || 'Không thể hủy vé.');
            }

            alert('Hủy vé thành công!');
            renderTickets();
        } catch (error) {
            console.error('Lỗi khi hủy vé:', error);
            alert(`Không thể hủy vé: ${error.message}`);
        }
    }
}

// Hàm xử lý khi nhấn nút "Áp dụng" bộ lọc
function handleApplyFilter() {
    filters.search = document.getElementById('search-input-ticket').value.trim();
    filters.startDate = document.getElementById('start-date').value;
    filters.endDate = document.getElementById('end-date').value;
    currentPage = 1; // Reset về trang đầu khi áp dụng bộ lọc
    renderTickets();
}

//#endregion

//#region === Khu vực Khởi Tạo ===

document.addEventListener('DOMContentLoaded', () => {
    // Khởi tạo danh sách vé
    renderTickets();

    // Gắn sự kiện cho các nút phân trang
    document.getElementById('prev-page').addEventListener('click', goToPreviousPage);
    document.getElementById('next-page').addEventListener('click', goToNextPage);

    // Gắn sự kiện cho nút "Áp dụng" bộ lọc
    document.getElementById('apply-filter').addEventListener('click', handleApplyFilter);

    // Gắn sự kiện cho nút "Load lại" danh sách vé
    document.getElementById('reload-tickets').addEventListener('click', () => {
        filters.search = '';
        filters.startDate = '';
        filters.endDate = '';
        currentPage = 1;
        document.getElementById('search-input-ticket').value = '';
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
        renderTickets();
    });

    // Gắn sự kiện keydown cho các input để áp dụng bộ lọc khi nhấn Enter
    const inputs = [
        document.getElementById('search-input-ticket'),
        document.getElementById('start-date'),
        document.getElementById('end-date')
    ];

    inputs.forEach(input => {
        input.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleApplyFilter();
            }
        });
    });

    // Gắn sự kiện cho các nút hành động trong bảng (Xem, Sửa, Hủy)
    document.getElementById('ticket-list').addEventListener('click', (event) => {
        if (event.target.classList.contains('view-btn')) {
            handleViewTicket(event);
        } else if (event.target.classList.contains('edit-btn')) {
            handleEditTicket(event);
        } else if (event.target.classList.contains('cancel-btn')) {
            handleCancelTicket(event);
        }
    });

    // Gắn sự kiện đóng modal
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('ticket-modal').classList.remove('active');
    });

    document.getElementById('ticket-modal').addEventListener('click', (event) => {
        if (event.target === document.getElementById('ticket-modal')) {
            document.getElementById('ticket-modal').classList.remove('active');
        }
    });
});

//#endregion