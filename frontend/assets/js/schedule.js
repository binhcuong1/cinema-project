axios.defaults.baseURL = "http://127.0.0.1:3000";

//#region === Khu vực Hàm Tải Dữ Liệu ===
function toggleRoom(header) {
  const content = header.nextElementSibling;
  content.classList.toggle("active");
  header.classList.toggle("active");
}
// Hàm tải danh sách rạp từ API
async function loadTheaters() {
  try {
    const response = await axios.get("/api/theaters/");
    const theaters = response.data.data;
    const theaterSelect = document.getElementById("theater");

    theaters.forEach((theater) => {
      const option = document.createElement("option");
      option.value = theater.ma_rap;
      option.textContent = theater.ten_rap;
      theaterSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách rạp:", error);
    document.getElementById("schedule-list").innerHTML =
      "<p>Có lỗi xảy ra khi tải danh sách rạp.</p>";
  }
}

// Hàm tải danh sách phòng chiếu và lịch chiếu
async function loadSchedules() {
  const theaterId = document.getElementById("theater").value;
  const date = document.getElementById("date").value;
  const scheduleList = document.getElementById("schedule-list");

  if (!theaterId || !date) {
    scheduleList.innerHTML = "<p>Vui lòng chọn rạp và ngày chiếu!</p>";
    return;
  }

  try {
    // Tải danh sách phòng chiếu của rạp
    const roomsResponse = await axios.get(`/api/rooms/theater/${theaterId}`);
    const rooms = roomsResponse.data.data;

    if (rooms.length === 0) {
      scheduleList.innerHTML = "<p>Không có phòng chiếu nào cho rạp này.</p>";
      return;
    }

    // Lưu danh sách phòng vào biến toàn cục
    window.roomsData = rooms; // Cập nhật roomsData

    let html = "";
    // Lặp qua từng phòng chiếu để lấy lịch chiếu
    for (const room of rooms) {
      let schedules = [];
      try {
        const schedulesResponse = await axios.get(
          `/api/schedules/room/${room.ma_phong}?date=${date}`
        );
        schedules = schedulesResponse.data.data.filter(
          (schedule) => schedule.da_xoa === 0
        );
      } catch (error) {
        if (error.response && error.response.status === 404) {
          schedules = []; // Nếu không có lịch chiếu, gán mảng rỗng
        } else {
          throw error; // Nếu lỗi khác, throw để vào catch chính
        }
      }
      html += renderRoomSection(room, schedules);
    }

    scheduleList.innerHTML = html;
  } catch (error) {
    console.error("Lỗi khi tải lịch chiếu:", error);
    scheduleList.innerHTML = "<p>Có lỗi xảy ra khi tải lịch chiếu.</p>";
  }
}

//#endregion

//#region === Khu vực Hàm Render ===

// Hàm render một section phòng chiếu
function renderRoomSection(room, schedules) {
  let schedulesHtml = "";
  if (schedules.length === 0) {
    schedulesHtml = "";
  } else {
    const now = new Date();
    schedulesHtml = schedules
      .map((schedule) => {
        const startTime = new Date(schedule.thoi_gian_bat_dau);
        const endTime = new Date(schedule.thoi_gian_ket_thuc);
        const isCurrentlyPlaying =
          now >= startTime && now <= endTime && schedule.da_xoa === 0;
        return `
                  <tr>
                      <td>${formatDateTime(
                        schedule.thoi_gian_bat_dau
                      )} - ${formatDateTime(schedule.thoi_gian_ket_thuc)}</td>
                      <td>${schedule.ten_phim}</td>
                      <td><button class="status-btn ${
                        isCurrentlyPlaying ? "online" : "offline"
                      }">${
          isCurrentlyPlaying ? "Online" : "Offline"
        }</button></td>
                      <td><button class="view-seat-layout-btn" onclick="viewSeats('${
                        schedule.ma_lich_chieu
                      }', '${room.ma_phong}', '${
          room.ten_phong
        }')"><i class="fas fa-chair"></i> Xem sơ đồ</button></td>
                      <td><button class="delete-schedule-btn" data-schedule-id="${
                        schedule.ma_lich_chieu
                      }"><i class="fas fa-trash"></i> Xóa</button></td>
                  </tr>
              `;
      })
      .join("");
  }

  return `
      <div class="room-section">
          <div class="room-header" onclick="toggleRoom(this)">
              <span>Phòng ${room.ten_phong}</span>
              <i class="fas fa-chevron-down"></i>
          </div>
          <div class="room-content">
              <table>
                  <thead>
                      <tr>
                          <th>Thời gian</th>
                          <th>Phim</th>
                          <th>Trạng thái</th>
                          <th>Trạng thái ghế</th>
                          <th>Xóa</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${schedulesHtml}
                  </tbody>
                  <thead class="action-footer">
                      <tr>
                          <th>
                              <button class="add-showtime-btn" data-room-id="${room.ma_phong}" data-room-name="Phòng ${room.ten_phong}">
                                  <i class="fas fa-plus"></i> Thêm suất chiếu
                              </button>
                          </th>
                          <th></th>
                          <th></th>
                          <th></th>
                          <th></th>
                      </tr>
                  </thead>
              </table>
          </div>
      </div>
  `;
}

// Hàm định dạng ngày giờ
function formatDateTime(dateTime) {
  const date = new Date(dateTime);
  const offset = 7 * 60; // UTC+7
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + offset);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

//#endregion

//#region === Khu vực Hàm Xử Lý Modal ===

// Hàm tạo HTML cho modal thêm lịch chiếu
function createScheduleModalHTML(date, roomName) {
  const formattedDate = date.split("-").reverse().join("/");

  // Tạo mảng giờ (00-23) và phút (00-59)
  const hours = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0")
  );
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, "0")
  );

  return `
      <div class="schedule-modal-content">
          <button class="schedule-close-btn">×</button>
          <h5 class="modal-title">Thêm Lịch Chiếu - ${formattedDate} | ${roomName}</h5>
          <form id="add-schedule-form">
              <div class="modal-form-row">
                  <div class="schedule-input-group">
                      <label for="movie">Phim</label>
                      <div class="input-wrapper">
                          <select id="movie" name="ma_phim" required>
                              <option value="">Chọn phim</option>
                          </select>
                      </div>
                  </div>
                  <div class="schedule-input-group">
                      <label for="audio">Âm thanh</label>
                      <div class="input-wrapper audio-group">
                          <select id="audio" name="ma_am_thanh" required>
                              <option value="">Chọn âm thanh</option>
                          </select>
                          <button type="button" class="add-audio-btn fas fa-plus" id="add-audio-btn"></button>
                      </div>
                  </div>
              </div>
              <div class="modal-form-row time-row">
                  <div class="schedule-input-group">
                      <label for="start-time-hour">Thời gian bắt đầu</label>
                      <div class="input-wrapper time-select">
                          <select id="start-time-hour" name="start-time-hour" required style="width: 50px; height: 25px; padding: 2px; font-size: 12px;">
                              ${hours
                                .map(
                                  (hour) =>
                                    `<option value="${hour}" ${
                                      hour === "08" ? "selected" : ""
                                    }>${hour}</option>`
                                )
                                .join("")}
                          </select>
                          <span style="margin: 0 5px;">:</span>
                          <select id="start-time-minute" name="start-time-minute" required style="width: 50px; height: 25px; padding: 2px; font-size: 12px;">
                              ${minutes
                                .map(
                                  (minute) =>
                                    `<option value="${minute}" ${
                                      minute === "00" ? "selected" : ""
                                    }>${minute}</option>`
                                )
                                .join("")}
                          </select>
                      </div>
                  </div>
                  <div class="schedule-input-group">
                      <label for="num-shows">Số suất chiếu liên tiếp</label>
                      <div class="input-wrapper">
                          <input type="number" id="num-shows" name="num_shows" min="1" value="1" required style="width: 70px; height: 25px; padding: 2px; font-size: 12px;">
                      </div>
                  </div>
              </div>
              <button type="submit" class="schedule-auth-btn">Thêm</button>
          </form>
      </div>
  `;
}

