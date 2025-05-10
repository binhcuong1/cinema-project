axios.defaults.baseURL = 'http://127.0.0.1:3000';


//#region === Hàm chung để lấy dữ liệu khuyến mãi ===
async function fetchPromotions() {
    try {
        const res = await axios.get("/api/promotions");
        if (!res.data || !res.data.data) {
            console.error("API không trả về dữ liệu hợp lệ:", res.data);
            return [];
        }
        console.log("Dữ liệu khuyến mãi thô:", res.data.data);
        return res.data.data;
    } catch (err) {
        console.error("Lỗi khi gọi API /api/promotions:", err.message, err.stack);
        return null;
    }
}
//#endregion

//#region === Hiển thị danh sách khuyến mãi (trang quản lý) ===
function renderPromotionCard(promo) {
    const card = document.createElement("div");
    card.className = "movie-card";
    const statusMapping = {
        dang_hoat_dong: "Đang hoạt động",
        chua_kich_hoat: "Chưa kích hoạt",
        het_han: "Hết hạn"
    };

    const trangThaiHienThi = statusMapping[promo.trang_thai] || promo.trang_thai;

    card.innerHTML = `
        <div class="movie-poster">
            <img src="${promo.image}" alt="${promo.ten_khuyen_mai}" />
        </div>
        <div class="movie-overlay">
            <button onclick="hrefToPromotionDetail('${promo.ma_khuyen_mai}')">Chi tiết</button>
            <button onclick="hrefToEditPromotion('${promo.ma_khuyen_mai}')">Sửa</button>
            <button class="delete-btn" onclick="deletePromotion('${promo.ma_khuyen_mai}', '${promo.da_xoa}')">Xóa</button>
        </div>
        <div class="movie-info">
            <h3>${promo.ten_khuyen_mai}</h3>
            <div class="movie-meta">
                <span><i class="fas fa-toggle-on"></i> ${trangThaiHienThi}</span>
                ${promo.da_xoa == 1 ? '<span class="deleted">(Đã xóa)</span>' : ''}
            </div>
        </div>
    `;

    return card;
}

