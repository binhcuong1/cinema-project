// popcorn-drink.js
axios.defaults.baseURL = "http://127.0.0.1:3000";

let popcornCart = {};

function formatCurrency(amount) {
  const roundedAmount = Math.round(amount); // Loại bỏ số thập phân
  return roundedAmount.toLocaleString("vi-VN") + " đ"; // Thêm đơn vị tiền tệ
}

// === Hiển thị dạng khách hàng: nhóm theo loại ===
async function fetchAllPopcornDrinks() {
  try {
    const [resLoai, resItems] = await Promise.all([
      axios.get("/api/popcorn-drink/loai"),
      axios.get("/api/popcorn-drink"),
    ]);

    const loaiList = resLoai.data.data;
    const allItems = resItems.data.data;

    const container = document.getElementById("popcorn-list");
    if (container) container.innerHTML = "";

    loaiList.forEach((loai) => {
      const group = document.createElement("div");
      group.className = "popcorn-group";

      const title = document.createElement("h3");
      title.innerText = loai.ten_loai;
      title.className = "popcorn-group-title";

      const groupList = document.createElement("div");
      groupList.className = "popcorn-items";

      const filtered = allItems.filter((item) => item.ma_loai === loai.ma_loai);
      if (filtered.length === 0) {
        groupList.innerHTML = '<p class="no-results">Không có sản phẩm.</p>';
      } else {
        filtered.forEach((item) => {
          const quantity = getCartQuantity(item.ma_bap_nuoc);
          const card = document.createElement("div");
          card.className = "popcorn-card";
          card.innerHTML = `
            <img src="${
              item.image || "/frontend/assets/images/popcorn-drink/default.jpg"
            }" alt="${item.ten_bap_nuoc}">
            <div class="card-content">
              <h4>${item.ten_bap_nuoc}</h4>
              <p>${formatCurrency(
                item.don_gia
              )}</p> <!-- Sử dụng formatCurrency -->
              <div class="quantity-control" data-id="${
                item.ma_bap_nuoc
              }" data-price="${item.don_gia}">
                <button class="minus">−</button>
                <span class="quantity">0</span>
                <button class="plus">+</button>
              </div>
            </div>
          `;
          groupList.appendChild(card);
        });
      }

      group.appendChild(title);
      group.appendChild(groupList);
      container.appendChild(group);
    });

    setTimeout(setupQuantityControls, 0);
  } catch (error) {
    console.error("Lỗi khi load bắp nước:", error);
  }
}

function getCartQuantity(itemId) {
  return popcornCart[itemId] || 0;
}

function updateCart(itemId, quantity) {
  if (quantity > 0) {
    popcornCart[itemId] = quantity;
  } else {
    delete popcornCart[itemId];
  }
  renderCart();
}

function setupQuantityControls() {
  const controls = document.querySelectorAll(".quantity-control");

  controls.forEach((control) => {
    const itemId = control.getAttribute("data-id");
    const price = parseFloat(control.getAttribute("data-price"));
    const quantitySpan = control.querySelector(".quantity");
    const minusBtn = control.querySelector(".minus");
    const plusBtn = control.querySelector(".plus");

    // Xóa sự kiện cũ
    const minusClone = minusBtn.cloneNode(true);
    const plusClone = plusBtn.cloneNode(true);
    minusBtn.parentNode.replaceChild(minusClone, minusBtn);
    plusBtn.parentNode.replaceChild(plusClone, plusBtn);

    // Gắn lại sự kiện
    minusClone.addEventListener("click", () => {
      let quantity = parseInt(quantitySpan.textContent);
      if (quantity > 0) {
        quantity--;
        quantitySpan.textContent = quantity;
        updateCart(itemId, quantity);
      }
    });

    plusClone.addEventListener("click", () => {
      let quantity = parseInt(quantitySpan.textContent);
      quantity++;
      quantitySpan.textContent = quantity;
      updateCart(itemId, quantity);
    });
  });
}