// Hàm tạo HTML cho modal thêm âm thanh
function createAddAudioModalHTML() {
  return `
    <div class="schedule-modal-content add-audio-modal">
      <button class="schedule-close-btn">×</button>
      <h5 class="modal-title">Thêm Âm Thanh Mới</h5><br>
      <form id="add-audio-form">
        <div class="schedule-input-group">
          <label for="audio-name">Tên âm thanh</label>
          <input type="text" id="audio-name" name="ten_am_thanh" required placeholder="Nhập tên âm thanh">
        </div>
        <button type="submit" class="schedule-auth-btn">Thêm</button>
      </form>
    </div>
  `;
}

// Hàm mở modal thêm lịch chiếu
function openAddScheduleModal(roomId, event) {
  const date = document.getElementById("date").value;
  const button = event ? event.target.closest(".add-showtime-btn") : null;
  let roomName = button
    ? button.getAttribute("data-room-name")
    : "Phòng Unknown";

  let modal = document.getElementById("schedule-modal");
  if (modal) {
    modal.remove();
  }

  modal = document.createElement("div");
  modal.id = "schedule-modal";
  modal.className = "schedule-modal-overlay";
  modal.innerHTML = createScheduleModalHTML(date, roomName);

  document.body.appendChild(modal);
  modal.classList.add("active");

  const closeBtn = modal.querySelector(".schedule-close-btn");
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300);
  });

  const movieSelect = modal.querySelector("#movie");
  loadMoviesForModal(movieSelect);

  const audioSelect = modal.querySelector("#audio");
  loadAudiosForModal(audioSelect);

  const addAudioBtn = modal.querySelector("#add-audio-btn");
  addAudioBtn.addEventListener("click", openAddAudioModal);

  // Lấy thời lượng phim khi chọn phim
  movieSelect.addEventListener("change", async () => {
    const maPhim = movieSelect.value;
    if (maPhim) {
      try {
        const response = await axios.get(`/api/movies/${maPhim}`);
        const movie = response.data.data[0];
        window.movieDuration = movie.thoi_luong_phut || 120;
      } catch (error) {
        console.error("Lỗi khi lấy thời lượng phim:", error);
        window.movieDuration = 120;
      }
    }
  });

  const form = modal.querySelector("#add-schedule-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    // Lấy giá trị giờ và phút từ dropdown
    const startHour = formData.get("start-time-hour");
    const startMinute = formData.get("start-time-minute");
    const startTime = `${startHour}:${startMinute}`; // Ghép thành định dạng HH:MM, ví dụ: "13:00"

    const numShows = parseInt(formData.get("num_shows"), 10) || 1;
    const maPhim = formData.get("ma_phim");
    const maAmThanh = formData.get("ma_am_thanh");

    if (!maPhim || !startTime || numShows < 1) {
      alert("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    // Dữ liệu gửi lên backend
    const data = {
      ma_phong: roomId,
      thoi_gian_bat_dau: `${date}T${startTime}`,
      num_shows: numShows,
      maPhim,
      ma_am_thanh: maAmThanh,
      movie_duration: window.movieDuration || 120,
      interval_minutes: 15, // Khoảng cách 15 phút
    };
    console.table(data);
    try {
      const response = await axios.post("/api/schedules/", data); // Gửi cho backend xử lý
      if (response.status === 201) {
        alert("Thêm lịch chiếu thành công!");
        modal.classList.remove("active");
        setTimeout(() => {
          modal.remove();
          loadSchedules();
        }, 300);
      } else {
        alert("Có lỗi xảy ra khi thêm lịch chiếu.");
      }
    } catch (error) {
      console.error("Lỗi khi thêm lịch chiếu:", error);
      alert(
        "Lỗi: " + (error.response?.data?.error || "Không thể thêm lịch chiếu.")
      );
    }
  });
}

