axios.defaults.baseURL = 'http://localhost:3000';

// Hàm lấy movieList
function getMovieListElement() {
    const element = document.getElementById("movie-list");
    if (!element) {
        alert("Không tìm thấy phần tử movie-list trong DOM.");
    }
    return element;
}

// Hàm lấy movieId từ query string
function getMovieIdFromQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    if (!id) {
        alert("Không có movieId trong query string.");
    }
    return id;
}

// Hàm lấy danh sách phim đang chiếu
async function fetchNowShowingMovies() {
    const movieList = getMovieListElement();
    
    try {
        const response = await axios.get('/api/movies/now-showing'); // Gọi API

        const movies = response.data;

        if (movies.success !== "true") {
            throw new Error("Không thể tải danh sách phim! Dữ liệu không hợp lệ");
        }

        movieList.innerHTML = "";

        if (movies.data.length === 0) {
            movieList.innerHTML = "<p class='no-results'>Không có phim đang chiếu.</p>";
            return;
        }

        // Tạo DocumentFragment để tối ưu hiệu suất
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

        // Thêm tất cả thẻ phim vào movieList một lần duy nhất
        movieList.appendChild(fragment);
    } catch (error) {
        let errorMessage = "Lỗi kết nối server!";
        if (error.response) {
            // Lỗi từ server (như 404, 500)
            errorMessage = `Lỗi từ server: ${error.response.status} - ${error.response.data.message || "Không xác định"}`;
        } else if (error.request) {
            // Không nhận được phản hồi từ server
            errorMessage = "Không thể kết nối đến server. Kiểm tra xem server có đang chạy không!";
        } else {
            // Lỗi khác (như lỗi dữ liệu)
            errorMessage = error.message;
        }
        console.log('Lỗi khi lấy phim: ', error);
        movieList.innerHTML = `<p class='error'>${errorMessage}</p>`;
    }
}

// Hàm lấy thông tin chi tiết phim để chỉnh sửa
async function fetchMovie() {
    const movieID = getMovieIdFromQuery();

    try {
        const response = await axios.get(`/api/movies/${movieID}`);
        
        const movie = response.data;
        
        if (movie.success !== "true") 
            throw new Error('Không thể tải thông tin phim!');

        document.getElementById('ten_phim').value = movie.data[0].ten_phim;
        document.getElementById('mo_ta').value = movie.data[0].mo_ta;
        document.getElementById('thoi_luong_phut').value = movie.data[0].thoi_luong_phut;
        document.getElementById('noi_dung_phim').value = movie.data[0].noi_dung_phim;
    } catch (error) {
        console.log('Lỗi khi lấy phim:', error);
        alert('Không thể tải thông tin phim!');
    }
}

// Hàm gửi yêu cầu cập nhật phim
async function submitEditMovie() {
    const updateMovie = {
        ten_phim: document.getElementById("ten_phim").value,
        mo_ta: document.getElementById("mo_ta").value,
        thoi_luong_phut: document.getElementById("thoi_luong_phut").value,
        noi_dung_phim: document.getElementById("noi_dung_phim").value,
    }
    const movieID = getMovieIdFromQuery();

    try {
        const response = await axios.put(`/api/movies/${movieID}`, updateMovie); 
        const result = response.data;

        if (result.success !== "true")
            throw new Error("Lỗi khi cập nhật phim");

        alert('Cập nhật phim thành công!');
        window.location.href = 'index.html';
    } catch (error) {
        console.log('Lỗi khi cập nhật phim:', error);
        alert('Lỗi khi cập nhật phim!');
    }
}

window.onload = () => {
    const currentPage = document.body.dataset.page;
    
    if (currentPage === 'index') {
        fetchNowShowingMovies();
    } else if (currentPage === 'edit') {
        fetchMovie();
    }
};