async function fetchPromotionsToList() {
    const container = document.getElementById("promotion-list");
    if (!container) {
        console.error("Không tìm thấy #promotion-list! Kiểm tra HTML.");
        return;
    }

    const data = await fetchPromotions();
    if (data === null) {
        container.innerHTML = "<p class='error'>Không thể tải dữ liệu! Vui lòng kiểm tra kết nối hoặc server.</p>";
        return;
    }

    container.innerHTML = "";
    if (data.length === 0) {
        container.innerHTML = '<p class="no-results">Không có khuyến mãi nào.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    data.forEach(p => fragment.appendChild(renderPromotionCard(p)));
    container.appendChild(fragment);
}
//#endregion

//#region === Hiển thị carousel khuyến mãi (trang chủ) ===
function renderHomePromotionCard(promo) {
    const card = document.createElement("a");
    card.href = `/frontend/pages/promotion/detail.html?id=${promo.ma_khuyen_mai}`;
    card.className = "promo-card";
    card.innerHTML = `
        <img src="${promo.image}" alt="${promo.ten_khuyen_mai}" />
        <div class="promo-info">
            <h3>${promo.ten_khuyen_mai}</h3>
            <p>${promo.mo_ta}</p>
        </div>
    `;
    return card;
}

async function fetchHomePromotions() {
    const container = document.querySelector(".promo-grid");
    if (!container) {
        console.error("Không tìm thấy .promo-grid! Kiểm tra HTML trong index.html.");
        return;
    }

    const allPromos = await fetchPromotions();
    if (allPromos === null) {
        container.innerHTML = "<p class='error'>Không thể tải khuyến mãi! Vui lòng kiểm tra kết nối hoặc server.</p>";
        return;
    }

    // Lọc khuyến mãi cho trang chủ
    const filteredPromos = allPromos.filter(p => {
        const status = p.trang_thai?.toLowerCase();
        return (
            (status === "dang_hoat_dong" || status === "đang hoạt động" || status === "active") &&
            p.da_xoa == 0
        );
    });

    console.log("Số lượng khuyến mãi sau lọc:", filteredPromos.length);
    console.log("Danh sách khuyến mãi:", filteredPromos);

    container.innerHTML = "";
    if (filteredPromos.length === 0) {
        console.warn("Không có khuyến mãi nào thỏa mãn điều kiện!");
        container.innerHTML = "<p class='no-results'>Không có khuyến mãi hoạt động.</p>";
        return;
    }

    const fragment = document.createDocumentFragment();
    filteredPromos.forEach(promo => {
        const card = renderHomePromotionCard(promo);
        fragment.appendChild(card);
        console.log("Đã thêm card:", promo.ten_khuyen_mai);
    });
    container.appendChild(fragment);

    // Khởi tạo điều hướng carousel
    const grid = document.querySelector(".promo-grid");
    const leftArrow = document.querySelector("#promo-left");
    const rightArrow = document.querySelector("#promo-right");

    if (!leftArrow || !rightArrow) {
        console.error("Không tìm thấy nút điều hướng:", { leftArrow, rightArrow });
        return;
    }

    const cardWidth = grid.querySelector(".promo-card")?.offsetWidth + 20 || 400; // Chiều rộng card + gap, mặc định 400px
    console.log("Chiều rộng card:", cardWidth);

    function updateArrowState() {
        leftArrow.disabled = grid.scrollLeft <= 0;
        rightArrow.disabled = grid.scrollLeft >= grid.scrollWidth - grid.clientWidth - 1;
        console.log("Scroll position:", grid.scrollLeft, "Max scroll:", grid.scrollWidth - grid.clientWidth);
    }

    leftArrow.addEventListener("click", () => {
        console.log("Nhấn nút trái");
        grid.scrollLeft -= cardWidth; // Cuộn trái 1 card
        updateArrowState();
    });

    rightArrow.addEventListener("click", () => {
        console.log("Nhấn nút phải");
        grid.scrollLeft += cardWidth; // Cuộn phải 1 card
        updateArrowState();
    });

    grid.addEventListener("scroll", updateArrowState);
    updateArrowState();
}
//#endregion



//#region === Chuyển trang ===
function hrefToPromotionDetail(id) {
    window.location.href = `/frontend/pages/promotion/detail.html?id=${id}`;
}

function hrefToEditPromotion(id) {
    window.location.href = `/frontend/pages/promotion/edit.html?id=${id}`;
}
//#endregion

//#region === Thêm khuyến mãi ===
async function handleAddPromotionSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    try {
        const res = await axios.post("/api/promotions", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });

        if (res.status === 201) {
            alert("🎉 Thêm khuyến mãi thành công!");
        } else {
            alert("Có lỗi xảy ra khi thêm khuyến mãi!");
        }
    } catch (error) {
        console.error("Lỗi khi gửi form:", error);
        alert("❌ " + (error.response?.data?.error || "Không thể thêm khuyến mãi!"));
    }
}
//#endregion

//#region === Xóa khuyến mãi ===
async function deletePromotion(id, da_xoa) {
    if (da_xoa == 1) {
        alert("Khuyến mãi này đã bị xóa trước đó!");
        return;
    }

    if (!confirm("Bạn có chắc chắn muốn xóa khuyến mãi này không?")) return;

    try {
        const res = await axios.delete(`/api/promotions/${id}`);
        if (res.data.success === true || res.data.success === "true") {
            alert("✅ Đã xóa khuyến mãi!");
            fetchPromotionsToList();
        }
    } catch (err) {
        console.error("Lỗi khi xóa:", err);
        alert("❌ Lỗi khi xóa khuyến mãi!");
    }
}
//#endregion