// Hàm mở modal thêm âm thanh
function openAddAudioModal() {
  // Kiểm tra xem modal đã tồn tại chưa, nếu có thì xóa trước
  let modal = document.getElementById("add-audio-modal");
  if (modal) {
    modal.remove();
  }

  // Tạo modal mới
  modal = document.createElement("div");
  modal.id = "add-audio-modal";
  modal.className = "schedule-modal-overlay";
  modal.innerHTML = createAddAudioModalHTML();

  // Thêm modal vào body
  document.body.appendChild(modal);
  modal.classList.add("active");

  // Đóng modal khi nhấn nút đóng
  const closeBtn = modal.querySelector(".schedule-close-btn");
  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
    setTimeout(() => modal.remove(), 300); // Đợi animation hoàn tất
  });

  // Xử lý submit form thêm âm thanh
  const form = modal.querySelector("#add-audio-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const data = {
      ten_am_thanh: formData.get("ten_am_thanh"),
    };

    try {
      const response = await axios.post("/api/schedules/audios", data);
      if (response.status === 201) {
        alert("Thêm âm thanh thành công!");
        modal.classList.remove("active");
        setTimeout(() => {
          modal.remove();
          // Cập nhật lại danh sách âm thanh trong modal chính
          const audioSelect = document.querySelector("#schedule-modal #audio");
          if (audioSelect) {
            loadAudiosForModal(audioSelect);
          }
        }, 300);
      } else {
        alert("Có lỗi xảy ra khi thêm âm thanh.");
      }
    } catch (error) {
      console.error("Lỗi khi thêm âm thanh:", error);
      alert(
        "Lỗi: " + (error.response?.data?.error || "Không thể thêm âm thanh.")
      );
    }
  });
}

