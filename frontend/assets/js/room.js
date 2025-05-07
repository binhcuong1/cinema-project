axios.defaults.baseURL = "http://localhost:3000";

//#region === Khu vực Hàm Chung ===

// Hàm hiển thị thông báo lỗi trong container
function showError(container, message) {
  container.innerHTML = `<p class='error'>${message}</p>`;
}

// Hàm tạo HTML cho một thẻ phòng chiếu
function createRoomCard(room) {
  return `
    <div class="room-card">
      <div class="room-info">
        <h3>${room.ten_phong}</h3>
        <p><i class="fas fa-users"></i> Sức chứa: ${room.so_luong_ghe} người</p>
      </div>
      <div class="room-actions">
        <button class="view-seats-btn" onclick="viewSeats('${room.ma_phong}', '${room.ten_phong}')"><i class="fas fa-chair"></i> Xem ghế</button>
        <button class="edit-room-btn" onclick="editRoom('${room.ma_phong}')"><i class="fas fa-edit"></i> Sửa</button>
        <button class="delete-room-btn" onclick="deleteRoom('${room.ma_phong}', ${room.da_xoa})"><i class="fas fa-trash-alt"></i> Xóa</button>
      </div>
    </div>
  `;
}

// Hàm hiển thị modal sơ đồ ghế
async function viewSeats(ma_phong, ten_phong) {
  try {
      // Gọi API để lấy danh sách ghế
      const seatsResponse = await axios.get(`/api/seats/${ma_phong}`);
      if (seatsResponse.data.success !== "true") {
          throw new Error("Không thể lấy danh sách ghế!");
      }

      // Lấy seats_per_row từ API
      const seatsPerRow = seatsResponse.data.seats_per_row || [];

      // Tạo danh sách ghế từ seats_per_row
      const seats = [];
      for (let i = 0; i < seatsPerRow.length; i++) {
          const rowLabel = String.fromCharCode(65 + i); // A, B, C...
          const seatCount = seatsPerRow[i];
          for (let j = 1; j <= seatCount; j++) {
              const seatId = `${rowLabel}${j}`;
              seats.push({ id: seatId, status: "empty" }); // Trạng thái mặc định là empty
          }
      }

      // Tạo modal hiển thị sơ đồ ghế
      const modal = document.createElement("div");
      modal.className = "modal-overlay";
      modal.id = "seat-modal";
      modal.innerHTML = `
          <div class="room-modal-container">
              <button class="close-form-btn">×</button>
              <h2>Sơ đồ ghế phòng chiếu ${ten_phong}</h2>
              <div class="seat-selection">
                  <div class="screen">Màn Hình</div>
                  <div class="seat-grid" id="seat-grid"></div>
              </div>
          </div>
      `;

      document.body.appendChild(modal);
      modal.classList.add("active");

      const closeBtn = modal.querySelector(".close-form-btn");
      closeBtn.addEventListener("click", () => {
          modal.remove();
      });

      const seatGrid = modal.querySelector("#seat-grid");
      renderSeats(seats, seatGrid);

      // Thêm sự kiện click nếu cần chọn ghế
      seatGrid.addEventListener("click", (e) => {
          const seatElement = e.target.closest(".seat");
          if (seatElement) {
              const seatId = seatElement.textContent;
              selectSeat(seatId, seats, seatGrid);
          }
      });
  } catch (error) {
      console.error("Lỗi khi lấy danh sách ghế:", error);
      alert("Lỗi: " + (error.message || "Không thể lấy danh sách ghế."));
  }
}

// Hàm render ghế
function renderSeats(seats, seatGrid) {
  seatGrid.innerHTML = "";
  
  // Nhóm ghế theo hàng
  const groupedSeats = seats.reduce((acc, seat) => {
      const row = seat.id.charAt(0); // Lấy hàng (A, B, C, ...)
      if (!acc[row]) acc[row] = [];
      acc[row].push(seat);
      return acc;
  }, {});

  // Render từng hàng
  for (const row in groupedSeats) {
      const rowElement = document.createElement("div");
      rowElement.classList.add("seat-row");

      const labelElement = document.createElement("div");
      labelElement.classList.add("row-label");
      labelElement.textContent = row;
      rowElement.appendChild(labelElement);

      groupedSeats[row].forEach((seat) => {
          const seatElement = document.createElement("div");
          seatElement.classList.add("seat", seat.status); // Thêm class dựa trên trạng thái
          seatElement.textContent = seat.id;
          rowElement.appendChild(seatElement);
      });

      seatGrid.appendChild(rowElement);
  }
}

