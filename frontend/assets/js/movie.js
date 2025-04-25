axios.defaults.baseURL = 'http://127.0.0.1:3000';
//DANH SÁCH PHIM ĐANG CHIẾU
async function fetchNowShowingMovies() {
  const movieList = document.getElementById("movie-list-nowShowing");
  if (!movieList) return;

  try {
    const response = await axios.get("/api/movies/now-showing");
    const movies = response.data;

    if (movies.success !== "true") throw new Error("Dữ liệu không hợp lệ");

    movieList.innerHTML = "";

    if (movies.data.length === 0) {
      movieList.innerHTML =
        "<p class='no-results'>Không có phim đang chiếu.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();

    movies.data.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.classList.add("movie-card");
      movieCard.innerHTML = `
                <div class="movie-poster">
                    <img src="${movie.image}" alt="${movie.ten_phim}">
                    <div class="movie-overlay">
                        <button onclick="window.location.href='booking.html'">Đặt vé</button>
                        <button onclick="window.location.href='movie-detail.html'">Chi tiết</button>
                        <button onclick="window.location.href='edit.html?id=${movie.ma_phim}'">Sửa</button>
                    </div>
                </div>
                <div class="movie-info">
                    <h3>${movie.ten_phim}</h3>
                    <div class="movie-meta">
                        <span><i class="fas fa-clock"></i> ${movie.thoi_luong_phut} phút</span>
                    </div>
                </div>
            `;
      fragment.appendChild(movieCard);
    });

    movieList.appendChild(fragment);
  } catch (error) {
    console.error("Lỗi khi lấy phim:", error);
    movieList.innerHTML = `<p class='error'>${error.message}</p>`;
  }
}

// DANH SÁCH PHIM CỦA TRANG QUẢN LÝ
async function fetchAllMovieToList() {
  const movieList = document.getElementById("movie-list");
  if (!movieList) return;

  try {
    const response = await axios.get("/api/movies/");
    const movies = response.data;

    if (movies.success !== "true") throw new Error("Dữ liệu không hợp lệ");

    movieList.innerHTML = "";

    if (movies.data.length === 0) {
      movieList.innerHTML = "<p class='no-results'>Không có phim.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();

    movies.data.forEach((movie) => {
      const movieCard = document.createElement("div");
      movieCard.classList.add("movie-card");
      movieCard.innerHTML = `
                <div class="movie-poster">
                    <img src="${movie.image}" alt="${movie.ten_phim}">
                </div>
                <div class="movie-overlay">
                    <button onclick="hrefToViewDetail('${movie.ma_phim}')">Chi tiết</button>
                    <button onclick="hrefToEdit('${movie.ma_phim}')">Sửa</button>
                    <button onclick="deleteMovie('${movie.ma_phim}', '${movie.da_xoa}')" class="delete-btn">Xóa</button>
                </div>
                <div class="movie-info">
                    <h3>${movie.ten_phim}</h3>
                    <div class="movie-meta">
                        <span><i class="fas fa-clock"></i> ${movie.thoi_luong_phut}</span>
                    </div>
                </div>
            `;
      fragment.appendChild(movieCard);
    });

    movieList.appendChild(fragment);
  } catch (error) {
    console.error("Lỗi khi lấy phim:", error);
    movieList.innerHTML = `<p class='error'>${error.message}</p>`;
  }
}

function hrefToViewDetail(movieId) {
  window.location.href = `/frontend/pages/movie/movie-detail.html?id=${movieId}`;
}

function hrefToEdit(movieId) {
  window.location.href = `/frontend/pages/movie/edit.html?id=${movieId}`;
}

async function deleteMovie(movieId, status) {
  if (status == 1) {
    alert("Phim này đã được xóa!");
    return;
  }
  if (!confirm("Bạn có chắc chắn muốn xóa phim này?")) return;

  try {
    const response = await axios.delete(`/api/movies/${movieId}`);
    if (response.data.success === true || response.data.success === "true") {
      alert("✅ Xóa phim thành công!");
      window.location.href = "/frontend/pages/movie/list.html";
    } else {
      throw new Error("Xóa phim thất bại");
    }
  } catch (error) {
    console.error("Lỗi khi xóa phim:", error);
    alert("❌ Xóa phim thất bại!");
  }
}

//THÊM PHIM
async function submitAddMovie() {
  const addMovieForm = document.getElementById("add-movie-form");

  if (addMovieForm) {
    addMovieForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(addMovieForm);

      try {
        const response = await axios.post("/api/movies/", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.status === 201) {
          alert("Thêm phim thành công!");

          const posterPath = response.data.poster;
          console.log("Tên file poster:", fileName);

          addMovieForm.reset();
        } else {
          alert("Có lỗi xảy ra khi thêm phim.");
        }
      } catch (error) {
        console.error("Lỗi khi gửi yêu cầu:", error);
        alert(
          "Lỗi: " + (error.response?.data?.error || "Không thể thêm phim.")
        );
      }
    });
  }
}

