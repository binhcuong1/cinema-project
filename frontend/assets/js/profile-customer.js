/**
 * Tải thông tin người dùng hiện tại
 */
async function loadCustomerProfile() {
    try {
        const res = await axios.get("/api/users/me", { withCredentials: true });
        if (res.data.success === "true") {
            const user = res.data.data;
            document.getElementById("customer-fullname").value = user.ho_va_ten || "";
            document.getElementById("customer-phone").value = user.sdt || "";
            document.getElementById("customer-email").value = user.ten_dang_nhap || "";
            document.getElementById("customer-name").textContent = user.ho_va_ten || "Khách hàng";

            window.originalEmail = user.ten_dang_nhap || "";

        } else {
            showNotification("Không thể tải thông tin người dùng.", 'error');
        }
    } catch (err) {
        console.error("Lỗi khi load profile:", err);
        showNotification("Phiên đăng nhập hết hạn hoặc lỗi hệ thống.", 'error');
        window.location.href = "/frontend/pages/index.html";
    }
}

/**
 * Upload ảnh đại diện
 */
function uploadAvatarToServer(file) {
    if (!file) {
        showNotification('Vui lòng chọn một tệp ảnh.', 'error');
        return;
    }

    showNotification('Đang tải ảnh lên...', 'info');

    const formData = new FormData();
    formData.append('avatar', file);

    axios.post('/api/customer/upload-avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    .then(response => {
        if (response.data && response.data.success) {
            showNotification('Ảnh đại diện đã được cập nhật thành công!', 'success');
        } else {
            showNotification((response.data && response.data.message) || 'Có lỗi xảy ra.', 'error');
        }
    })
    .catch(error => {
        console.error('Error uploading avatar:', error);
        showNotification('Có lỗi xảy ra khi tải ảnh lên.', 'error');
    });
}

/**
 * Gắn sự kiện khi chọn avatar
 */
function setupAvatarUpload() {
    const avatarUpload = document.getElementById('avatar-upload');
    const userAvatar = document.querySelector('.user-avatar');

    if (!avatarUpload || !userAvatar) {
        console.error('Avatar upload elements are missing.');
        return;
    }

    avatarUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            if (!file.type.startsWith('image/')) {
                showNotification('Vui lòng chọn tệp hình ảnh hợp lệ.', 'error');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                showNotification('Kích thước ảnh không được vượt quá 2MB.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                userAvatar.src = e.target.result;
                uploadAvatarToServer(file);
            };
            reader.readAsDataURL(file);
        }
    });
}

/**
 * Điều hướng tab thông tin trong sidebar
 */
function setupProfileMenuNavigation() {
    const menuItems = document.querySelectorAll('.profile-menu li');
    const sections = document.querySelectorAll('.profile-content section');
    const mainTitle = document.querySelector('.profile-content h2');
    const profileUserSection = document.querySelector('.profile-user-section');

    if (!menuItems || !sections || !mainTitle || !profileUserSection) {
        console.error('One or more required DOM elements are missing.');
        return;
    }

    menuItems.forEach(item => {
        item.addEventListener('click', function () {
            const itemText = this.textContent.trim();

            if (itemText.includes('Đăng xuất')) {
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    window.location.href = '/logout';
                }
            } else {
                menuItems.forEach(mi => mi.classList.remove('active'));
                this.classList.add('active');
                sections.forEach(section => section.classList.remove('active'));
                const sectionId = this.getAttribute('data-section');
                const targetSection = document.getElementById(`${sectionId}-section`);
                if (targetSection) {
                    targetSection.classList.add('active');
                    mainTitle.textContent = itemText;
                    profileUserSection.classList.add('active');
                }
                showNotification(`Đang chuyển đến: ${itemText}`, 'info');
            }
        });
    });
}

/**
 * Điều hướng từ nút "Thông tin cá nhân" trên header
 */
