axios.defaults.baseURL = "http://127.0.0.1:3000";

// === Khởi tạo các biến DOM === //
let movieListNowShowing, btnLeftNowShowing, btnRightNowShowing;
let movieListComingSoon, btnLeftComingSoon, btnRightComingSoon;
let movieListSearch, btnLeftSearch, btnRightSearch; // Biến cho carousel tìm kiếm

function initializeDOM() {
  movieListNowShowing = document.getElementById("movie-list-nowShowing");
  btnLeftNowShowing = document.getElementById("nowShowing-left");
  btnRightNowShowing = document.getElementById("nowShowing-right");
  movieListComingSoon = document.getElementById("movie-list-comingSoon");
  btnLeftComingSoon = document.getElementById("comingSoon-left");
  btnRightComingSoon = document.getElementById("comingSoon-right");
  movieListSearch = document.getElementById("search-results"); // Container kết quả tìm kiếm
  btnLeftSearch = document.getElementById("search-left"); // Nút trái
  btnRightSearch = document.getElementById("search-right"); // Nút phải
}

// === Xử lý cuộn trái/phải cho cả ba phần phim === //

// Hàm xác định số lượng phim cuộn dựa trên kích thước màn hình
function getScrollAmount() {
  const width = window.innerWidth;
  if (width <= 480) return 1; // Mobile: 1 phim
  if (width <= 768) return 2; // Tablet: 2 phim
  return 4; // Desktop: 4 phim
}

// Hàm cuộn cho phim đang chiếu
function scrollMoviesNowShowing(amount) {
  if (!movieListNowShowing) return;
  const card = movieListNowShowing.querySelector(".movie-card");
  if (!card) return;
  const cardWidth = card.offsetWidth + 15;
  const scrollCount = getScrollAmount();
  movieListNowShowing.scrollBy({
    left: amount * cardWidth * scrollCount,
    behavior: "smooth",
  });
}

// Hàm cuộn cho phim sắp chiếu
function scrollMoviesComingSoon(amount) {
  if (!movieListComingSoon) return;
  const card = movieListComingSoon.querySelector(".movie-card");
  if (!card) return;
  const cardWidth = card.offsetWidth + 15;
  const scrollCount = getScrollAmount();
  movieListComingSoon.scrollBy({
    left: amount * cardWidth * scrollCount,
    behavior: "smooth",
  });
}

// Hàm cuộn cho kết quả tìm kiếm
function scrollMoviesSearch(amount) {
  if (!movieListSearch) return;
  const card = movieListSearch.querySelector(".movie-card");
  if (!card) return;
  const cardWidth = card.offsetWidth + 15;
  const scrollCount = getScrollAmount();
  movieListSearch.scrollBy({
    left: amount * cardWidth * scrollCount,
    behavior: "smooth",
  });
}

// Khởi tạo sự kiện khi DOM sẵn sàng
document.addEventListener("DOMContentLoaded", () => {
  initializeDOM();

  if (movieListNowShowing && btnLeftNowShowing && btnRightNowShowing) {
    btnLeftNowShowing.addEventListener("click", () =>
      scrollMoviesNowShowing(-1)
    );
    btnRightNowShowing.addEventListener("click", () =>
      scrollMoviesNowShowing(1)
    );
  }

  if (movieListComingSoon && btnLeftComingSoon && btnRightComingSoon) {
    btnLeftComingSoon.addEventListener("click", () =>
      scrollMoviesComingSoon(-1)
    );
    btnRightComingSoon.addEventListener("click", () =>
      scrollMoviesComingSoon(1)
    );
  }

  if (movieListSearch && btnLeftSearch && btnRightSearch) {
    btnLeftSearch.addEventListener("click", () => scrollMoviesSearch(-1));
    btnRightSearch.addEventListener("click", () => scrollMoviesSearch(1));
  }
});
// ... (Phần còn lại của file movie.js giữ nguyên, bao gồm initializeSearch, fetchSearchMovies, v.v.)
//#region  // === Khu vực Hàm Chung === //