// Hàm tạo HTML cho modal thêm/sửa phòng chiếu
function createRoomModalHTML(id, room = null) {
  return `
    <div class="room-modal-container form-modal-container">
      <button class="close-form-btn">×</button>
      <h2>${id ? "Sửa Phòng Chiếu" : "Thêm Phòng Chiếu"}</h2>
      <form id="room-form">
        <!-- Bước 1: Nhập tên và số lượng hàng -->
        <div id="step1">
          <div class="input-group">
            <label for="room-name">Tên phòng chiếu</label>
            <input type="text" id="room-name" name="ten_phong" value="${room ? room.ten_phong : ""
    }" placeholder="Nhập tên phòng chiếu" required>
          </div>
          <div class="input-group">
            <label for="row-count">Số lượng hàng</label>
            <input type="number" id="row-count" name="row_count" value="${room ? room.so_luong_hang || 0 : ""
    }" placeholder="Nhập số lượng hàng" required>
          </div>
          <button type="button" id="continue-btn" class="auth-btn">Tiếp tục</button>
        </div>
        <!-- Bước 2: Nhập số ghế mỗi hàng (ẩn ban đầu) -->
        <div id="step2" style="display: none;">
          <div id="seat-rows" class="input-group"></div>
          <button type="submit" id="submit-btn" class="auth-btn" style="display: none;">
            ${id ? "Cập Nhật" : "Thêm"}
          </button>
        </div>
      </form>
    </div>
  `;
}

// Hàm tạo input động cho số ghế mỗi hàng
function generateSeatRowInputs(
  rowCount,
  seatRowsContainer,
  existingSeats = []
) {
  seatRowsContainer.innerHTML = "";
  for (let i = 0; i < rowCount; i++) {
    const rowLabel = String.fromCharCode(65 + i); // A, B, C...
    const inputGroup = document.createElement("div");
    inputGroup.className = "input-group";
    inputGroup.innerHTML = `
      <label for="seats-row-${i}">Số ghế hàng ${rowLabel}</label>
      <input type="number" id="seats-row-${i}" name="seats_row_${i}" value="${existingSeats[i] || ""
      }" placeholder="Nhập số ghế hàng ${rowLabel}" required>
    `;
    seatRowsContainer.appendChild(inputGroup);
  }
}

//#endregion

//#region === Khu vực Hiển thị Danh sách Phòng Chiếu ===

// Hiển thị danh sách phòng chiếu của một rạp
async function renderList() {
  const roomList = document.getElementById("room-list");
  if (!roomList) return;

  const urlParams = new URLSearchParams(window.location.search);
  const maRap = urlParams.get("id");
  if (!maRap) {
    showError(roomList, "Không tìm thấy mã rạp!");
    return;
  }

  try {
    const response = await axios.get(`/api/rooms/theater/${maRap}`);
    const rooms = response.data;

    if (rooms.success !== "true") throw new Error("Dữ liệu không hợp lệ");

    roomList.innerHTML = "";

    if (rooms.data.length === 0) {
      roomList.innerHTML = "<p class='no-results'>Không có phòng chiếu.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    rooms.data.forEach((room) => {
      const card = document.createElement("div");
      card.innerHTML = createRoomCard(room);
      fragment.appendChild(card);
    });

    roomList.appendChild(fragment);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách phòng chiếu:", error);
    showError(roomList, error.message);
  }
}

//#endregion

//#region === Khu vực Xử lý Thêm Phòng Chiếu ===

// Mở modal để thêm phòng chiếu
function addRoom() {
  openRoomModal();
}

