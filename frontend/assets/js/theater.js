axios.defaults.baseURL = "http://localhost:3000";

//#region === Khu vực Hàm Chung ===

// Hàm hiển thị thông báo lỗi trong container
function showError(container, message) {
  container.innerHTML = `<p class='error'>${message}</p>`;
}

// Hàm tạo HTML cho một thẻ rạp
function createTheaterCard(theater) {
  return `
      <div class="theater-card">
          <div class="theater-info">
              <img src="${theater.image}" alt="${theater.ten_rap}" class="theater-image" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px 8px 0 0;">
              <h3>${theater.ten_rap}</h3>
              <p><i class="fas fa-map-marker-alt"></i> ${theater.dia_chi}</p>
              <p><i class="fas fa-door-open"></i> Số phòng chiếu: ${theater.room_count}</p>
          </div>
          <div class="theater-actions">
              <button class="roomList-btn" onclick="hrefToRoomList('${theater.ma_rap}')"><i class="fas fa-door-open"></i> Phòng chiếu</button>
              <button class="edit-btn" onclick="editTheater('${theater.ma_rap}')"><i class="fas fa-edit"></i> Sửa</button>
              <button class="delete-btn" onclick="deleteTheater('${theater.ma_rap}', ${theater.da_xoa})"><i class="fas fa-trash-alt"></i> Xóa</button>
          </div>
      </div>
  `;
}

// Hàm tạo HTML cho modal thêm/sửa rạp
function createTheaterModalHTML(id, theater = null) {
  return `
    <div class="auth-container">
      <button class="close-form-btn">×</button>
      <h2>${id ? "Sửa Rạp" : "Thêm Rạp"}</h2>
      <form id="theater-form">
        <div class="input-group">
          <label for="theater-name">Tên rạp</label>
          <input type="text" id="theater-name" name="ten_rap" value="${
            theater ? theater.ten_rap : ""
          }" placeholder="Nhập tên rạp" required>
        </div>
        <div class="input-group">
          <label for="theater-address">Địa chỉ</label>
          <input type="text" id="theater-address" name="dia_chi" value="${
            theater ? theater.dia_chi : ""
          }" placeholder="Nhập địa chỉ" required>
        </div>
        <div class="input-group">
          <label for="theater-phone">Số điện thoại</label>
          <input type="text" id="theater-phone" name="sdt" value="${
            theater ? theater.sdt : ""
          }" placeholder="Nhập số điện thoại" required>
        </div>
        <div class="input-group">
          <label for="theater-image">Hình ảnh</label>
          ${
            theater && theater.image
              ? `<img src="${theater.image}" alt="Hình ảnh hiện tại" style="width: 100px; height: auto; margin-bottom: 10px;">`
              : ""
          }
          <input type="file" id="image" name="image" accept="image/*" ${
            id ? "" : "required"
          }>
        </div>
        <button type="submit" class="auth-btn">${
          id ? "Cập Nhật" : "Thêm"
        }</button>
      </form>
    </div>
  `;
}

//#endregion

//#region === Khu vực Hiển thị Danh sách Rạp ===

// Hiển thị danh sách rạp
async function renderList() {
  const theaterList = document.getElementById("theater-list");
  if (!theaterList) return;

  try {
    const response = await axios.get("/api/theaters/");
    const theaters = response.data;

    if (theaters.success !== true) throw new Error("Dữ liệu không hợp lệ");

    theaterList.innerHTML = "";

    if (theaters.data.length === 0) {
      theaterList.innerHTML = "<p class='no-results'>Không có rạp.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    theaters.data.forEach((theater) => {
      const card = document.createElement("div");
      card.innerHTML = createTheaterCard(theater);
      fragment.appendChild(card);
    });

    theaterList.appendChild(fragment);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách rạp:", error);
    showError(theaterList, error.message);
  }
}

//#endregion

//#region === Khu vực Xử lý Thêm Rạp ===