// Hàm chung để lấy và hiển thị danh sách phim
async function fetchAndRenderMovies(endpoint, containerId, renderCallback) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const response = await axios.get(endpoint);
    const data = response.data;

    if (data.success !== true) throw new Error("Dữ liệu không hợp lệ");

    container.innerHTML = "";

    if (data.data.length === 0) {
      container.innerHTML = "<p class='no-results'>Không có phim.</p>";
      return;
    }

    const fragment = document.createDocumentFragment();
    data.data.forEach((movie) => {
      const movieCard = renderCallback(movie);
      fragment.appendChild(movieCard);
    });

    container.appendChild(fragment);
  } catch (error) {
    console.error("Lỗi khi lấy phim:", error);
    container.innerHTML = `<p class='error'>${error.message}</p>`;
  }
}

//#endregion

//#region  // === Khu vực Hiển thị Danh sách Phim === //

// Hiển thị phim đang chiếu
function renderNowShowingMovie(movie) {
  const movieCard = document.createElement("div");
  movieCard.classList.add("index-movie-card");
  movieCard.innerHTML = `
    <div class="index-movie-poster">
      <img src="${movie.image}" alt="${movie.ten_phim}">
    </div>
    <div class="index-movie-info">
      <h3>${movie.ten_phim}</h3>
      <div class="index-movie-meta">
        <span><i class="fas fa-clock"></i> ${movie.thoi_luong_phut} phút</span>
      </div>
    </div>
  `;
  return movieCard;
}

function renderComingSoonMovie(movie) {
  const movieCard = document.createElement("div");
  movieCard.classList.add("index-movie-card");
  movieCard.innerHTML = `
    <div class="index-movie-poster">
      <img src="${movie.image}" alt="${movie.ten_phim}">
    </div>
    <div class="index-movie-info">
      <h3>${movie.ten_phim}</h3>
      <div class="index-movie-meta">
        <span><i class="fas fa-clock"></i> ${movie.thoi_luong_phut} phút</span>
      </div>
    </div>
  `;
  return movieCard;
}

async function fetchNowShowingMovies() {
  await fetchAndRenderMovies(
    "/api/movies/now-showing",
    "movie-list-nowShowing",
    renderNowShowingMovie
  );
}

async function fetchComingSoonMovies() {
  await fetchAndRenderMovies(
    "/api/movies/coming-soon",
    "movie-list-comingSoon",
    renderComingSoonMovie
  );
}

// Hiển thị tất cả phim trong trang quản lý
function renderAllMovieHTML(movie) {
  const statusClass = movie.trang_thai === "dang-chieu" ? "status-now" :
                     movie.trang_thai === "sap-chieu" ? "status-soon" :
                     "status-ended";
  return `
    <div class="movie-card ${statusClass}">
      <div class="movie-poster">
        <img src="${movie.image}" alt="${movie.ten_phim}">
      </div>
      <div class="movie-info">
        <h3>${movie.ten_phim}</h3>
        <div class="movie-meta">
          <span><i class="fas fa-clock"></i> ${movie.thoi_luong_phut} phút</span>
          <span class="movie-status">${movie.trang_thai.replace("-", " ").toUpperCase()}</span>
        </div>
      </div>
      <div class="movie-overlay">
        <button onclick="hrefToViewDetail('${movie.ma_phim}')" class="detail-btn">Chi tiết</button>
        <button onclick="hrefToEdit('${movie.ma_phim}')" class="edit-btn">Sửa</button>
        <button onclick="deleteMovie('${movie.ma_phim}', '${movie.da_xoa}')" class="delete-btn">Xóa</button>
      </div>
    </div>
  `;
}

async function fetchAndInitSlickMovies() {
  try {
    const response = await axios.get("/api/movies/");
    if (!response.data.success)
      throw new Error("Không lấy được danh sách phim");

    const movies = response.data.data;

    // Phân loại
    const now = movies.filter((m) => m.trang_thai === "dang-chieu");
    const soon = movies.filter((m) => m.trang_thai === "sap-chieu");
    const end = movies.filter((m) => m.trang_thai === "khong-chieu");

    // Render + init Slick
    const renderSlick = (list, containerId) => {
      const container = $(`#${containerId}`);
      container.html(""); // Clear
      list.forEach((movie) => container.append(renderAllMovieHTML(movie)));
      container.slick({
        slidesToShow: 4,
        slidesToScroll: 1,
        rows: 1,
        infinite: false,
        arrows: true,
        prevArrow:
          '<button type="button" class="slick-prev custom-arrow"><i class="fas fa-chevron-left"></i></button>',
        nextArrow:
          '<button type="button" class="slick-next custom-arrow"><i class="fas fa-chevron-right"></i></button>',
        responsive: [
          {
            breakpoint: 992,
            settings: { slidesToShow: 3, rows: 1 },
          },
          {
            breakpoint: 768,
            settings: { slidesToShow: 2, rows: 1 },
          },
          {
            breakpoint: 480,
            settings: { slidesToShow: 1, rows: 1 },
          },
        ],
      });
    };

    renderSlick(now, "slick-now-showing");
    renderSlick(soon, "slick-coming-soon");
    renderSlick(end, "slick-ended");
  } catch (error) {
    console.error("Lỗi load phim Slick:", error);
  }
}