async function fetchAllMoviesForDropdown() {
  try {
    const res = await axios.get("/api/movies");
    const data = res.data;

    if (data.success !== "true")
      throw new Error("Không lấy được danh sách phim");

    const select = document.getElementById("movie-select");
    data.data.forEach((movie) => {
      const option = document.createElement("option");
      option.value = movie.ma_phim;
      option.textContent = movie.ten_phim;
      select.appendChild(option);
    });

    select.addEventListener("change", (e) => {
      const selectedId = e.target.value;
      if (selectedId) {
        fetchMovieById(selectedId);
      }
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phim:", err);
  }
}

async function fetchMovieById(movieId) {
  try {
    const response = await axios.get(`/api/movies/${movieId}`);
    const movie = response.data;

    if (movie.success !== "true")
      throw new Error("Không thể tải thông tin phim!");

    const data = movie.data[0];

    document.getElementById("ten_phim").value = data.ten_phim;
    document.getElementById("mo_ta").value = data.mo_ta;
    document.getElementById("thoi_luong_phut").value = data.thoi_luong_phut;
    document.getElementById("noi_dung_phim").value = data.noi_dung_phim;
    document.getElementById("trang_thai").value = data.trang_thai;
    document.getElementById("edit-movie-form").dataset.movieId = data.ma_phim;
    document.getElementById("ngay_phat_hanh").value =
      data.ngay_phat_hanh?.split("T")[0];
    document.getElementById("gioi_han_tuoi").value = data.gioi_han_tuoi;
    document.getElementById("image").value = data.image;
  } catch (error) {
    console.log("Lỗi khi lấy phim:", error);
    alert("Không thể tải thông tin phim!");
  }
}

// Lấy danh sách giới hạn độ tuổi và điền vào dropdown
async function showMovieDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieID = urlParams.get("id");

  if (!movieID) {
    alert("Không tìm thấy id phim!");
    return;
  }

  try {
    const response = await axios.get(`/api/movies/${movieID}`);
    const movie = response.data;

    if (movie.success !== "true")
      throw new Error("Không thể tải thông tin phim!");

    const data = movie.data[0]; // Lấy thông tin phim từ mảng data

    const movieDetail = document.getElementById("movieDetail");
    movieDetail.innerHTML = `
            <div class="movie-details-container">
                <div class="movie-poster">
                    <img src="${data.image}" alt="${data.ten_phim}">
                </div>
                <div class="movie-info-details">
                    <h2>${data.ten_phim}</h2>
                    <div class="movie-meta-details">
                        <p><i class="fas fa-clock"></i> <strong>Thời lượng:</strong> ${data.thoi_luong_phut
      } phút</p>
                        <p><i class="fas fa-calendar-alt"></i> <strong>Ngày phát hành:</strong> ${data.ngay_phat_hanh?.split("T")[0]
      }</p>
                        <p><i class="fas fa-user-shield"></i> <strong>Giới hạn độ tuổi:</strong> ${data.gioi_han_tuoi
      }</p>
                        <p><i class="fas fa-tags"></i> <strong>Thể loại:</strong> ${data.the_loai || "Không có thông tin"
      }</p>
                    </div>
                    <div class="movie-description">
                        <h3>Mô tả ngắn:</h3>
                        <p>${data.mo_ta}</p>
                    </div>
                    <div class="movie-content">
                        <h3>Nội dung chi tiết:</h3>
                        <p>${data.noi_dung_phim}</p>
                    </div>
                    <div class="movie-actions">
                        <button class="book-btn" onclick="bookTicket('${data.ma_phim
      }')">
                            <i class="fas fa-ticket-alt"></i> Đặt vé
                        </button>
                        <button class="edit-btn" onclick="editMovie('${data.ma_phim
      }')">
                            <i class="fas fa-edit"></i> Sửa
                        </button>
                        <button class="delete-btn" onclick="deleteMovie('${data.ma_phim
      }')">
                            <i class="fas fa-trash"></i> Xóa
                        </button>
                    </div>
                </div>
            </div>
        `;
  } catch (error) {
    console.error("Lỗi khi lấy phim:", error);
    const movieDetail = document.getElementById("movieDetail");
    movieDetail.innerHTML = `<p class='error'>${error.message}</p>`;
  }
}

async function submitEditMovie() {
  const updateMovie = {
    ten_phim: document.getElementById("ten_phim").value,
    mo_ta: document.getElementById("mo_ta").value,
    thoi_luong_phut: parseInt(document.getElementById("thoi_luong_phut").value),
    noi_dung_phim: document.getElementById("noi_dung_phim").value,
    trang_thai: document.getElementById("trang_thai").value,
    ngay_phat_hanh: document.getElementById("ngay_phat_hanh").value,
    gioi_han_tuoi: parseInt(document.getElementById("gioi_han_tuoi").value),
    image: document.getElementById("image").value,
  };

  const movieID = document.getElementById("edit-movie-form").dataset.movieId;
  if (!movieID) {
    alert("Vui lòng chọn phim để cập nhật.");
    return;
  }

  try {
    const response = await axios.put(`/api/movies/${movieID}`, updateMovie);
    const result = response.data;

    if (result.success !== "true") throw new Error("Lỗi khi cập nhật phim");

    alert("✅ Cập nhật phim thành công!");
    window.location.href = "/frontend/pages/index.html";
  } catch (error) {
    console.log("Lỗi khi cập nhật phim:", error);
    alert("❌ Lỗi khi cập nhật phim!");
  }
}
//XÓA PHIM
async function loadMoviesToDelete() {
  try {
    const res = await axios.get("/api/movies");
    const select = document.getElementById("delete-movie-select");

    res.data.data.forEach((movie) => {
      const option = document.createElement("option");
      option.value = movie.ma_phim;
      option.textContent = movie.ten_phim;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phim:", err);
    alert("Không thể tải danh sách phim.");
  }
}

async function handleDeleteMovie(e) {
  e.preventDefault();

  const select = document.getElementById("delete-movie-select");
  const movieId = select.value;

  if (!movieId) {
    alert("Vui lòng chọn phim để xoá.");
    return;
  }

  if (!confirm("Bạn có chắc chắn muốn xoá phim này?")) return;

  try {
    const res = await axios.delete(`/api/movies/${movieId}`);
    if (res.data.success === true || res.data.success === "true") {
      alert("✅ Xoá phim thành công!");
      window.location.reload();
    } else {
      throw new Error("Xoá thất bại");
    }
  } catch (err) {
    console.error("Lỗi xoá phim:", err);
    alert("❌ Xoá phim thất bại!");
  }
}

async function showMovieDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieID = urlParams.get("id");

  if (!movieID) alert("Không tìm thấy id phim!");

  try {
    const response = await axios.get(`api/movies/${movieID}`);
    const movie = response.data.data[0];

    const isDeleted = movie.trang_thai == 1 ? "Đã xóa" : "Chưa xóa";

    const movieDetail = document.getElementById("movieDetail");
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-details-container");
    movieCard.innerHTML = `
                <div class="movie-poster">
                        <img src="${movie.image}" alt="${movie.ten_phim}">
                    </div>
                    <div class="movie-info-details">
                        <h2>${movie.ten_phim}</h2>
                        <div class="movie-meta-details">
                            <p><i class="fas fa-clock"></i> <strong>Thời lượng:</strong> ${movie.thoi_luong_phut}</p>
                            <p><i class="fas fa-calendar-alt"></i> <strong>Ngày phát hành:</strong> ${movie.ngay_phat_hanh} </p>
                            <p><i class="fas fa-user-shield"></i> <strong>Giới hạn độ tuổi:</strong> ${movie.gioi_han_tuoi}</p>
                            <p><i class="fas fa-tags"></i> <strong>Thể loại:</strong> </p>
                        </div>
                        <div class="movie-description">
                            <h3>Mô tả ngắn:</h3>
                            <p>${movie.mo_ta}</p>
                        </div>
                        <div class="movie-content">
                            <h3>Nội dung chi tiết:</h3>
                            <p>${movie.noi_dung_phim}</p>
                        </div>
                        <div class="movie-content">
                            <h3>Trạng thái xóa mềm:</h3>
                            <p>${isDeleted}</p>
                        </div>
                    </div>
        `;

    movieDetail.appendChild(movieCard);
  } catch (error) {
    console.error("Lỗi khi lấy phim:", error);
    movieList.innerHTML = `<p class='error'>${error.message}</p>`;
  }
}

async function showMovieEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieID = urlParams.get("id");

  if (!movieID) {
    alert("Không tìm thấy id phim!");
    return;
  }

  try {
    const response = await axios.get(`/api/movies/${movieID}`);
    const movie = response.data;

    if (movie.success !== "true") {
      throw new Error("Không thể tải thông tin phim!");
    }

    const data = movie.data[0]; // Lấy thông tin phim từ mảng data

    const movieDetail = document.getElementById("sectionEdit");
    const movieCard = document.createElement("div");
    movieCard.classList.add("form-container");
    movieCard.innerHTML = `
          <form id="edit-movie-form" class="add-movie-form" enctype="multipart/form-data">
              <div class="form-grid">
                  <div class="form-column">
                      <div class="form-group">
                          <label for="new-movie-title">Tên phim:</label>
                          <input type="text" id="new-movie-title" name="ten_phim" value="${data.ten_phim}" required />
                      </div>
                      <div class="form-group">
                          <label for="new-movie-release-date">Ngày phát hành:</label>
                          <input type="date" id="new-movie-release-date" name="ngay_phat_hanh" value="${data.ngay_phat_hanh?.split("T")[0]}" required />
                      </div>
                      <div class="form-group">
                          <label for="new-movie-age-restriction">Giới hạn độ tuổi:</label>
                          <select id="new-movie-age-restriction" name="gioi_han_tuoi" required>
                              <option value="">Chọn giới hạn độ tuổi</option>
                              <option value="P" ${data.gioi_han_tuoi === "P" ? "selected" : ""}>P - Phù hợp mọi lứa tuổi</option>
                              <option value="K" ${data.gioi_han_tuoi === "K" ? "selected" : ""}>K - Khuyến cáo có người lớn đi kèm</option>
                              <option value="T13" ${data.gioi_han_tuoi === "T13" ? "selected" : ""}>T13 - Từ 13 tuổi trở lên</option>
                              <option value="T16" ${data.gioi_han_tuoi === "T16" ? "selected" : ""}>T16 - Từ 16 tuổi trở lên</option>
                              <option value="T18" ${data.gioi_han_tuoi === "T18" ? "selected" : ""}>T18 - Từ 18 tuổi trở lên</option>
                          </select>
                      </div>
                      <div class="form-group">
                          <label for="new-movie-duration">Thời lượng (phút):</label>
                          <input type="number" id="new-movie-duration" name="thoi_luong_phut" value="${data.thoi_luong_phut}" required />
                      </div>
                  </div>
                  <div class="form-column">
                      <div class="form-group">
                          <label for="new-movie-description">Mô tả ngắn:</label>
                          <textarea id="new-movie-description" name="mo_ta" required>${data.mo_ta}</textarea>
                      </div>
                      <div class="form-group">
                          <label for="new-movie-content">Nội dung chi tiết:</label>
                          <textarea id="new-movie-content" name="noi_dung_phim" required>${data.noi_dung_phim}</textarea>
                      </div>
                  </div>
              </div>
              <div class="form-group poster-upload">
                  <label for="new-movie-poster">Ảnh poster:</label>
                  <div class="poster-preview-container">
                      <div class="upload-controls">
                          <label for="new-movie-poster" class="custom-file-upload">
                              <i class="fas fa-upload"></i> Chọn ảnh
                          </label>
                          <input type="file" id="new-movie-poster" name="poster" accept="image/*" />
                          <p class="file-requirements">Định dạng: JPG, PNG. Kích thước tối đa: 5MB</p>
                          <p>Hình ảnh hiện tại: <img src="${data.image}" alt="Poster hiện tại" style="max-width: 100px; max-height: 100px;" /></p>
                      </div>
                  </div>
              </div>
              <div class="form-actions">
                  <button type="button" class="back-btn" onclick="window.location.href='/frontend/pages/movie/list.html'">
                      <i class="fas fa-arrow-left"></i> Quay lại
                  </button>
                  <button type="submit" class="next-btn">
                      <i class="fas fa-edit"></i> Sửa Phim
                  </button>
              </div>
          </form>
      `;

    movieDetail.appendChild(movieCard);

    // Gán movieID vào dataset của form để sử dụng khi submit
    document.getElementById("edit-movie-form").dataset.movieId = data.ma_phim;
  } catch (error) {
    console.error("Lỗi khi lấy phim:", error);
    const movieDetail = document.getElementById("sectionEdit");
    movieDetail.innerHTML = `<p class='error'>${error.message}</p>`;
  }
}

//KHỞI TẠO
window.onload = () => {
  const currentPage = document.body.dataset.page;

  if (currentPage === "index") {
    fetchNowShowingMovies();
  } else if (currentPage === "add") {
    const form = document.getElementById("add-movie-form");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      submitAddMovie();
    });

    fetchAgeRestriction();
  } else if (currentPage === "#") {
    // fetchAllMoviesForDropdown();

    // const form = document.getElementById("edit-movie-form");
    // form?.addEventListener("submit", (e) => {
    //   e.preventDefault();
    //   submitEditMovie();
    // });
  } else if (currentPage === "delete") {
    loadMoviesToDelete();
    const form = document.getElementById("delete-movie-form");
    form?.addEventListener("submit", handleDeleteMovie);
  } else if (currentPage === "list") {
    fetchAllMovieToList();
    // const form = document.getElementById("delete-movie-form");
    // form?.addEventListener("submit", handleDeleteMovie);
  } else if (currentPage === "detail") {
    showMovieDetail();
  } else if (currentPage === "edit") {
    showMovieEdit();
  }
};