function setupHeaderNavigation() {
    const personalInfoHeaderBtn = document.getElementById('personal-info-header-btn');
    if (!personalInfoHeaderBtn) {
        console.warn('personal-info-header-btn not found, skipping header navigation setup.');
        return;
    }
    const sections = document.querySelectorAll('.profile-content section');
    const mainTitle = document.querySelector('.profile-content h2');
    const profileUserSection = document.querySelector('.profile-user-section');
    const menuItems = document.querySelectorAll('.profile-menu li');

    if (!personalInfoHeaderBtn || !sections || !mainTitle || !profileUserSection || !menuItems) {
        console.error('One or more required DOM elements for header navigation are missing.');
        return;
    }

    personalInfoHeaderBtn.addEventListener('click', function () {
        menuItems.forEach(mi => mi.classList.remove('active'));
        const personalInfoMenuItem = Array.from(menuItems).find(item => item.getAttribute('data-section') === 'personal-info');
        if (personalInfoMenuItem) {
            personalInfoMenuItem.classList.add('active');
        }
        sections.forEach(section => section.classList.remove('active'));
        const personalInfoSection = document.getElementById('personal-info-section');
        if (personalInfoSection) {
            personalInfoSection.classList.add('active');
            mainTitle.textContent = 'Thông tin khách hàng';
            profileUserSection.classList.add('active');
        }
        showNotification('Đang chuyển đến: Thông tin khách hàng', 'info');
    });
}

/**
 * Hiển thị thông báo toast
 */
function showNotification(message, type) {
    const notificationToast = document.getElementById('notification-toast');
    const notificationMessage = document.getElementById('notification-message');

    if (!notificationToast || !notificationMessage) {
        console.error('Notification elements are missing.');
        return;
    }

    notificationMessage.textContent = message;
    const iconElement = notificationToast.querySelector('i');
    iconElement.className = '';

    if (type === 'success') {
        iconElement.className = 'fas fa-check-circle';
        notificationToast.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        iconElement.className = 'fas fa-exclamation-circle';
        notificationToast.style.backgroundColor = '#F44336';
    } else if (type === 'info') {
        iconElement.className = 'fas fa-info-circle';
        notificationToast.style.backgroundColor = '#2196F3';
    }

    notificationToast.classList.add('show');
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            notificationToast.classList.remove('show');
        }, 5000);
    }
}

/**
 * Cập nhật thông tin cá nhân
 */
function updateCustomerProfile() {
    const personalInfoForm = document.getElementById('personal-info-form');
    if (!personalInfoForm) {
        console.error('Personal info form is missing.');
        return;
    }

    personalInfoForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const fullname = document.getElementById('customer-fullname').value.trim();
        const phone = document.getElementById('customer-phone').value.trim();
        const email = document.getElementById('customer-email').value.trim();

        // Kiểm tra tính hợp lệ của dữ liệu
        if (!fullname || !phone || !email) {
            showNotification('Vui lòng điền đầy đủ thông tin.', 'error');
            return;
        }

        // Kiểm tra định dạng email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Vui lòng nhập email hợp lệ.', 'error');
            return;
        }

        // Kiểm tra định dạng số điện thoại 
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            showNotification('Vui lòng nhập số điện thoại hợp lệ (10 chữ số).', 'error');
            return;
        }

        // Cảnh báo nếu đổi email đăng nhập
        if (email !== window.originalEmail) {
            const confirmChange = confirm("Bạn đang thay đổi email đăng nhập. Sau khi đổi, bạn sẽ phải dùng email mới để đăng nhập. Tiếp tục?");
            if (!confirmChange) {
                // Nếu hủy, khôi phục lại email ban đầu
                document.getElementById('customer-email').value = window.originalEmail;
                return;
            }
        }

        // Log dữ liệu gửi đi để debug
        console.log('Dữ liệu gửi đi:', { fullname, phone, email });

        try {
            showNotification('Đang cập nhật thông tin...', 'info');

            const updateData = {
                fullname,
                phone,
                email
            };

            const res = await axios.post('/api/users/update-profile', updateData, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (res.data.success === true) { 
                showNotification('Cập nhật thông tin thành công!', 'success');
                // Cập nhật lại tên hiển thị
                document.getElementById('customer-name').textContent = fullname || 'Khách hàng';
                window.originalEmail = email;
            } else {
                showNotification(res.data.error || 'Không thể cập nhật thông tin.', 'error');
            }
        } catch (err) {
            if (err.response && err.response.status === 409) {
                showNotification(err.response.data.error || 'Email đã được sử dụng.', 'error');
            } else {
                console.error('Lỗi khi cập nhật thông tin:', err.response?.data || err.message);
                showNotification('Có lỗi xảy ra khi cập nhật thông tin.', 'error');
            }
        }
    });
}