// Hiển thị phim trong kết quả tìm kiếm
function renderSearchMovie(movie) {
  const movieCard = document.createElement("div");
  movieCard.classList.add("movie-card");
  movieCard.innerHTML = `
    <div class="movie-poster">
      <img src="${movie.image}" alt="${movie.ten_phim}">
      <div class="movie-overlay">
        ${
          movie.trang_thai === "dang-chieu"
            ? `<button onclick="window.location.href='/frontend/pages/booking/select-showtime.html'">Đặt vé</button>`
            : ""
        }
      </div>
  ${
    movie.trang_thai === "dang-chieu"
      ? `
    <a href="/frontend/pages/booking/select-showtime.html" class="booking-link">
      Đặt vé
    </a>`
      : ""
  }
</div> 
    </div>
    <div class="movie-info">
      <div class="movie-title-wrapper">
        <h3 style="display: inline; margin-right: 10px;">${movie.ten_phim}</h3>
        <span class="age-restriction"><i class="fas fa-user-shield"></i> ${
          movie.gioi_han_tuoi
        }</span>
      </div>
      <div class="movie-meta">
        <span><i class="fas fa-clock"></i> ${movie.thoi_luong_phut} phút</span>
      </div>
    </div>
  `;
  return movieCard;
}

// Hiển thị kết quả tìm kiếm
async function fetchSearchMovies(keyword) {
  if (!keyword) {
    const container = document.getElementById("search-results");
    if (container) {
      container.innerHTML =
        "<p class='no-results'>Vui lòng nhập từ khóa tìm kiếm.</p>";
    }
    return;
  } c
  await fetchAndRenderMovies(
    `/api/movies/search?keyword=${encodeURIComponent(keyword)}`,
    "search-results",
    renderSearchMovie
  );
}

// Gắn sự kiện tìm kiếm
function initializeSearch() {
  console.log("✅ Hàm initializeSearch đã chạy");

  const tryInitialize = () => {
    const searchBtn = document.getElementById("search-btn");
    const searchInput = document.getElementById("search-input");

    if (searchBtn && searchInput) {
      console.log("✅ Tìm thấy search-btn và search-input");
      searchBtn.addEventListener("click", () => {
        const keyword = searchInput.value.trim();
        console.log("🔍 Nhấn nút tìm kiếm với từ khóa:", keyword);
        if (keyword) {
          window.location.href = `/frontend/pages/search.html?keyword=${encodeURIComponent(
            keyword
          )}`;
        } else {
          alert("Vui lòng nhập từ khóa tìm kiếm!");
        }
      });

      searchInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
          const keyword = searchInput.value.trim();
          console.log("🔍 Nhấn Enter với từ khóa:", keyword);
          if (keyword) {
            window.location.href = `/frontend/pages/search.html?keyword=${encodeURIComponent(
              keyword
            )}`;
          } else {
            alert("Vui lòng nhập từ khóa tìm kiếm!");
          }
        }
      });
    } else {
      console.warn("⏳ Chưa tìm thấy search-btn hoặc search-input, thử lại...");
      setTimeout(tryInitialize, 100); // Thử lại sau 100ms
    }
  };

  tryInitialize();
}
//#endregion

//#region // === Khu vực Chuyển hướng === //

function hrefToViewDetail(movieId) {
  window.location.href = `/frontend/pages/movie/movie-detail.html?id=${movieId}`;
}

function hrefToEdit(movieId) {
  window.location.href = `/frontend/pages/movie/edit.html?id=${movieId}`;
}
//#endregion

//#region // === Khu vực Xử lý Xóa Phim === //

