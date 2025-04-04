const movies = [
    { title: "Âm Dương Lộ", status: "now-showing", location: "hcm", poster: "/frontend/assets/images/am-duong-lo.webp", rating: "8.5", duration: "135 phút" },
    { title: "Phim 2", status: "coming-soon", location: "hcm", poster: "/frontend/assets/images/cuoi-ma-giai-han.webp", rating: "8.0", duration: "120 phút" },
    { title: "Phim 3", status: "now-showing", location: "hn", poster: "/frontend/assets/images/dia-dao-cu-chi_1.webp", rating: "7.8", duration: "110 phút" },
    { title: "Phim 4", status: "coming-soon", location: "dn", poster: "/frontend/assets/images/tim-xac.webp", rating: "8.2", duration: "125 phút" },
    { title: "Phim 5", status: "now-showing", location: "vungtau", poster: "/frontend/assets/images/cuoc-xe-kinh-hoang.webp", rating: "7.5", duration: "115 phút" },
    { title: "Phim 6", status: "now-showing", location: "hcm", poster: "/frontend/assets/images/poporo.webp", rating: "8.7", duration: "140 phút" },
];

// Lấy phần tử movie-list
const movieList = document.getElementById("movie-list");

// Duyệt qua từng phim trong mảng movies
movies.forEach(movie => {
    // Tạo thẻ div cho mỗi phim
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");
    movieCard.innerHTML = `
        <div class="movie-poster">
            <img src="${movie.poster}" alt="${movie.title}">
            <div class="movie-overlay">
                <button onclick="window.location.href='booking.html'">Đặt vé</button>
                <button onclick="window.location.href='movie-detail.html'">Chi tiết</button>
                <button onclick="window.location.href=''">Thêm</button>
                <button onclick="window.location.href='#'">Xóa</button>
                <button onclick="window.location.href='#'">Sửa</button>
            </div>
        </div>
        <div class="movie-info">
            <h3>${movie.title}</h3>
            <div class="movie-meta">
                <span><i class="fas fa-star"></i> ${movie.rating}</span>
                <span><i class="fas fa-clock"></i> ${movie.duration}</span>
            </div>
        </div>
    `;
    // Thêm thẻ phim vào movieList
    movieList.appendChild(movieCard);
});