// Hàm load danh sách âm thanh cho modal
async function loadAudiosForModal(selectElement) {
  try {
    selectElement.innerHTML = '<option value="">Đang tải âm thanh...</option>';
    const response = await axios.get("/api/schedules/audios");
    console.table(response); // Kiểm tra dữ liệu từ API
    const audios = response.data.data;
    selectElement.innerHTML = '<option value="">Chọn âm thanh</option>';
    audios.forEach((audio) => {
      const option = document.createElement("option");
      option.value = audio.ma_am_thanh;
      option.textContent = audio.ten_am_thanh;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách âm thanh:", error);
    selectElement.innerHTML = '<option value="">Lỗi khi tải âm thanh</option>';
  }
}

// Hàm load danh sách phim cho modal
async function loadMoviesForModal(selectElement) {
  try {
    // Thêm trạng thái loading (tùy chọn)
    selectElement.innerHTML = '<option value="">Đang tải phim...</option>';

    const response = await axios.get("/api/movies");
    const movies = response.data.data;

    // Xóa các option cũ và thêm option mặc định
    selectElement.innerHTML = '<option value="">Chọn phim</option>';

    // Điền danh sách phim
    movies.forEach((movie) => {
      const option = document.createElement("option");
      option.value = movie.ma_phim;
      option.textContent = movie.ten_phim;
      selectElement.appendChild(option);
    });
  } catch (error) {
    console.error("Lỗi khi tải danh sách phim:", error);
    selectElement.innerHTML = '<option value="">Lỗi khi tải phim</option>';
  }
}

//#endregion

//#region === Khu vực Hàm Xử Lý Xóa ===

// Hàm xóa tất cả lịch chiếu của một phòng
async function deleteSchedule(scheduleID) {
  try {
    const bookingResponse = await axios.get(`/api/bookings/${scheduleID}`);
    if (!bookingResponse.data.success)
      throw new Error("Không thể kiểm tra trạng thái ghế đã đặt!");

    const bookedSeats = bookingResponse.data.data.booked_seats || [];
    if (bookedSeats.length > 0) {
      alert("Không thể xóa lịch chiếu vì đã có ghế được đặt!");
      return;
    }

    // Nếu không có ghế đã đặt, tiến hành xóa lịch chiếu
    const confirmDelete = confirm("Bạn có chắc chắn muốn xóa lịch chiếu này?");
    if (!confirmDelete) return;

    const deleteResponse = await axios.delete(`/api/schedules/${scheduleID}`);
    if (deleteResponse.status === 200) {
      alert("Xóa lịch chiếu thành công!");
      await loadSchedules();
    } else {
      throw new Error("Có lỗi xảy ra khi xóa lịch chiếu.");
    }
  } catch (error) {
    console.error("Lỗi khi xóa lịch chiếu:", error);
    alert(
      "Lỗi: " + (error.response?.data?.error || "Không thể xóa lịch chiếu.")
    );
  }
}

//#endregion

//#region === Khu vực Hàm Xử Lý Xem Ghế ===

// Hàm hiển thị modal sơ đồ ghế
async function viewSeats(ma_lich_chieu, ma_phong, ten_phong) {
  try {
    // Gọi API để lấy danh sách ghế
    const seatsResponse = await axios.get(`/api/seats/${ma_phong}`);
    if (seatsResponse.data.success !== "true") {
      throw new Error("Không thể lấy danh sách ghế!");
    }

    // Lấy seats_per_row từ API
    const seatsPerRow = seatsResponse.data.seats_per_row || [];

    // Gọi API để lấy danh sách ghế đã đặt cho lịch chiếu
    const bookingsResponse = await axios.get(`/api/bookings/${ma_lich_chieu}`);
    if (!bookingsResponse.data.success) {
      throw new Error("Không thể lấy danh sách ghế đã đặt!");
    }
    const bookedSeats = (bookingsResponse.data.data.booked_seats || []).map(
      (seat) => seat.trim().toUpperCase()
    );

    // Tạo danh sách ghế từ seats_per_row
    const seats = [];
    for (let i = 0; i < seatsPerRow.length; i++) {
      const rowLabel = String.fromCharCode(65 + i); // A, B, C...
      const seatCount = seatsPerRow[i];
      for (let j = 1; j <= seatCount; j++) {
        const seatId = `${rowLabel}${j}`;
        const status = bookedSeats.includes(seatId) ? "sold" : "available";
        seats.push({ id: seatId, status });
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
  } catch (error) {
    console.error("Lỗi khi lấy danh sách ghế:", error);
    alert("Lỗi: " + (error.message || "Không thể lấy danh sách ghế."));
  }
}

// Hàm render ghế
function renderSeats(seats, seatGrid) {
  seatGrid.innerHTML = ""; // Xóa nội dung cũ
  const rows = [...new Set(seats.map((seat) => seat.id.charAt(0)))]; // Lấy các hàng duy nhất (A, B, C, D)

  rows.forEach((row) => {
    const rowSeats = seats.filter((seat) => seat.id.startsWith(row)); // Lọc ghế theo hàng
    const rowElement = document.createElement("div");
    rowElement.classList.add("seat-row"); // Thêm class cho hàng

    const labelElement = document.createElement("div");
    labelElement.classList.add("row-label");
    labelElement.textContent = row; // Gắn nhãn hàng (A, B, C, D)
    rowElement.appendChild(labelElement);

    rowSeats.forEach((seat) => {
      const seatElement = document.createElement("div");
      seatElement.classList.add("seat", seat.status); // Thêm class tương ứng với trạng thái
      seatElement.textContent = seat.id; // Hiển thị mã ghế
      rowElement.appendChild(seatElement);
    });

    seatGrid.appendChild(rowElement);
  });
}



//#endregion






// Khởi tạo khi trang tải
document.addEventListener("DOMContentLoaded", () => {
  // Đặt ngày mặc định cho input date
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("date").value = today;

  // Tải danh sách rạp khi trang được tải
  loadTheaters();

  // Delegation cho các nút trong #schedule-list
  const scheduleList = document.getElementById("schedule-list");
  scheduleList.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".add-showtime-btn");
    const deleteScheduleBtn = e.target.closest(".delete-schedule-btn");

    if (addBtn) {
      e.preventDefault();
      openAddScheduleModal(addBtn.dataset.roomId, e);
    }

    if (deleteScheduleBtn) {
      e.preventDefault();
      const scheduleId = deleteScheduleBtn.dataset.scheduleId;
      deleteSchedule(scheduleId);
    }
  });

  // Thêm sự kiện cho nút mở modal
  const addBtn = document.getElementById("schedule-add-btn");
  addBtn.addEventListener("click", openAddScheduleModal);

  // Gọi loadSchedules ban đầu
  loadSchedules();
});