//#region === Sửa khuyến mãi ===
async function handleEditPromotionSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const promoId = form.dataset.promoId;
    const formData = new FormData(form);

    try {
        const res = await axios.put(`/api/promotions/${promoId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });

        if (res.status === 200) {
            alert("Cập nhật thành công!");
            window.location.href = "/frontend/pages/promotion/list.html";
        }
    } catch (err) {
        console.error("Lỗi khi cập nhật:", err);
        alert("❌ Cập nhật thất bại!");
    }
}

async function showEditPromotionForm() {
    const urlParams = new URLSearchParams(window.location.search);
    const promoId = urlParams.get("id");
    const section = document.getElementById("sectionEdit");

    if (!promoId || !section) return;

    try {
        const res = await axios.get(`/api/promotions/${promoId}`);
        if (!res.data.success || !res.data.data || res.data.data.length === 0)
            throw new Error("Không tìm thấy khuyến mãi!");

        const promo = res.data.data[0];

        section.innerHTML = `
        <div class="form-container">
    <form id="edit-promotion-form" class="add-movie-form" enctype="multipart/form-data">
        <div class="form-grid">
            <div class="form-column">
                <div class="form-group">
                    <label for="promotion-name">Tên khuyến mãi:</label>
                    <input type="text" id="promotion-name" name="ten_khuyen_mai" value="${promo.ten_khuyen_mai}" required />
                </div>
                <div class="form-group">
                    <label for="promotion-description">Mô tả:</label>
                    <textarea id="promotion-description" name="mo_ta" required>${promo.mo_ta}</textarea>
                </div>
                <div class="form-group">
                    <label for="promotion-condition">Điều kiện:</label>
                    <input type="text" id="promotion-condition" name="dieu_kien" value="${promo.dieu_kien || ''}" required />
                </div>
                <div class="form-group">
                    <label for="promotion-note">Lưu ý:</label>
                    <textarea id="promotion-note" name="luu_y">${promo.luu_y || ''}</textarea>
                </div>
            </div>
            <div class="form-column">
                <div class="form-group">
                    <label for="start-time">Giờ bắt đầu:</label>
                    <input type="time" id="start-time" name="gio_bat_dau" value="${promo.gio_bat_dau ? promo.gio_bat_dau.slice(0, 5) : ''}" required />
                </div>
                <div class="form-group">
                    <label for="end-time">Giờ kết thúc:</label>
                    <input type="time" id="end-time" name="gio_ket_thuc" value="${promo.gio_ket_thuc ? promo.gio_ket_thuc.slice(0, 5) : ''}" required />
                </div>
                <div class="form-group">
                    <label for="promotion-status">Trạng thái:</label>
                    <select id="promotion-status" name="trang_thai" required>
                        <option value="chua_kich_hoat" ${promo.trang_thai === 'chua_kich_hoat' ? 'selected' : ''}>Chưa kích hoạt</option>
                        <option value="dang_hoat_dong" ${promo.trang_thai === 'dang_hoat_dong' ? 'selected' : ''}>Đang hoạt động</option>
                        <option value="het_han" ${promo.trang_thai === 'het_han' ? 'selected' : ''}>Hết hạn</option>
                    </select>
                </div>
                <div class="form-group poster-upload">
                    <label for="promotion-image">Hình ảnh:</label>
                    <div class="poster-preview-container">
                        <div class="upload-controls">
                            <label for="promotion-image" class="custom-file-upload">
                                <i class="fas fa-upload"></i> Chọn ảnh
                            </label>
                            <input type="file" id="promotion-image" name="image" accept="image/*" />
                            <p class="file-requirements">Định dạng: JPG, PNG. Kích thước tối đa: 5MB</p>
                            <p>Hình ảnh hiện tại: <img src="${promo.image}" alt="Hình ảnh khuyến mãi hiện tại" style="max-width: 100px; max-height: 100px;" /></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="form-actions">
            <button type="button" class="back-btn" onclick="window.location.href='/frontend/pages/promotion/list.html'">
                <i class="fas fa-arrow-left"></i> Quay lại
            </button>
            <button type="submit" class="next-btn">
                <i class="fas fa-edit"></i> Cập nhật
            </button>
        </div>
    </form>
</div>
    `;
        // section.innerHTML = `
        // <div class="form-container">
        //     <form id="edit-promotion-form" class="add-movie-form" enctype="multipart/form-data">
        //         <div class="form-group">
        //             <label>Tên khuyến mãi:</label>
        //             <input type="text" name="ten_khuyen_mai" value="${promo.ten_khuyen_mai}" required />
        //         </div>
        //         <div class="form-group">
        //             <label>Mô tả:</label>
        //             <textarea name="mo_ta" required>${promo.mo_ta}</textarea>
        //         </div>
        //         <div class="form-group">
        //             <label>Điều kiện:</label>
        //             <input type="text" name="dieu_kien" value="${promo.dieu_kien || ''}" required />
        //         </div>
        //         <div class="form-group">
        //             <label>Lưu ý:</label>
        //             <textarea name="luu_y">${promo.luu_y || ''}</textarea>
        //         </div>
        //         <div class="form-group">
        //             <label>Giờ bắt đầu:</label>
        //             <input type="time" name="gio_bat_dau" value="${promo.gio_bat_dau ? promo.gio_bat_dau.slice(0, 5) : ''}" required />
        //         </div>
        //         <div class="form-group">
        //             <label>Giờ kết thúc:</label>
        //             <input type="time" name="gio_ket_thuc" value="${promo.gio_ket_thuc ? promo.gio_ket_thuc.slice(0, 5) : ''}" required />
        //         </div>
        //         <div class="form-group">
        //             <label>Trạng thái:</label>
        //             <select name="trang_thai">
        //                 <option value="chua_kich_hoat" ${promo.trang_thai === 'chua_kich_hoat' ? 'selected' : ''}>Chưa kích hoạt</option>
        //                 <option value="dang_hoat_dong" ${promo.trang_thai === 'dang_hoat_dong' ? 'selected' : ''}>Đang hoạt động</option>
        //                 <option value="het_han" ${promo.trang_thai === 'het_han' ? 'selected' : ''}>Hết hạn</option>
        //             </select>
        //         </div>
        //         <div class="form-group">
        //             <label>Hình ảnh:</label>
        //             <input type="file" name="image" accept="image/*" />
        //             <p>Hiện tại: <img src="${promo.image}" style="max-height: 100px" /></p>
        //         </div>
        //         <div class="form-actions">
        //             <button type="button" class="back-btn" onclick="window.location.href='/frontend/pages/promotion/list.html'">← Quay lại</button>
        //             <button type="submit">Cập nhật</button>
        //         </div>
        //     </form>
        // </div>
        // `;

        const form = document.getElementById("edit-promotion-form");
        if (form) {
            form.dataset.promoId = promo.ma_khuyen_mai;
            form.addEventListener("submit", handleEditPromotionSubmit);
        }
    } catch (error) {
        section.innerHTML = `<p class="error">Không thể tải dữ liệu: ${error.message}</p>`;
    }
}
//#endregion