/**
 * Đổi mật khẩu
 */
function changePassword() {
    const form = document.getElementById('password-change-form');
    if (!form) return;

    // Toggle hiện/ẩn mật khẩu
    document.querySelectorAll('.view-combo-details-btn').forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.getAttribute('data-id');
            showComboDetailModal(orderId);
        });
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const oldPassword = document.getElementById('old-password').value.trim();
        const newPassword = document.getElementById('new-password').value.trim();
        
        // Kiểm tra input
        if (!oldPassword || !newPassword ) {
            showNotification('Vui lòng điền đầy đủ các trường mật khẩu.', 'error');
            return;
        }

        const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
        if (!strongRegex.test(newPassword)) {
            showNotification('Mật khẩu mới yếu. Phải gồm chữ hoa, thường, số và ký tự đặc biệt (tối thiểu 8 ký tự).', 'error');
            return;
        }

        try {
            showNotification('Đang xử lý...', 'info');

            const res = await axios.post('/api/users/change-password', {
                oldPassword,
                newPassword,
            }, { withCredentials: true });

            if (res.data.success === true) {
                showNotification('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.', 'success');
                setTimeout(async () => {
                try {
                    await axios.post('/api/users/logout', {}, { withCredentials: true });
                    window.location.href = '/frontend/pages/index.html'; // hoặc trang login
                } catch (err) {
                    console.error('Lỗi khi logout:', err);
                }
            }, 2000);
            } else {
                showNotification(res.data.error || 'Lỗi không xác định khi đổi mật khẩu.', 'error');
            }
        } catch (err) {
            const msg = err.response?.data?.error || 'Lỗi máy chủ khi đổi mật khẩu.';
            showNotification(msg, 'error');
        }
    });
}