async function deleteMovie(movieId, status) {
  if (status == 1) {
    alert("Phim này đã xóa rồi không xóa nữa!");
    return;
  }
  if (!confirm("Bạn có chắc chắn muốn xóa phim này?")) return;

  try {
    const response = await axios.delete(`/api/movies/${movieId}`);
    if (response.data.success === "true") {
      alert("✅ Xóa mềm phim thành công!");
      window.location.href = "/frontend/pages/movie/list.html";
    } else {
      throw new Error("Xóa phim thất bại");
    }
  } catch (error) {
    console.error("Lỗi khi xóa phim:", error);
    alert("❌ Xóa phim thất bại!");
  }
}
//#endregion

//#region  // === Khu vực Thêm Phim === //

async function handleAddMovieSubmit(event) {
  event.preventDefault();
  // Kiểm tra và lấy nội dung từ CKEditor
  const editorTextarea = document.querySelector("#new-movie-content");
  if (window.editorInstance && editorTextarea) {
    const content = window.editorInstance.getData();
    if (!content.trim()) {
      alert("❌ Vui lòng nhập nội dung phim!");
      return;
    }
    editorTextarea.value = content;
  }
  const form = event.target;
  const formData = new FormData(form);

  try {
    const response = await axios.post("/api/movies/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 201) {
      alert("Thêm phim thành công!");
      form.reset();
    } else {
      alert("Có lỗi xảy ra khi thêm phim.");
    }
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu:", error);
    alert("Lỗi: " + (error.response?.data?.error || "Không thể thêm phim."));
  }
}

//#endregion

//#region  // === Khu vực Sửa Phim === //

