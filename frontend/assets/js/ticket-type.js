axios.defaults.baseURL = "http://localhost:3000";

//#region === Khu vực Hàm Chung ===

// Hàm hiển thị thông báo lỗi trong container
function showError(container, message) {
  container.innerHTML = `<p class='error'>${message}</p>`;
}

// Hàm tạo HTML cho một thẻ loại vé
function createTicketTypeCard(ticketType) {
  const donGia = parseFloat(ticketType.don_gia); // Chuyển thành số
  const formattedDonGia = donGia % 1 === 0 ? donGia.toLocaleString('vi-VN') : donGia.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const isDeleted = ticketType.da_xoa === 1 ? " (Đã xóa)" : "";

  return `
    <div class="ticket-type-card">
        <div class="ticket-type-info">
            <h3>${ticketType.ten_loai}</h3>
            <p><i class="fas fa-money-bill-wave"></i> Giá: ${formattedDonGia} VNĐ</p>
            <p><i class="fas fa-garbage"></i> ${isDeleted} </p>
        </div>
        <div class="ticket-type-actions">
            <button class="edit-btn" onclick="editTicketType('${ticketType.ma_loai}')"><i class="fas fa-edit"></i> Sửa</button>
            <button class="delete-btn" onclick="deleteTicketType('${ticketType.ma_loai}', ${ticketType.da_xoa})"><i class="fas fa-trash-alt"></i> Xóa</button>
        </div>
    </div>
  `;
}

// Hàm tạo HTML cho modal thêm/sửa loại vé
function createTicketTypeModalHTML(id, ticketType = null) {
  let formattedDonGia = null;
  if (ticketType) {
    const donGia = parseFloat(ticketType.don_gia); // Chuyển thành số
    formattedDonGia = donGia % 1 === 0 ? donGia.toLocaleString('vi-VN') : donGia.toLocaleString('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  return `
    <div class="auth-container">
      <button class="close-form-btn">×</button>
      <h2>${id ? "Sửa Loại Vé" : "Thêm Loại Vé"}</h2>
      <form id="ticket-type-form">
        <div class="input-group">
          <label for="ticket-type-name">Tên vé</label>
          <input type="text" id="ticket-type-name" name="ten_loai" value="${ticketType ? ticketType.ten_loai : ""}" placeholder="Nhập tên vé" required>
        </div>
        <div class="input-group">
          <label for="ticket-type-price">Giá vé (VNĐ)</label>
          <input type="number" id="ticket-type-price" name="don_gia" value="${formattedDonGia ? formattedDonGia : ""}" placeholder="Nhập giá vé" required min="0">        </div>
        <button type="submit" class="auth-btn">${id ? "Cập Nhật" : "Thêm"}</button>
      </form>
    </div>
  `;
}

//#endregion

//#region === Khu vực Hiển thị Danh sách Loại Vé ===

// Hiển thị danh sách loại vé
async function renderList() {
  const ticketTypeList = document.getElementById("ticket-type-list");
  if (!ticketTypeList) return;

  try {
    const response = await axios.get("/api/ticket-types/");
    const ticketTypes = response.data.data;
    console.log("Dữ liệu từ API:", ticketTypes); // Kiểm tra dữ liệu
    console.table(ticketTypes);

    ticketTypeList.innerHTML = "";

    if (ticketTypes.length === 0) {
      ticketTypeList.innerHTML = "<p class='no-results'>Không có loại vé.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    ticketTypes.forEach((ticketType) => {
      const card = document.createElement("div");
      card.innerHTML = createTicketTypeCard(ticketType);
      fragment.appendChild(card);
    });

    ticketTypeList.appendChild(fragment);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách loại vé:", error);
    showError(ticketTypeList, error.message);
  }
}

//#endregion

//#region === Khu vực Xử lý Thêm Loại Vé ===

// Gửi yêu cầu thêm loại vé
async function submitAddTicketType(form, modal) {
  try {
    const formData = new FormData(form);
    const data = Object.fromEntries(formData); 
    const response = await axios.post("/api/ticket-types/", data); 

    if (response.status === 201) {
      alert("Thêm loại vé thành công!");
      await renderList();
      modal.remove();
    } else {
      alert("Có lỗi xảy ra khi thêm loại vé.");
    }
  } catch (error) {
    console.error("Lỗi khi thêm loại vé:", error);
    alert("Lỗi: " + (error.response?.data?.error || "Không thể thêm loại vé."));
  }
}

// Mở modal để thêm loại vé
function addTicketType() {
  openTicketTypeModal();
}

//#endregion

//#region === Khu vực Xử lý Sửa Loại Vé ===

// Gửi yêu cầu sửa loại vé
async function submitUpdateTicketType(id, form, modal) {
  try {
    const formData = new FormData(form);
    const response = await axios.put(`/api/ticket-types/${id}`, formData);

    if (response.status === 200) {
      alert("Cập nhật loại vé thành công!");
      await renderList();
      modal.remove();
    } else {
      alert("Có lỗi xảy ra khi cập nhật loại vé.");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật loại vé:", error);
    const errorMessage = error.response?.data?.error || "Không thể cập nhật loại vé.";
    alert("Lỗi: " + (typeof errorMessage === "string" ? errorMessage : JSON.stringify(errorMessage)));
  }
}

// Mở modal để sửa loại vé
function editTicketType(id) {
  openTicketTypeModal(id);
}

//#endregion

//#region === Khu vực Xử lý Xóa Loại Vé ===

// Xóa loại vé (xóa mềm)
async function deleteTicketType(id, status) {
  if (status == 1) {
    alert("Loại vé này đã xóa rồi không xóa nữa!");
    return;
  }
  if (!confirm("Bạn có chắc chắn muốn xóa loại vé này?")) return;

  try {
    const response = await axios.delete(`/api/ticket-types/${id}`);
    if (response.data.success === true) {
      alert("✅ Xóa mềm loại vé thành công!");
      renderList();
    } else {
      throw new Error("Xóa loại vé thất bại");
    }
  } catch (error) {
    console.error("Lỗi khi xóa loại vé:", error);
    alert("❌ Xóa loại vé thất bại!");
  }
}

//#endregion

//#region === Khu vực Modal Thêm/Sửa Loại Vé ===

// Mở modal để thêm hoặc sửa loại vé
async function openTicketTypeModal(id = null) {
  let ticketType = null;
  if (id) {
    try {
      const response = await axios.get(`/api/ticket-types/${id}`);
      if (response.data.success !== true) {
        throw new Error("Không thể lấy dữ liệu loại vé!");
      }
      ticketType = response.data.data;
      if (!ticketType || !ticketType.ten_loai) {
        throw new Error("Dữ liệu loại vé không hợp lệ!");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu loại vé:", error);
      alert("Lỗi: " + (error.message || "Không thể lấy dữ liệu loại vé."));
      return;
    }
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "ticket-type-modal";
  modal.innerHTML = createTicketTypeModalHTML(id, ticketType);

  document.body.appendChild(modal);
  modal.classList.add("active");

  const closeBtn = modal.querySelector(".close-form-btn");
  closeBtn.addEventListener("click", () => {
    modal.remove();
  });

  const form = modal.querySelector("#ticket-type-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (id) {
      await submitUpdateTicketType(id, form, modal);
    } else {
      await submitAddTicketType(form, modal);
    }
  });
}

//#endregion

//#region === Khu vực Khởi tạo ===

// Khởi tạo khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("add-ticket-type-btn");
  addBtn.addEventListener("click", addTicketType);
  renderList();
});

//#endregion