//#region === Hiện chi tiết khuyến mãi ===
async function showPromotionDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const promoId = urlParams.get("id");
    const section = document.getElementById("promotionDetail");

    if (!promoId || !section) return;

    try {
        const res = await axios.get(`/api/promotions/${promoId}`);
        const promo = res.data.data[0];

        const trangThaiMapping = {
            "dang_hoat_dong": "Đang hoạt động",
            "chua_kich_hoat": "Chưa kích hoạt",
            "het_han": "Hết hạn"
        };
        const trangThaiHienThi = trangThaiMapping[promo.trang_thai] || promo.trang_thai;

        const trangThaiXoa = promo.da_xoa == 1 ? "Đã xóa" : "Chưa xóa";

        section.innerHTML = `
        <div class="movie-details-container">
    <div class="movie-poster">
        <img src="${promo.image}" alt="${promo.ten_khuyen_mai}" aria-label="Hình ảnh khuyến mãi ${promo.ten_khuyen_mai}">
    </div>
    <div class="movie-info-details">
        <h2>${promo.ten_khuyen_mai}</h2>
        <div class="movie-meta-details">
            <p><i class="fas fa-clock"></i> <strong>Giờ bắt đầu:</strong> ${promo.gio_bat_dau}</p>
            <p><i class="fas fa-clock"></i> <strong>Giờ kết thúc:</strong> ${promo.gio_ket_thuc}</p>
            <p><i class="fas fa-tags"></i> <strong>Trạng thái:</strong> ${trangThaiHienThi}</p>
            <p><i class="fas fa-exclamation-circle"></i> <strong>Điều kiện:</strong> ${promo.dieu_kien || 'Không có'}</p>
            <p><i class="fas fa-trash"></i> <strong>Xóa mềm:</strong> ${trangThaiXoa}</p>
        </div>
        <div class="movie-description">
            <h3>Mô tả:</h3>
            <p>${promo.mo_ta}</p>
        </div>
        <div class="movie-content">
            <h3>Lưu ý:</h3>
            <p>${promo.luu_y || 'Không có'}</p>
        </div>
    </div>
</div>
        `;

        //     section.innerHTML = `
        //     <div class="movie-details-container">
        //       <div class="movie-poster">
        //         <img src="${promo.image}" alt="${promo.ten_khuyen_mai}" />
        //       </div>
        //       <div class="movie-info-details">
        //         <h2>${promo.ten_khuyen_mai}</h2>
        //         <p><strong>Mô tả:</strong> ${promo.mo_ta}</p>
        //         <p><strong>Điều kiện:</strong> ${promo.dieu_kien}</p>
        //         <p><strong>Lưu ý:</strong> ${promo.luu_y || 'Không có'}</p>
        //         <p><strong>Giờ bắt đầu:</strong> ${promo.gio_bat_dau}</p>
        //         <p><strong>Giờ kết thúc:</strong> ${promo.gio_ket_thuc}</p>
        //         <p><strong>Trạng thái:</strong> ${trangThaiHienThi}</p>
        //         <p><strong>Xóa mềm:</strong> ${trangThaiXoa}</p>
        //       </div>
        //     </div>
        //   `;
    } catch (error) {
        console.error("Lỗi khi tải chi tiết khuyến mãi:", error);
        section.innerHTML = `<p class="error">Không thể tải chi tiết: ${error.message}</p>`;
    }
}
//#endregion