async function handleEditMovieSubmit(event) {
  event.preventDefault();
  const editorTextarea = document.querySelector("#new-movie-content");
  if (window.editorInstance && editorTextarea) {
    const content = window.editorInstance.getData();
    if (!content.trim()) {
      alert("❌ Vui lòng nhập nội dung phim!");
      return;
    }
    editorTextarea.value = content;
  }
  const form = event.target;
  const movieId = form.dataset.movieId;

  if (!movieId) {
    alert("Không tìm thấy id phim!");
    return;
  }

  const formData = new FormData(form);

  try {
    const response = await axios.put(`/api/movies/${movieId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (response.status === 200) {
      alert("Sửa phim thành công!");
      window.location.href = "/frontend/pages/movie/list.html";
    } else {
      alert("Có lỗi xảy ra khi sửa phim.");
    }
  } catch (error) {
    console.error("Lỗi khi gửi yêu cầu:", error);
    alert("Lỗi: " + (error.response?.data?.error || "Không thể sửa phim."));
  }
}

async function showMovieEdit() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("id");

  if (!movieId) {
    alert("Không tìm thấy id phim!");
    return;
  }

  try {
    const response = await axios.get(`/api/movies/${movieId}`);
    const movie = response.data;

    if (movie.success !== "true")
      throw new Error("Không thể tải thông tin phim!");

    const data = movie.data;
    const movieDetail = document.getElementById("sectionEdit");
    movieDetail.innerHTML = `
      <div class="form-container">
        <form id="edit-movie-form" class="add-movie-form" enctype="multipart/form-data">
          <div class="form-grid">
            <div class="form-column">
              <div class="form-group">
                <label for="new-movie-title">Tên phim:</label>
                <input type="text" id="new-movie-title" name="ten_phim" value="${
                  data.ten_phim
                }" required />
              </div>
              <div class="form-group">
                <label for="new-movie-release-date">Ngày phát hành:</label>
                <input type="date" id="new-movie-release-date" name="ngay_phat_hanh" value="${
                  data.ngay_phat_hanh?.split("T")[0]
                }" required />
              </div>
              <div class="form-group">
                <label for="new-movie-age-restriction">Giới hạn độ tuổi:</label>
                <select id="new-movie-age-restriction" name="gioi_han_tuoi" required>
                  <option value="">Chọn giới hạn độ tuổi</option>
                  <option value="P" ${
                    data.gioi_han_tuoi === "P" ? "selected" : ""
                  }>P - Phù hợp mọi lứa tuổi</option>
                  <option value="K" ${
                    data.gioi_han_tuoi === "K" ? "selected" : ""
                  }>K - Khuyến cáo có người lớn đi kèm</option>
                  <option value="T13" ${
                    data.gioi_han_tuoi === "T13" ? "selected" : ""
                  }>T13 - Từ 13 tuổi trở lên</option>
                  <option value="T16" ${
                    data.gioi_han_tuoi === "T16" ? "selected" : ""
                  }>T16 - Từ 16 tuổi trở lên</option>
                  <option value="T18" ${
                    data.gioi_han_tuoi === "T18" ? "selected" : ""
                  }>T18 - Từ 18 tuổi trở lên</option>
                </select>
              </div>
              <div class="form-group">
                <label for="status">Trạng thái phim:</label>
                <select id="status" name="trang_thai" required>
                  <option value="">Chọn trạng thái</option>
                  <option value="dang-chieu">Đang chiếu</option>
                  <option value="sap-chieu">Sắp chiếu</option>
                  <option value="khong-chieu">Không chiếu</option>
                </select>
              </div>
              <div class="form-group">
                <label for="new-movie-duration">Thời lượng (phút):</label>
                <input type="number" id="new-movie-duration" name="thoi_luong_phut" value="${
                  data.thoi_luong_phut
                }" required />
              </div>
              <div class="form-group">
                <label for="new-movie-trailer">Trailer:</label>
                <input type="text" id="new-movie-trailer" name="trailer" value="${
                  data.trailer || ""
                }" />
              </div>
            </div>
            <div class="form-column">
              <div class="form-group">
                <label for="new-movie-description">Mô tả ngắn:</label>
                <textarea id="new-movie-description" name="mo_ta" >${
                  data.mo_ta
                }</textarea>
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
                <p>Hình ảnh hiện tại: <img src="${
                  data.image
                }" alt="Poster hiện tại" style="max-width: 100px; max-height: 100px;" /></p>
              </div>
            </div>
          </div>
          <div class="form-group">
                <label for="new-movie-content">Nội dung chi tiết:</label>
                <textarea id="new-movie-content" name="noi_dung_phim" required>${
                  data.noi_dung_phim
                }</textarea>
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
      </div>
    `;

    const form = document.getElementById("edit-movie-form");
    if (form) {
      form.dataset.movieId = data.ma_phim;
      form.addEventListener("submit", handleEditMovieSubmit);

      if (window.ClassicEditor) {
        ClassicEditor.create(document.querySelector("#new-movie-content"))
          .then((editor) => {
            window.editorInstance = editor;
          })
          .catch((error) => {
            console.error("CKEditor lỗi:", error);
          });
      }
    }
  } catch (error) {
    console.error("Lỗi khi lấy phim:", error);
    const movieDetail = document.getElementById("sectionEdit");
    movieDetail.innerHTML = `<p class='error'>${error.message}</p>`;
  }
}

//#endregion

//#region // === Khu vực Hiển thị Chi tiết Phim === //

async function showMovieDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const movieId = urlParams.get("id");

  if (!movieId) {
    alert("Không tìm thấy id phim!");
    return;
  }

  try {
    const response = await axios.get(`/api/movies/${movieId}`);
    const movie = response.data.data;
    const isDeleted = movie.da_xoa == 1 ? "Đã xóa" : "Chưa xóa";

    const movieDetail = document.getElementById("movieDetail");
    movieDetail.innerHTML = `
      <div class="movie-details-container">
        <div class="movie-poster">
          <img src="${movie.image}" alt="${movie.ten_phim}">
        </div>
        <div class="movie-info-details">
          <h2>${movie.ten_phim}</h2>
          <div class="movie-meta-details">
            <p><i class="fas fa-clock"></i> <strong>Thời lượng:</strong> ${movie.thoi_luong_phut}</p>
            <p><i class="fas fa-calendar-alt"></i> <strong>Ngày phát hành:</strong> ${movie.ngay_phat_hanh}</p>
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
            <h3>Trailer:</h3>
            <p><a href="${movie.trailer}" target="_blank">${movie.trailer}</a></p>
          </div>
          <div class="movie-content">
            <h3>Trạng thái xóa mềm:</h3>
            <p>${isDeleted}</p>
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

//#endregion

//#region // === Khu vực xử lý Tìm kiếm phim === //