function renderCart() {
  const container = document.getElementById("popcorn-cart");
  const totalSpan = document.getElementById("popcorn-total");
  const cartWrapper = document.getElementById("popcorn-cart-wrapper");

  if (!container || !totalSpan || !cartWrapper) return;

  container.innerHTML = "";
  let total = 0;
  let hasItems = false;

  Object.keys(popcornCart).forEach((id) => {
    const quantity = popcornCart[id];
    if (quantity > 0) {
      hasItems = true;
      const card = document.querySelector(`.quantity-control[data-id='${id}']`);
      if (card) {
        const name = card
          .closest(".popcorn-card")
          .querySelector("h4").textContent;
        const price = parseFloat(card.getAttribute("data-price"));
        const line = document.createElement("p");
        line.textContent = `${quantity} x ${name} - ${formatCurrency(
          price * quantity
        )}`; // Sử dụng formatCurrency
        container.appendChild(line);
        total += quantity * price;
      }
    }
  });

  totalSpan.textContent = formatCurrency(total); // Sử dụng formatCurrency cho tổng cộng

  if (hasItems) {
    cartWrapper.classList.remove("hidden");
  } else {
    cartWrapper.classList.add("hidden");
  }
}

async function saveOrderToSessionStorage() {
  try {
    const response = await axios.get('/api/users/me', {
      withCredentials: true
    });

    // Kiểm tra nếu API trả về success: false
    if (!response.data.success) {
      alert('Vui lòng đăng nhập để tiếp tục thanh toán!');
      return false;
    }

    const { ma_tai_khoan } = response.data.data;

    // 2. Lấy thông tin rạp từ #theater-select
    const theaterSelect = document.getElementById('theater-select');
    const ma_rap = theaterSelect.value;
    const ten_rap = theaterSelect.options[theaterSelect.selectedIndex]?.text || 'Chưa chọn rạp';

    if (!ma_rap) {
      alert('Vui lòng chọn rạp trước khi thanh toán!');
      return false;
    }

    // 3. Tổng hợp danh sách combo từ popcornCart
    const orderItems = [];
    let tong_tien = 0;

    Object.keys(popcornCart).forEach(id => {
      const quantity = popcornCart[id];
      if (quantity > 0) {
        const card = document.querySelector(`.quantity-control[data-id='${id}']`);
        if (card) {
          const ten_bap_nuoc = card.closest('.popcorn-card').querySelector('h4').textContent;
          const don_gia = parseFloat(card.getAttribute('data-price'));
          const subtotal = quantity * don_gia;

          orderItems.push({
            ma_bap_nuoc: id,
            ten_bap_nuoc,
            so_luong: quantity,
            don_gia
          });

          tong_tien += subtotal;
        }
      }
    });

    if (orderItems.length === 0) {
      alert('Giỏ hàng trống! Vui lòng chọn ít nhất một combo.');
      return false;
    }

    // 4. Tạo thời gian đặt
    const thoi_gian_dat = new Date().toISOString();

    // 5. Tạo đối tượng đơn hàng
    const orderData = {
      ma_rap,
      ten_rap,
      thoi_gian_dat,
      tong_tien,
      ma_tai_khoan,
      trang_thai: 'Chưa thanh toán',
      items: orderItems
    };

    // 6. Lưu vào sessionStorage
    sessionStorage.setItem('popcornOrder', JSON.stringify(orderData));

    return true;
  } catch (error) {
    console.error('Lỗi khi kiểm tra đăng nhập:', error);

    // Kiểm tra nếu lỗi là 401 (Unauthorized)
    if (error.response && error.response.status === 401) {
      alert('Vui lòng đăng nhập để tiếp tục thanh toán!');
    } else {
      alert('Đã xảy ra lỗi. Vui lòng thử lại!');
    }
    return false;
  }
}

async function loadTheaterList() {
  try {
    const res = await axios.get("/api/theaters");
    const theaters = res.data.data;

    const select = document.getElementById("theater-select");
    if (!select) return;

    theaters
      .filter((t) => t.da_xoa !== 1)
      .forEach((theater) => {
        const option = document.createElement("option");
        option.value = theater.ma_rap;
        option.textContent = theater.ten_rap;
        select.appendChild(option);
      });
  } catch (error) {
    console.error("Lỗi khi tải danh sách rạp:", error);
  }
}