// Gửi yêu cầu thêm phòng chiếu
async function submitAddRoom(form, modal) {
  const urlParams = new URLSearchParams(window.location.search);
  const maRap = urlParams.get("id");
  if (!maRap) {
    alert("Không tìm thấy mã rạp!");
    return;
  }

  try {
    const formData = new FormData(form);
    const rowCount = formData.get("row_count");
    const seatsPerRow = [];
    let totalSeats = 0;

    // Thu thập số ghế mỗi hàng
    for (let i = 0; i < rowCount; i++) {
      const seats = parseInt(formData.get(`seats_row_${i}`));
      seatsPerRow.push(seats);
      totalSeats += seats;
    }
    
    const data = {
      ma_rap: maRap,
      ten_phong: formData.get("ten_phong"),
      so_luong_ghe: totalSeats,
      seats_per_row: seatsPerRow, // Dữ liệu ghế mỗi hàng để backend tạo bản ghi trong bảng ghe
    };
    
    const response = await axios.post("/api/rooms/", data);
    if (response.status === 201) {
      alert("Thêm phòng chiếu thành công!");
      await renderList();
      modal.remove();
    } else {
      alert("Có lỗi xảy ra khi thêm phòng chiếu.");
    }
  } catch (error) {
    console.error("Lỗi khi thêm phòng chiếu:", error);
    alert(
      "Lỗi: " + (error.response?.data?.error || "Không thể thêm phòng chiếu.")
    );
  }
}

//#endregion

//#region === Khu vực Xử lý Sửa Phòng Chiếu ===

// Mở modal để sửa phòng chiếu
async function editRoom(id) {
  openRoomModal(id);
}

// Gửi yêu cầu sửa phòng chiếu
async function submitUpdateRoom(id, form, modal) {
  try {
    const formData = new FormData(form);
    const rowCount = formData.get("row_count");
    const seatsPerRow = [];
    let totalSeats = 0;
    
    // Thu thập số ghế mỗi hàng
    for (let i = 0; i < rowCount; i++) {
      const seats = parseInt(formData.get(`seats_row_${i}`));
      seatsPerRow.push(seats);
      totalSeats += seats;
    }

    const data = {
      ten_phong: formData.get("ten_phong"),
      so_luong_ghe: totalSeats,
      seats_per_row: seatsPerRow,
    };
    
    const response = await axios.put(`/api/rooms/${id}`, data);
    if (response.status === 200) {
      alert("Cập nhật phòng chiếu thành công!");
      await renderList();
      modal.remove();
    } else {
      alert("Có lỗi xảy ra khi cập nhật phòng chiếu.");
    }
  } catch (error) {
    console.error("Lỗi khi cập nhật phòng chiếu:", error);
    const errorMessage =
      error.response?.data?.error || "Không thể cập nhật phòng chiếu.";
    alert(
      "Lỗi: " +
      (typeof errorMessage === "string"
        ? errorMessage
        : JSON.stringify(errorMessage))
    );
  }
}

//#endregion

//#region === Khu vực Xử lý Xóa Phòng Chiếu ===

// Xóa phòng chiếu (xóa mềm)
async function deleteRoom(id, status) {
  if (status == 1) {
    alert("Phòng chiếu này đã xóa rồi không xóa nữa!");
    return;
  }
  if (!confirm("Bạn có chắc chắn muốn xóa phòng chiếu này?")) return;

  try {
    const response = await axios.delete(`/api/rooms/${id}`);
    if (response.data.success === true) {
      alert("✅ Xóa mềm phòng chiếu thành công!");
      renderList();
    } else {
      throw new Error("Xóa phòng chiếu thất bại");
    }
  } catch (error) {
    console.error("Lỗi khi xóa phòng chiếu:", error);
    alert("❌ Xóa phòng chiếu thất bại!");
  }
}

//#endregion

//#region === Khu vực Modal Thêm/Sửa Phòng Chiếu ===