// Hàm render kết quả tìm kiếm 
function renderQuickSearchMovie(movie) {
  const statusClass = movie.trang_thai === "dang-chieu" ? "status-now" :
                     movie.trang_thai === "sap-chieu" ? "status-soon" :
                     "status-ended";
  return `
    <div class="movie-card ${statusClass}">
      <div class="movie-poster">
        <img src="${movie.image}" alt="${movie.ten_phim}">
      </div>
      <div class="movie-info">
        <h3>${movie.ten_phim}</h3>
        <div class="movie-meta">
          <span><i class="fas fa-clock"></i> ${movie.thoi_luong_phut} phút</span>
          <span class="movie-status">${movie.trang_thai.replace("-", " ").toUpperCase()}</span>
        </div>
      </div>
      <div class="movie-overlay">
        <button onclick="hrefToViewDetail('${movie.ma_phim}')">Chi tiết</button>
        <button onclick="hrefToEdit('${movie.ma_phim}')">Sửa</button>
        <button onclick="deleteMovie('${movie.ma_phim}', '${movie.da_xoa}')" class="delete-btn">Xóa</button>
      </div>
    </div>
  `;
}

// Hàm tìm kiếm nhanh
async function quickSearchMovies(keyword) {
  const container = $("#quick-search-results");
  const resultsSection = document.getElementById("quick-search-results");

  if (!keyword) {
    resultsSection.style.display = "none";
    container.html("");
    return;
  }

  try {
    const response = await axios.get(`/api/movies/search?keyword=${encodeURIComponent(keyword)}`);
    const data = response.data;

    if (!data.success) throw new Error("Dữ liệu không hợp lệ");

    // Hủy Slick nếu đã khởi tạo
    if (container.hasClass("slick-initialized")) {
      container.slick("unslick");
    }

    container.html(""); // Clear kết quả cũ
    resultsSection.style.display = "block"; // Hiện container kết quả

    if (data.data.length === 0) {
      container.html("<p class='no-results'>Không tìm thấy phim.</p>");
      return;
    }

    data.data.forEach((movie) => container.append(renderQuickSearchMovie(movie)));

    // Khởi tạo lại Slick cho kết quả tìm kiếm
    container.slick({
      slidesToShow: 4,
      slidesToScroll: 1,
      rows: 1,
      infinite: false,
      arrows: true,
      prevArrow: '<button type="button" class="slick-prev custom-arrow"><i class="fas fa-chevron-left"></i></button>',
      nextArrow: '<button type="button" class="slick-next custom-arrow"><i class="fas fa-chevron-right"></i></button>',
      responsive: [
        { breakpoint: 992, settings: { slidesToShow: 3, rows: 1 } },
        { breakpoint: 768, settings: { slidesToShow: 2, rows: 1 } },
        { breakpoint: 480, settings: { slidesToShow: 1, rows: 1 } },
      ],
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm:", error);
    container.html(`<p class='error'>${error.message}</p>`);
  }
}

// Gắn sự kiện cho thanh tìm kiếm nhanh
function initializeQuickSearch() {
  const searchInput = document.getElementById("quick-search-input");
  const searchBtn = document.getElementById("quick-search-btn");

  if (searchInput && searchBtn) {
    // Tìm kiếm khi nhấn nút
    searchBtn.addEventListener("click", () => {
      const keyword = searchInput.value.trim();
      quickSearchMovies(keyword);
    });

    // Tìm kiếm khi nhấn Enter
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const keyword = searchInput.value.trim();
        quickSearchMovies(keyword);
      }
    });
  }
}

//#endregion


// === Khu vực Khởi tạo === //
window.onload = () => {
  const currentPage = document.body.dataset.page;

  initializeSearch();
  initializeQuickSearch(); 
  switch (currentPage) {
    case "index":
      fetchNowShowingMovies();
      fetchComingSoonMovies();
      break;
    case "booking":
      fetchNowShowingMovies();
      fetchComingSoonMovies();
      break;
    case "add":
      const addForm = document.getElementById("add-movie-form");
      if (addForm) {
        addForm.addEventListener("submit", handleAddMovieSubmit);
      }

      if (window.ClassicEditor) {
        ClassicEditor.create(document.querySelector("#new-movie-content"))
          .then((editor) => {
            window.editorInstance = editor;
          })
          .catch((error) => {
            console.error("CKEditor lỗi:", error);
          });
      } else {
        console.warn(
          "ClassicEditor chưa load. Bạn có chắc đã thêm <script src='ckeditor.js'> vào HTML?"
        );
      }
      break;
    case "list":
      fetchAndInitSlickMovies();
      break;
    case "detail":
      showMovieDetail();
      break;
    case "edit":
      showMovieEdit();
      break;
    case "search":
      const urlParams = new URLSearchParams(window.location.search);
      const keyword = urlParams.get("keyword");
      fetchSearchMovies(keyword);
      break;
    default:
      console.log("Trang không xác định:", currentPage);
  }
};