// === Hiển thị dạng quản trị: danh sách có sửa/xóa ===
async function loadPopcornList() {
  try {
    const res = await axios.get("/api/popcorn-drink");
    const list = res.data.data;
    const container = document.getElementById("popcorn-list");
    container.innerHTML = "";

    if (list.length === 0) {
      container.innerHTML =
        '<p class="no-results">Không có combo bắp nước nào.</p>';
      return;
    }

    list.forEach((item) => {
      const card = document.createElement("div");
      card.className = "movie-card";
      card.innerHTML = `
        <div class="movie-poster">
          <img src="${
            item.image || "/frontend/assets/images/popcorn-drink/default.jpg"
          }" alt="${item.ten_bap_nuoc}">
        </div>
        <div class="movie-overlay">
          <button onclick="editPopcorn(${
            item.ma_bap_nuoc
          })"><i class="fas fa-edit"></i> Sửa</button>
          <button onclick="deletePopcorn(${
            item.ma_bap_nuoc
          })" class="delete-btn"><i class="fas fa-trash"></i> Xóa</button>
        </div>
        <div class="movie-info">
          <h3>${item.ten_bap_nuoc}</h3>
          <p><strong>Loại:</strong> ${item.ten_loai}</p>
          <p><strong>Giá:</strong> ${item.don_gia.toLocaleString()} đ</p>
        </div>
      `;
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Lỗi khi tải danh sách bắp nước:", err);
  }
}

function editPopcorn(id) {
  window.location.href = `/frontend/pages/popcorn-drink/edit.html?id=${id}`;
}

async function deletePopcorn(id) {
  if (!confirm("Bạn có chắc chắn muốn xóa combo này không?")) return;
  try {
    const res = await axios.delete(`/api/popcorn-drink/${id}`);
    if (res.data.success) {
      alert("✅ Đã xóa combo!");
      loadPopcornList();
    }
  } catch (err) {
    console.error("Lỗi khi xóa:", err);
    alert("❌ Không thể xóa combo!");
  }
}

// === Gửi form thêm combo ===
async function handleAddPopcorn(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await axios.post("/api/popcorn-drink", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (res.data.success) {
      alert("🎉 Thêm combo thành công!");
      form.reset();
    }
  } catch (err) {
    console.error("Lỗi khi thêm combo:", err);
    alert("❌ Không thể thêm combo!");
  }
}

// === Load danh sách loại vào select ===
async function loadLoaiBapNuocSelect() {
  try {
    const res = await axios.get("/api/popcorn-drink/loai");
    const select = document.getElementById("ma_loai");
    res.data.data.forEach((loai) => {
      const option = document.createElement("option");
      option.value = loai.ma_loai;
      option.textContent = loai.ten_loai;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Lỗi khi load loại:", err);
  }
}

// === Load dữ liệu combo cần sửa ===
async function loadEditPopcornForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = urlParams.get("id");
  if (!id) return alert("❌ Không tìm thấy ID combo");

  try {
    const res = await axios.get(`/api/popcorn-drink/${id}`);
    const combo = res.data.data;

    if (!combo) return alert("❌ Combo không tồn tại!");

    document.getElementById("ten_bap_nuoc").value = combo.ten_bap_nuoc;
    document.getElementById("don_gia").value = combo.don_gia;
    document.getElementById(
      "current-image"
    ).innerHTML = `<img src="${combo.image}" alt="" style="max-height:80px">`;

    await loadLoaiBapNuocSelect();
    document.getElementById("ma_loai").value = combo.ma_loai;

    const form = document.getElementById("edit-popcorn-form"); // ✅ chuyển lên đúng vị trí
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      try {
        const res = await axios.put(`/api/popcorn-drink/${id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data.success) {
          alert("✅ Đã cập nhật combo!");
          window.location.href = "/frontend/pages/popcorn-drink/list.html";
        }
      } catch (err) {
        console.error("Lỗi khi cập nhật:", err);
        alert("❌ Không thể cập nhật combo!");
      }
    });
  } catch (err) {
    console.error("Lỗi khi tải combo:", err);
  }
}

// === Khởi tạo ===
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;

  const checkoutBtn = document.getElementById("checkout-btn");
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", async () => {
      const success = await saveOrderToSessionStorage();
      if (success) {
        window.location.href = "/frontend/pages/popcorn-drink/popcorn-checkout.html";
      }
    });
  }

  if (page === "popcorn") {
    fetchAllPopcornDrinks();
    loadTheaterList();
  } else if (page === "popcorn-admin") {
    loadPopcornList();
  } else if (page === "add-popcorn") {
    const form = document.getElementById("add-popcorn-form");
    if (form) form.addEventListener("submit", handleAddPopcorn);
    loadLoaiBapNuocSelect();
  } else if (page === "edit-popcorn") {
    loadEditPopcornForm();
  }
});