// Gửi yêu cầu thêm rạp
async function submitAddTheater(form, modal) {
  try {
    const formData = new FormData(form);
    const response = await axios.post("/api/theaters/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 201) {
      alert("Thêm rạp thành công!");
      await renderList();
      modal.remove();
    } else {
      alert("Có lỗi xảy ra khi thêm rạp.");
    }
  } catch (error) {
    console.error("Lỗi khi thêm rạp:", error);
    alert("Lỗi: " + (error.response?.data?.error || "Không thể thêm rạp."));
  }
}

// Mở modal để thêm rạp
function addTheater() {
  openTheaterModal();
}

//#endregion

//#region === Khu vực Xử lý Sửa Rạp ===

// Gửi yêu cầu sửa rạp
async function submitUpdateTheater(id, form, modal) {
  try {
    const formData = new FormData(form);
    console.log("Dữ liệu gửi lên:", [...formData.entries()]);
    const response = await axios.put(`/api/theaters/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 200) {
      alert("Cập nhật rạp thành công!");
      await renderList();
      modal.remove();
    } else {
      alert("Có lỗi xảy ra khi cập nhật rạp.");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật rạp:", error);
    const errorMessage =
      error.response?.data?.error || "Không thể cập nhật rạp.";
    alert(
      "Lỗi: " +
        (typeof errorMessage === "string"
          ? errorMessage
          : JSON.stringify(errorMessage))
    );
  }
}

// Mở modal để sửa rạp
function editTheater(id) {
  openTheaterModal(id);
}

//#endregion

//#region === Khu vực Xử lý Xóa Rạp ===

// Xóa rạp (xóa mềm)
async function deleteTheater(id, status) {
  if (status == 1) {
    alert("Rạp này đã xóa rồi không xóa nữa!");
    return;
  }
  if (!confirm("Bạn có chắc chắn muốn xóa rạp này?")) return;

  try {
    const response = await axios.delete(`/api/theaters/${id}`);
    if (response.data.success === true) {
      alert("✅ Xóa mềm rạp thành công!");
      renderList();
    } else {
      throw new Error("Xóa rạp thất bại");
    }
  } catch (error) {
    console.error("Lỗi khi xóa rạp:", error);
    alert("❌ Xóa rạp thất bại!");
  }
}

//#endregion

//#region === Khu vực Modal Thêm/Sửa Rạp ===

// Mở modal để thêm hoặc sửa rạp
async function openTheaterModal(id = null) {
  let theater = null;
  if (id) {
    try {
      const response = await axios.get(`/api/theaters/${id}`);
      if (response.data.success !== "true") {
        throw new Error("Không thể lấy dữ liệu rạp!");
      }
      theater = response.data.data;
      console.log("Dữ liệu rạp:", theater);
      if (!theater || !theater.ten_rap) {
        throw new Error("Dữ liệu rạp không hợp lệ!");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu rạp:", error);
      alert("Lỗi: " + (error.message || "Không thể lấy dữ liệu rạp."));
      return;
    }
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "theater-modal";
  modal.innerHTML = createTheaterModalHTML(id, theater);

  document.body.appendChild(modal);
  modal.classList.add("active");

  const closeBtn = modal.querySelector(".close-form-btn");
  closeBtn.addEventListener("click", () => {
    modal.remove();
  });

  const form = modal.querySelector("#theater-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (id) {
      await submitUpdateTheater(id, form, modal);
    } else {
      await submitAddTheater(form, modal);
    }
  });
}

//#endregion

//#region === Khu vực Xử Lý Phòng Chiếu ===

function hrefToRoomList(theaterID) {
  window.location.href = `/frontend/pages/room/room.html?id=${theaterID}`;
}

//#endregion

//#region === Khu vực Khởi tạo ===

// Khởi tạo khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("add-theater-btn");
  addBtn.addEventListener("click", addTheater);
  renderList();
});

//#endregion
