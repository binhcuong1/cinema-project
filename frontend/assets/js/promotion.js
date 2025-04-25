axios.defaults.baseURL = 'http://127.0.0.1:3000';

// =================== THÊM KHUYẾN MÃI ===================
async function submitAddPromotion() {
    const data = getPromotionFormData();

    try {
        const response = await axios.post('/api/promotions', data);
        const result = response.data;

        if (result.success !== "true") throw new Error(result.message || "Thêm khuyến mãi thất bại");

        alert("🎉 Thêm khuyến mãi thành công!");
        window.location.href = "/frontend/pages/index.html";
    } catch (error) {
        console.error("Lỗi khi thêm khuyến mãi:", error);
        alert("❌ Thêm khuyến mãi thất bại!");
    }
}

// =================== CẬP NHẬT KHUYẾN MÃI ===================
async function submitEditPromotion(id) {
    const data = getPromotionFormData();

    try {
        const response = await axios.put(`/api/promotions/${id}`, data);
        const result = response.data;

        if (result.success !== "true") throw new Error(result.message || "Cập nhật thất bại");

        alert("✅ Cập nhật thành công!");
        window.location.reload();
    } catch (error) {
        console.error("Lỗi cập nhật:", error);
        alert("❌ Cập nhật khuyến mãi thất bại!");
    }
}

// =================== LẤY DỮ LIỆU FORM ===================
function getPromotionFormData() {
    return {
        ten_khuyen_mai: document.getElementById('ten_khuyen_mai').value,
        mo_ta: document.getElementById('mo_ta').value,
        dieu_kien: document.getElementById('dieu_kien').value,
        luu_y: document.getElementById('luu_y').value,
        trang_thai: document.getElementById('trang_thai').value,
        image: document.getElementById('image').value,
        gia_2d: parseInt(document.getElementById('gia_2d').value) || null,
        gia_3d: parseInt(document.getElementById('gia_3d').value) || null,
        gio_bat_dau: document.getElementById('gio_bat_dau').value,
        gio_ket_thuc: document.getElementById('gio_ket_thuc').value,
        ngay_trong_tuan: document.getElementById('ngay_trong_tuan').value,
        doi_tuong: document.getElementById('doi_tuong').value
    };
}

//LOAD DANH SÁCH KHUYẾN MÃI
async function loadPromotionOptions() {
    try {
        const res = await axios.get('/api/promotions');
        const select = document.getElementById('promotion-select');
        res.data.data.forEach(item => {
            const option = document.createElement('option');
            option.value = item.ma_khuyen_mai;
            option.textContent = item.ten_khuyen_mai;
            select.appendChild(option);
        });
    } catch (err) {
        console.error("Lỗi khi tải danh sách khuyến mãi:", err);
        alert("❌ Không thể tải danh sách khuyến mãi!");
    }
}

async function loadPromotionDetail(id) {
    try {
        const res = await axios.get(`/api/promotions/${id}`);
        const data = res.data.data[0];

        document.getElementById('form-fields').style.display = 'block';
        document.getElementById('ten_khuyen_mai').value = data.ten_khuyen_mai;
        document.getElementById('mo_ta').value = data.mo_ta;
        document.getElementById('dieu_kien').value = data.dieu_kien;
        document.getElementById('luu_y').value = data.luu_y;
        document.getElementById('trang_thai').value = data.trang_thai;
        document.getElementById('image').value = data.image;
        document.getElementById('gia_2d').value = data.gia_2d;
        document.getElementById('gia_3d').value = data.gia_3d;
        document.getElementById('gio_bat_dau').value = data.gio_bat_dau;
        document.getElementById('gio_ket_thuc').value = data.gio_ket_thuc;
        document.getElementById('ngay_trong_tuan').value = data.ngay_trong_tuan;
        document.getElementById('doi_tuong').value = data.doi_tuong;

        const form = document.getElementById('edit-promotion-form');
        form.onsubmit = (e) => {
            e.preventDefault();
            submitEditPromotion(id);
        };
    } catch (err) {
        console.error("Lỗi khi tải chi tiết khuyến mãi:", err);
        alert("❌ Không thể tải chi tiết khuyến mãi!");
    }
}
// =================== XOÁ KHUYẾN MÃI ===================
async function handleDeletePromotion(e) {
    e.preventDefault();
    const select = document.getElementById("promotion-select");
    const id = select.value;

    if (!id) {
        alert("⚠️ Vui lòng chọn khuyến mãi để xoá.");
        return;
    }

    if (!confirm("Bạn có chắc chắn muốn xoá khuyến mãi này?")) return;

    try {
        const res = await axios.delete(`/api/promotions/${id}`);
        if (res.data.success === true || res.data.success === "true") {
            alert("✅ Đã xoá thành công!");
            window.location.reload();
        } else {
            throw new Error("Xoá thất bại!");
        }
    } catch (err) {
        console.error("Lỗi xoá:", err);
        alert("❌ Không thể xoá khuyến mãi!");
    }
}

// =================== ONLOAD ===================
window.onload = () => {
    const currentPage = document.body.dataset.page;

    if (currentPage === 'promotion-add') {
        const form = document.getElementById('add-promotion-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            submitAddPromotion();
        });
    }

    if (currentPage === 'promotion-edit') {
        loadPromotionOptions();
        const select = document.getElementById('promotion-select');
        select?.addEventListener('change', (e) => {
            const id = e.target.value;
            if (id) loadPromotionDetail(id);
        });
    }
    if (currentPage === 'promotion-delete') {
        loadPromotionOptions();
        document.getElementById("delete-promotion-form")
            .addEventListener("submit", handleDeletePromotion);
    }
};