// Mở modal để thêm hoặc sửa phòng chiếu
async function openRoomModal(id = null) {
  let room = null;
  let seatsPerRow = [];

  if (id) {
    try {
      const response = await axios.get(`/api/rooms/${id}`);
      if (response.data.success !== "true") {
        throw new Error("Không thể lấy dữ liệu phòng chiếu!");
      }
      room = response.data.data;
      
      console.log("Dữ liệu phòng chiếu:", room);
      if (!room || !room.ten_phong) {
        throw new Error("Dữ liệu phòng chiếu không hợp lệ!");
      }
      const seatsResponse = await axios.get(`/api/seats/${id}`);
      seatsPerRow = seatsResponse.data.seats_per_row || [];
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu phòng chiếu:", error);
      alert("Lỗi: " + (error.message || "Không thể lấy dữ liệu phòng chiếu."));
      return;
    }
  }

  const modal = document.createElement("div");
  modal.className = "modal-overlay";
  modal.id = "room-modal";
  modal.innerHTML = createRoomModalHTML(id, room);

  document.body.appendChild(modal);
  modal.classList.add("active");

  const closeBtn = modal.querySelector(".close-form-btn");
  closeBtn.addEventListener("click", () => {
    modal.remove();
  });

  const step1 = modal.querySelector("#step1");
  const step2 = modal.querySelector("#step2");
  const continueBtn = modal.querySelector("#continue-btn");
  const rowCountInput = modal.querySelector("#row-count");
  const seatRowsContainer = modal.querySelector("#seat-rows");
  const submitBtn = modal.querySelector("#submit-btn");
  
  // Xử lý nút "Tiếp tục"
  continueBtn.addEventListener("click", () => {
    const rowCount = parseInt(rowCountInput.value);
    const roomName = modal.querySelector("#room-name").value;
    
    if (!roomName) {
      alert("Hãy nhập tên phòng chiếu!");
      return;
    } else if (rowCount <= 0 || !rowCount) {
      alert("Số lượng hàng phải lớn hơn 0!");
      return;
    }

    // Tạo các ô nhập số ghế
    generateSeatRowInputs(
      rowCount,
      seatRowsContainer,
      seatsPerRow.length > 0 ? seatsPerRow : []
    );

    // Ẩn bước 1, hiển thị bước 2 và nút Thêm/Cập nhật
    step1.style.display = "none";
    step2.style.display = "block";
    submitBtn.style.display = "block";
  });

  const form = modal.querySelector("#room-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (id) {
      await submitUpdateRoom(id, form, modal);
    } else {
      await submitAddRoom(form, modal);
    }
  });
}

//#endregion

//#region === Khu vực Hiển Thị Page-Header ===

// Hiển thị tiêu đề và nút "Thêm Phòng Chiếu"
async function renderPageHeader() {
  const pageHeader = document.getElementById("page-header");
  if (!pageHeader) return;

  const urlParams = new URLSearchParams(window.location.search);
  const maRap = urlParams.get("id");

  if (!maRap) {
    const roomList = document.getElementById("room-list");
    if (roomList) {
      showError(roomList, "Không tìm thấy mã rạp!");
    }
    return;
  }

  // Lấy thông tin rạp để hiển thị tên rạp trong tiêu đề
  let tenRap = "Không xác định";
  try {
    const response = await axios.get(`/api/theaters/${maRap}`);
    if (response.data.success === "true" && response.data.data) {
      tenRap = response.data.data.ten_rap || "Không xác định";
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin rạp:", error);
  }

  // Thêm nội dung HTML vào page-header
  pageHeader.innerHTML = `
        <h1><i class="fas fa-door-open"></i> Quản Lý Phòng Chiếu - Rạp ${tenRap}</h1>
        <button class="add-btn" id="add-room-btn">
          <i class="fas fa-plus-circle"></i> Thêm Phòng Chiếu
        </button>
  `;

  // Gắn sự kiện click cho nút "Thêm Phòng Chiếu"
  const addBtn = document.getElementById("add-room-btn");
  if (addBtn) {
    addBtn.addEventListener("click", addRoom);
  }
}

//#endregion

//#region === Khu vực Chuyển Hướng ===

// Quay lại trang quản lý rạp
function goBackToTheaterList() {
  window.location.href = "/frontend/pages/theater/theater.html";
}

//#endregion

// Khởi tạo khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  renderPageHeader();
  renderList();
});
