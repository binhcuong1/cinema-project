axios.defaults.baseURL = 'http://localhost:3000';

//DANH SÁCH PHIM
async function fetchNowShowingMovies() {
    const movieList = document.getElementById("movie-list");
    if (!movieList) return;

    try {
        const response = await axios.get('/api/movies/now-showing');
        const movies = response.data;

        if (movies.success !== "true") throw new Error("Dữ liệu không hợp lệ");

        movieList.innerHTML = "";

        if (movies.data.length === 0) {
            movieList.innerHTML = "<p class='no-results'>Không có phim đang chiếu.</p>";
            return;
        }

        const fragment = document.createDocumentFragment();

        movies.data.forEach(movie => {
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

//THÊM PHIM
async function submitAddMovie() {
    const newMovie = {
        ten_phim: document.getElementById('new-movie-title').value,
        mo_ta: document.getElementById('new-movie-description').value,
        ngay_phat_hanh: document.getElementById('new-movie-release-date').value,
        gioi_han_tuoi: parseInt(document.getElementById('new-movie-age-restriction').value),
        noi_dung_phim: document.getElementById('new-movie-content').value,
        image: document.getElementById('new-movie-poster').value,
        thoi_luong_phut: parseInt(document.getElementById('new-movie-duration').value),
        // trang_thai: document.getElementById('new-movie-status').value
    };

    try {
        const response = await axios.post('/api/movies', newMovie);
        const result = response.data;

        if (result.success !== "true") throw new Error(result.message || "Thêm phim thất bại");

        alert("🎉 Thêm phim thành công!");
        window.location.href = "/frontend/pages/index.html";
    } catch (error) {
        console.error("Lỗi khi thêm phim:", error);
        alert("❌ Thêm phim thất bại!");
    }
}

//CHỈNH SỬA PHIM

async function fetchAllMoviesForDropdown() {
    try {
        const res = await axios.get("/api/movies");
        const data = res.data;

        if (data.success !== "true") throw new Error("Không lấy được danh sách phim");

        const select = document.getElementById("movie-select");
        data.data.forEach(movie => {
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

        if (movie.success !== "true") throw new Error('Không thể tải thông tin phim!');

        const data = movie.data[0];

        document.getElementById('ten_phim').value = data.ten_phim;
        document.getElementById('mo_ta').value = data.mo_ta;
        document.getElementById('thoi_luong_phut').value = data.thoi_luong_phut;
        document.getElementById('noi_dung_phim').value = data.noi_dung_phim;
        document.getElementById('trang_thai').value = data.trang_thai;
        document.getElementById("edit-movie-form").dataset.movieId = data.ma_phim;
        document.getElementById('ngay_phat_hanh').value = data.ngay_phat_hanh?.split("T")[0];
        document.getElementById('gioi_han_tuoi').value = data.gioi_han_tuoi;
        document.getElementById('image').value = data.image;

    } catch (error) {
        console.log('Lỗi khi lấy phim:', error);
        alert('Không thể tải thông tin phim!');
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
        image: document.getElementById("image").value
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

        res.data.data.forEach(movie => {
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

//KHỞI TẠO
window.onload = () => {
    const currentPage = document.body.dataset.page;

    if (currentPage === 'index') {
        fetchNowShowingMovies();
    } else if (currentPage === 'add') {
        const form = document.getElementById('add-movie-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            submitAddMovie();
        });
    } else if (currentPage === 'edit') {
        fetchAllMoviesForDropdown();

        const form = document.getElementById('edit-movie-form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            submitEditMovie();
        });
    } else if (currentPage === 'delete') {
        loadMoviesToDelete();
        const form = document.getElementById("delete-movie-form");
        form?.addEventListener("submit", handleDeleteMovie);
    }
};