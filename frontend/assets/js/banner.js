axios.defaults.baseURL = 'http://127.0.0.1:3000';

async function loadBannerList() {
    try {
        const res = await axios.get('/api/banners');
        const banners = res.data;

        const bannerListContainer = document.getElementById('banner-list');
        bannerListContainer.innerHTML = '';

        banners.forEach(banner => {
            const imagePath = banner.image; 

            const card = document.createElement('div');
            card.classList.add('banner-card');

            card.innerHTML = `
                <img src="${imagePath}" alt="${banner.ten}" />
                <h3>${banner.ten}</h3>
                <p><strong>Bắt đầu:</strong> ${new Date(banner.ngay_bat_dau).toLocaleString()}</p>
                <p><strong>Kết thúc:</strong> ${new Date(banner.ngay_ket_thuc).toLocaleString()}</p>
                <p><strong>Trạng thái:</strong> ${banner.da_xoa ? 'Ẩn' : 'Hiển thị'}</p>
                <div class="actions">
                    <button onclick="editBanner(${banner.id})"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteBanner(${banner.id})"><i class="fas fa-trash-alt"></i></button>
                </div>
            `;

            bannerListContainer.appendChild(card);
        });

    } catch (error) {
        console.error('Lỗi khi load banner:', error);
    }
}

// Chuyển trang sửa banner
function editBanner(id) {
    window.location.href = `/frontend/pages/banner/edit.html?id=${id}`;
}

// Xóa banner
async function deleteBanner(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa banner này?')) return;

    try {
        await axios.delete(`/api/banners/${id}`);
        alert('Đã xóa banner!');
        loadBannerList();
    } catch (err) {
        console.error('Lỗi khi xóa banner:', err);
        alert('Không thể xóa banner.');
    }
}
//--Edit

// Lấy query param từ URL
function getBannerIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// Tải banner theo ID và đổ vào form
async function loadBannerForEdit() {
    const bannerId = getBannerIdFromURL();
    if (!bannerId) return;

    try {
        const res = await axios.get(`/api/banners/${bannerId}`);
        const banner = res.data;

        // Gán dữ liệu vào form
        document.getElementById("ten").value = banner.ten;
        document.getElementById("ngay_bat_dau").value = banner.ngay_bat_dau.split("T")[0];
        document.getElementById("ngay_ket_thuc").value = banner.ngay_ket_thuc.split("T")[0];
        document.getElementById("da_xoa").value = banner.da_xoa ? "1" : "0";
        document.getElementById("preview-image").src = banner.image;

    } catch (err) {
        console.error("Lỗi khi tải banner:", err);
        alert("Không thể tải dữ liệu banner");
    }
}

async function updateBanner(event) {
    event.preventDefault();

    const bannerId = getBannerIdFromURL();
    if (!bannerId) return alert("Không tìm thấy ID banner!");

    const form = document.getElementById("edit-banner-form");
    const formData = new FormData(form);

    // Gửi dữ liệu cập nhật (có thể bao gồm ảnh mới nếu chọn lại)
    try {
        await axios.put(`/api/banners/${bannerId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Cập nhật banner thành công!");
        window.location.href = "/frontend/pages/banner/list.html";
    } catch (err) {
        console.error("Lỗi khi cập nhật banner:", err);
        alert("Không thể cập nhật banner.");
    }
}

//--Add

async function createBanner(event) {
    event.preventDefault();

    const form = document.getElementById("add-banner-form");
    const formData = new FormData(form);

    try {
        const res = await axios.post('/api/banners', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        alert('Thêm banner thành công!');
        window.location.href = "/frontend/pages/banner/list.html";s
    } catch (err) {
        console.error('Lỗi khi thêm banner:', err);
        alert('Không thể thêm banner.');
    }
}

//Load banner ngoài index
let currentBannerIndex = 0;
let activeBanners = [];

async function loadHomepageBanner() {
    try {
        const res = await axios.get("/api/banners");
        const banners = res.data;

        const now = new Date();
        activeBanners = banners.filter(b => {
            const start = new Date(b.ngay_bat_dau);
            const end = new Date(b.ngay_ket_thuc);
            return !b.da_xoa && now >= start && now <= end;
        });

        if (activeBanners.length > 0) {
            currentBannerIndex = 0;
            updateBannerImage();
        
        setInterval(() => {
                if (activeBanners.length > 1) {
                    nextBanner();
                }
            }, 5000);
        }
    } catch (err) {
        console.error("Lỗi khi load banner:", err);
    }
}

function updateBannerImage() {
    const img = document.getElementById("banner-image");
    console.log('Active banners:', activeBanners);
    if (activeBanners.length <= 1) {
        document.querySelector('.banner-arrows').style.display = 'none';
    }
    if (img && activeBanners.length > 0) {
        const banner = activeBanners[currentBannerIndex];
        const imagePath = banner.image.startsWith('/')
            ? banner.image
            : `/frontend/assets/images/banner/${banner.image}`;
        img.src = imagePath;
        img.alt = banner.ten;
    }
}

function prevBanner() {
    if (activeBanners.length === 0) return;
    currentBannerIndex = (currentBannerIndex - 1 + activeBanners.length) % activeBanners.length;
    updateBannerImage();
}

function nextBanner() {
    if (activeBanners.length === 0) return;
    currentBannerIndex = (currentBannerIndex + 1) % activeBanners.length;
    updateBannerImage();
}

// Khởi động sau khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    if (path.includes('/banner/list.html')) {
        loadBannerList();
    } else if (path.includes('/banner/edit.html')) {
        loadBannerForEdit();
        document.getElementById("edit-banner-form").addEventListener("submit", updateBanner);
    } else if (
        path.endsWith('/index.html') ||
        path === '/' ||
        path.includes('/frontend/pages/index.html')
    ) {
        loadHomepageBanner();

        const leftBtn = document.querySelector('.banner-arrows button:first-child');
        const rightBtn = document.querySelector('.banner-arrows button:last-child');

        if (leftBtn) leftBtn.addEventListener('click', prevBanner);
        if (rightBtn) rightBtn.addEventListener('click', nextBanner);
        
    } else if (path.includes('/banner/add.html')) {
        const form = document.getElementById("add-banner-form");
        if (form) {
            form.addEventListener("submit", createBanner);
        }
    }
});


window.prevBanner = prevBanner;
window.nextBanner = nextBanner;