//#region === Hiện ở trang khuyến mãi ===
async function fetchActivePromotions() {
    const container = document.getElementById("promo-slider");
    try {
        const res = await axios.get("/api/promotions");
        const data = res.data.data;

        container.innerHTML = "";
        const activePromos = data.filter(p => p.trang_thai === "dang_hoat_dong" && p.da_xoa === 0);

        if (activePromos.length === 0) {
            container.innerHTML = "<p class='no-results'>Không có khuyến mãi hoạt động.</p>";
            return;
        }

        activePromos.forEach((promo, index) => {
            const card = document.createElement("div");
            card.className = "promo-card" + (index % 2 === 1 ? " reversed" : "");
            card.innerHTML = `
          <div class="promo-info">
            <h3>${promo.ten_khuyen_mai}</h3>
            <p>${promo.mo_ta}</p>
            <p><strong>Điều kiện:</strong> ${promo.dieu_kien}</p>
            <p><strong>Lưu ý:</strong> ${promo.luu_y || "Không có"}</p>
            <a href="booking/select-showtime.html" class="promo-btn">Đặt Vé Ngay</a>
          </div>
          <div class="promo-image">
            <img src="${promo.image}" alt="${promo.ten_khuyen_mai}">
          </div>
        `;
            container.appendChild(card);
        });
    } catch (err) {
        console.error("Lỗi khi load khuyến mãi:", err);
        container.innerHTML = `<p class='error'>Không thể tải dữ liệu!</p>`;
    }
}
//#endregion

//#region === Init ===
document.addEventListener('DOMContentLoaded', () => {
    const currentPage = document.body.dataset.page;
    console.log("Trang hiện tại:", currentPage);

    switch (currentPage) {
        case "index":
            fetchHomePromotions();
            break;
        case "promotions":
            fetchActivePromotions();
            break;
        case "promotion-list":
            fetchPromotionsToList();
            break;
        case "promotion-add":
            const addForm = document.getElementById("add-promotion-form");
            if (addForm) {
                addForm.addEventListener("submit", handleAddPromotionSubmit);
            }
            break;
        case "promotion-edit":
            showEditPromotionForm();
            break;
        case "promotion-detail":
            showPromotionDetail();
            break;
        default:
            console.log("Trang không xác định:", currentPage);
    }
});
//#endregion