//Load lịch sử mua hàng 
async function loadCombinedPurchaseHistory() {
    try {
        const [comboRes, ticketRes] = await Promise.all([
            axios.get('/api/orders/popcorn-drink-history', { withCredentials: true }),
            axios.get('/api/orders/ticket-history', { withCredentials: true })
        ]);

        const comboList = comboRes.data.success ? comboRes.data.data : [];
        const ticketList = ticketRes.data.success ? ticketRes.data.data : [];

        const allOrders = [
            ...comboList.map(item => ({
                id: item.ma_don_dat,
                hoat_dong: item.hoat_dong,
                chi_nhanh: item.chi_nhanh,
                ngay: item.ngay,
                tong_tien: item.tong_tien,
                type: 'combo'
            })),
            ...ticketList.map(item => ({
                id: item.ma_dat_ve,
                hoat_dong: item.hoat_dong,
                chi_nhanh: item.chi_nhanh,
                ngay: item.ngay,
                tong_tien: item.tong_tien,
                type: 'ticket'
            }))
        ];

        // Sắp xếp theo ngày giảm dần
        allOrders.sort((a, b) => new Date(b.ngay) - new Date(a.ngay));

        const tbody = document.getElementById('purchase-history-body');
        tbody.innerHTML = '';

        if (allOrders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6">Bạn chưa có giao dịch nào.</td></tr>`;
            return;
        }

        allOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.hoat_dong}</td>
                <td>${order.chi_nhanh}</td>
                <td>${new Date(order.ngay).toLocaleString()}</td>
                <td>${parseInt(order.tong_tien).toLocaleString()} VNĐ</td>
                <td>
                    ${order.type === 'combo' ? `<button class="view-combo-details-btn" data-id="${order.id}">Xem chi tiết</button>` 
                                              : `<button class="view-ticket-details-btn" data-id="${order.id}">Xem chi tiết</button>`}
                </td>
            `;
            tbody.appendChild(row);
        });

        // Gắn sự kiện xem chi tiết combo
        document.querySelectorAll('.view-combo-details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showComboDetailModal(id);
            });
        });

        // (Tuỳ bạn) Gắn sự kiện xem chi tiết vé
        document.querySelectorAll('.view-ticket-details-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                showTicketDetailModal(id);
            });
            });

    } catch (err) {
        console.error('Lỗi khi tải lịch sử mua hàng:', err);
        showNotification('Không thể tải lịch sử mua hàng.', 'error');
    }
}

//Xem chi tiết bắp nước
function showComboDetailModal(orderId) {
  const popup = document.getElementById('combo-detail-popup');
  const body = document.getElementById('combo-detail-body');
  popup.classList.remove('hidden');
  body.innerHTML = '<p>Đang tải chi tiết đơn...</p>';

  axios.get(`/api/orders/popcorn-drink-history/${orderId}`, { withCredentials: true })
    .then(res => {
      if (res.data.success) {
        const items = res.data.data;
        if (items.length === 0) {
          body.innerHTML = '<p>Không tìm thấy chi tiết đơn.</p>';
          return;
        }

        const maDon = orderId;
        const chiNhanh = items[0]?.ten_rap || 'Không rõ';
        const tongTien = parseInt(items[0]?.tong_tien || 0);

        let html = `
          <div style="margin-bottom: 10px;">
            <strong>Mã đơn hàng:</strong> ${maDon}<br>
            <strong>Rạp:</strong> ${chiNhanh}
          </div>

          <table style="width:100%;border-collapse:collapse;">
            <thead>
              <tr>
                <th>Tên bắp nước</th>
                <th>Đơn giá</th>
                <th>Số lượng</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
        `;

        items.forEach(i => {
          const donGia = parseInt(i.don_gia || 0);
          const soLuong = parseInt(i.so_luong || 0);
          const thanhTien = donGia * soLuong;

          html += `
            <tr>
              <td>${i.ten_bap_nuoc}</td>
              <td>${donGia.toLocaleString()} VNĐ</td>
              <td>${soLuong}</td>
              <td>${thanhTien.toLocaleString()} VNĐ</td>
            </tr>
          `;
        });

        html += `
            </tbody>
          </table>

          <div style="margin-top: 10px; text-align: right;">
            <strong>Tổng cộng:</strong> ${tongTien.toLocaleString()} VNĐ
          </div>
        `;

        body.innerHTML = html;
      } else {
        body.innerHTML = '<p>Không tìm thấy chi tiết đơn.</p>';
      }
    })
    .catch(err => {
      console.error('Lỗi khi load chi tiết combo:', err);
      body.innerHTML = '<p>Lỗi hệ thống.</p>';
    });
}

//Xem chi tiết vé

function showTicketDetailModal(orderId) {
    const popup = document.getElementById('ticket-detail-popup');
    const body = document.getElementById('ticket-detail-body');
    popup.classList.remove('hidden');
    body.innerHTML = '<p>Đang tải chi tiết vé...</p>';

    axios.get(`/api/orders/ticket-history/${orderId}`, { withCredentials: true })
        .then(res => {
            if (res.data.success && res.data.data) {
                const { thongTin, ghe, loai_ve, combo } = res.data.data;

                let html = `
                    <div class="ticket-detail-info">
                        <div class="left-align"><strong>Mã đặt vé:</strong> ${thongTin.ma_dat_ve}</div>
                        <div class="right-align"></div> <!-- Placeholder để giữ cấu trúc -->
                        <div class="left-align"><strong>Phim:</strong> ${thongTin.ten_phim}</div>
                        <div class="right-align"></div> <!-- Placeholder để giữ cấu trúc -->
                        <div class="left-align"><strong>Rạp:</strong> ${thongTin.ten_rap}</div>
                        <div class="right-align"><strong>Phòng chiếu:</strong> ${thongTin.ten_phong}</div>
                        <div class="left-align"><strong>Thời lượng:</strong> ${thongTin.thoi_luong_phut} phút</div>
                        <div class="right-align"><strong>Thời gian đặt:</strong> ${new Date(thongTin.thoi_gian_dat).toLocaleString()}</div>
                        <div class="full-width"><strong>Ghế đã chọn:</strong> ${ghe.join(', ')}</div>
                    </div>

                    <h4 style="margin-top: 15px;">Chi tiết vé</h4>
                    <table id="ticket-detail-table" style="width:100%; margin-top:10px; border-collapse:collapse;">
                        <thead>
                            <tr><th>Loại vé</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr>
                        </thead>
                        <tbody>
                `;

                let tongTienVe = 0;
                loai_ve.forEach(v => {
                    const tien = v.don_gia * v.so_luong;
                    tongTienVe += tien;
                    html += `
                        <tr>
                            <td title="${v.ten_loai}">${v.ten_loai}</td>
                            <td>${v.don_gia.toLocaleString()} VNĐ</td>
                            <td>${v.so_luong}</td>
                            <td>${tien.toLocaleString()} VNĐ</td>
                        </tr>
                    `;
                });

                html += `
                        </tbody>
                    </table>
                    <div style="text-align: right; margin-top: 10px;">
                        <strong>Tổng tiền vé:</strong> ${tongTienVe.toLocaleString()} VNĐ
                    </div>
                `;

                // Nếu có combo bắp nước
                let tongTienCombo = 0;
                if (combo && combo.length > 0) {
                    html += `
                        <h4 style="margin-top: 20px;">Combo bắp nước</h4>
                        <table id="ticket-combo-table" style="width:100%; margin-top:5px; border-collapse: collapse;">
                            <thead>
                                <tr><th>Sản phẩm</th><th>Đơn giá</th><th>Số lượng</th><th>Thành tiền</th></tr>
                            </thead>
                            <tbody>
                    `;

                    combo.forEach(c => {
                        const dg = parseInt(c.don_gia), sl = parseInt(c.so_luong);
                        const thanhTien = dg * sl;
                        tongTienCombo += thanhTien;
                        html += `
                            <tr>
                                <td title="${c.ten_bap_nuoc}">${c.ten_bap_nuoc}</td>
                                <td>${dg.toLocaleString()} VNĐ</td>
                                <td>${sl}</td>
                                <td>${thanhTien.toLocaleString()} VNĐ</td>
                            </tr>
                        `;
                    });

                    html += `
                            </tbody>
                        </table>
                        <div style="text-align: right; margin-top: 10px;">
                            <strong>Tổng tiền combo:</strong> ${tongTienCombo.toLocaleString()} VNĐ
                        </div>
                    `;
                }

                html += `
                    <div style="text-align: right; margin-top: 15px; font-size: 16px;">
                        <strong>Tổng cộng đơn hàng:</strong> ${parseInt(thongTin.tong_tien).toLocaleString()} VNĐ
                    </div>
                `;

                body.innerHTML = html;
            } else {
                body.innerHTML = '<p>Không tìm thấy chi tiết vé.</p>';
            }
        })
        .catch(err => {
            console.error('Lỗi khi load chi tiết vé:', err);
            body.innerHTML = '<p>Lỗi hệ thống.</p>';
        });
}


// Sự kiện đóng popup
document.getElementById('close-combo-popup').addEventListener('click', () => {
  document.getElementById('combo-detail-popup').classList.add('hidden');
});

document.getElementById('close-ticket-popup').addEventListener('click', () => {
  document.getElementById('ticket-detail-popup').classList.add('hidden');
});


document.addEventListener('DOMContentLoaded', function () {
    loadCustomerProfile();
    requestAnimationFrame(() => {
        setupAvatarUpload();
        setupProfileMenuNavigation();
        setupHeaderNavigation();
        updateCustomerProfile();
        changePassword();
        loadCombinedPurchaseHistory()

        // 👇 Xử lý đóng popup
        const closeBtn = document.getElementById('close-combo-popup');
        const popup = document.getElementById('combo-detail-popup');
        if (closeBtn && popup) {
            closeBtn.addEventListener('click', () => {
                console.log('Closing popup');
                popup.classList.add('hidden');
            });
        }
    });
});



