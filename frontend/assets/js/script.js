// Xử lý banner
const banners = [
    { image: "@@@@@", title: "Âm Dương Lộ" },
    { image: "@@@@@", title: "Gấu Yêu Của Anh" },
];

let currentBannerIndex = 0;

function prevBanner() {
    currentBannerIndex = (currentBannerIndex - 1 + banners.length) % banners.length;
    updateBanner();
}

function nextBanner() {
    currentBannerIndex = (currentBannerIndex + 1) % banners.length;
    updateBanner();
}

function updateBanner() {
    const bannerImage = document.getElementById('banner-image');
    bannerImage.src = banners[currentBannerIndex].image;
    document.querySelector('.banner-info h1').textContent = banners[currentBannerIndex].title;
}

function bookTicket() {
    alert(`Bạn đã chọn đặt vé cho phim: ${banners[currentBannerIndex].title}`);
    window.location.href = 'booking.html';
}

setInterval(nextBanner, 5000);

// Chức năng đặt vé nhanh
let selectedTheater = null;
let selectedMovie = null;
let selectedDate = null;
let selectedShowtime = null;

const theaterBtn = document.getElementById('select-theater');
const movieBtn = document.getElementById('select-movie');
const dateBtn = document.getElementById('select-date');
const showtimeBtn = document.getElementById('select-showtime');
const bookNowBtn = document.getElementById('book-now');

const theaterDropdown = document.getElementById('theater-dropdown');
const movieDropdown = document.getElementById('movie-dropdown');
const dateDropdown = document.getElementById('date-dropdown');
const showtimeDropdown = document.getElementById('showtime-dropdown');

function toggleDropdown(button, dropdown) {
    const isVisible = dropdown.classList.contains('active');
    document.querySelectorAll('.step-dropdown').forEach(dd => dd.classList.remove('active'));
    if (!isVisible && !button.disabled) {
        dropdown.classList.add('active');
    }
}

theaterBtn.addEventListener('click', () => toggleDropdown(theaterBtn, theaterDropdown));
movieBtn.addEventListener('click', () => toggleDropdown(movieBtn, movieDropdown));
dateBtn.addEventListener('click', () => toggleDropdown(dateBtn, dateDropdown));
showtimeBtn.addEventListener('click', () => toggleDropdown(showtimeBtn, showtimeDropdown));

function selectTheater(theater) {
    selectedTheater = theater;
    theaterBtn.querySelector('.step-label').textContent = theater;
    theaterBtn.classList.add('selected');
    theaterDropdown.classList.remove('active');
    movieBtn.disabled = false;
}

function selectMovie(movie) {
    selectedMovie = movie;
    movieBtn.querySelector('.step-label').textContent = movie;
    movieBtn.classList.add('selected');
    movieDropdown.classList.remove('active');
    dateBtn.disabled = false;
}

function selectDate(date) {
    selectedDate = date;
    dateBtn.querySelector('.step-label').textContent = date;
    dateBtn.classList.add('selected');
    dateDropdown.classList.remove('active');
    showtimeBtn.disabled = false;
}

function selectShowtime(showtime) {
    selectedShowtime = showtime;
    showtimeBtn.querySelector('.step-label').textContent = showtime;
    showtimeBtn.classList.add('selected');
    showtimeDropdown.classList.remove('active');
    bookNowBtn.disabled = false;
}

bookNowBtn.addEventListener('click', () => {
    if (!bookNowBtn.disabled) {
        alert(`Bạn đã đặt vé thành công!\nRạp: ${selectedTheater}\nPhim: ${selectedMovie}\nNgày: ${selectedDate}\nSuất: ${selectedShowtime}`);
        resetBookingForm();
    }
});

function resetBookingForm() {
    selectedTheater = null;
    selectedMovie = null;
    selectedDate = null;
    selectedShowtime = null;
    
    theaterBtn.querySelector('.step-label').textContent = 'Chọn Rạp';
    movieBtn.querySelector('.step-label').textContent = 'Chọn Phim';
    dateBtn.querySelector('.step-label').textContent = 'Chọn Ngày';
    showtimeBtn.querySelector('.step-label').textContent = 'Chọn Suất';
    
    theaterBtn.classList.remove('selected');
    movieBtn.classList.remove('selected');
    dateBtn.classList.remove('selected');
    showtimeBtn.classList.remove('selected');
    
    movieBtn.disabled = true;
    dateBtn.disabled = true;
    showtimeBtn.disabled = true;
    bookNowBtn.disabled = true;
}

document.addEventListener('click', (e) => {
    if (!e.target.closest('.booking-step')) {
        document.querySelectorAll('.step-dropdown').forEach(dd => dd.classList.remove('active'));
    }
});

// Chức năng danh sách phim
const movies = [
    { title: "Âm Dương Lộ", status: "now-showing", location: "hcm", poster:"@@@@", rating: "8.5", duration: "135 phút" },
    { title: "Phim 2", status: "coming-soon", location: "hcm", poster: "@@@@", rating: "8.0", duration: "120 phút" },
    { title: "Phim 3", status: "now-showing", location: "hn", poster:"/@@@@", rating: "7.8", duration: "110 phút" },
    { title: "Phim 4", status: "coming-soon", location: "dn", poster: "@@@@", rating: "8.2", duration: "125 phút" },
    { title: "Phim 5", status: "now-showing", location: "vungtau", poster: "@@@@", rating: "7.5", duration: "115 phút" },
    { title: "Phim 6", status: "now-showing", location: "hcm", poster: "@@@@", rating: "8.7", duration: "140 phút" },
];

let currentStatus = "now-showing";
let currentLocation = "all";

function showMovies(status) {
    currentStatus = status;
    document.querySelectorAll(".category-tab").forEach(tab => tab.classList.remove("active"));
    document.querySelector(`button[onclick="showMovies('${status}')"]`).classList.add("active");
    filterMovies();
}

function filterByCountry() {
    currentLocation = document.getElementById("country").value;
    filterMovies();
}

function filterMovies(searchTerm = "") {
    const movieList = document.getElementById("movie-list");
    movieList.innerHTML = "";

    const filteredMovies = movies.filter(movie => {
        const matchesStatus = movie.status === currentStatus;
        const matchesLocation = currentLocation === "all" || movie.location === currentLocation;
        const matchesSearch = searchTerm ? movie.title.toLowerCase().includes(searchTerm.toLowerCase()) : true;
        return matchesStatus && matchesLocation && matchesSearch;
    });

    filteredMovies.forEach(movie => {
        const movieCard = document.createElement("div");
        movieCard.classList.add("movie-card");
        movieCard.innerHTML = `
            <div class="movie-poster">
                <img src="${movie.poster}" alt="${movie.title}">
                <div class="movie-overlay">
                    <button onclick="window.location.href='booking.html'">Đặt vé</button>
                    <button onclick="window.location.href='movie-detail.html'">Chi tiết</button>
                    <button onclick="window.location.href='add.html'">Thêm</button>
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
        movieList.appendChild(movieCard);
    });

    if (filteredMovies.length === 0) {
        movieList.innerHTML = "<p class='no-results'>Không tìm thấy phim nào.</p>";
    }
}

// Hiển thị modal và form đăng nhập
function showLoginForm() {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    modal.classList.add('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';

    document.querySelector('#login-form .tab:nth-child(1)').classList.add('active');
    document.querySelector('#login-form .tab:nth-child(2)').classList.remove('active');
}

// Chuyển từ form đăng nhập sang form đăng ký
function switchToRegister() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    forgotPasswordForm.style.display = 'none';

    document.querySelector('#register-form .tab:nth-child(1)').classList.remove('active');
    document.querySelector('#register-form .tab:nth-child(2)').classList.add('active');
}

// Chuyển từ form đăng ký về form đăng nhập
function switchToLogin() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';

    document.querySelector('#login-form .tab:nth-child(1)').classList.add('active');
    document.querySelector('#login-form .tab:nth-child(2)').classList.remove('active');
}

// Chuyển đến form quên mật khẩu
function switchToForgotPassword() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'block';

    document.querySelector('#forgot-password-form .tab:nth-child(1)').classList.remove('active');
    document.querySelector('#forgot-password-form .tab:nth-child(2)').classList.add('active');
}

// Đóng toàn bộ modal
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    modal.classList.remove('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';

    document.querySelector('#login-form .tab:nth-child(1)').classList.add('active');
    document.querySelector('#login-form .tab:nth-child(2)').classList.remove('active');
}

// Xử lý hiện/ẩn mật khẩu
document.querySelectorAll('.eye-icon').forEach(icon => {
    icon.addEventListener('click', function () {
        const input = this.parentElement.querySelector('input');
        if (input.type === 'password') {
            input.type = 'text';
            this.innerHTML = '<i class="fas fa-eye-slash"></i>';
        } else {
            input.type = 'password';
            this.innerHTML = '<i class="fas fa-eye"></i>';
        }
    });
});

// Xử lý đăng nhập bằng Google
function continueWithGoogle() {
    // Cấu hình thông tin đăng nhập Google
    const clientId = 'YOUR_CLIENT_ID.apps.googleusercontent.com'; // Thay YOUR_CLIENT_ID bằng Client ID của bạn
    const redirectUri = 'http://localhost:3000/auth/google/callback'; // Thay bằng redirect URI của bạn
    const scope = 'profile email'; // Quyền truy cập: thông tin hồ sơ và email
    const responseType = 'code'; // Loại phản hồi: mã xác thực

    // Tạo URL đăng nhập Google
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;

    // Chuyển hướng người dùng đến trang đăng nhập Google
    window.location.href = authUrl;
}

// Xử lý callback sau khi đăng nhập Google (nếu cần)
function handleGoogleCallback() {
    // Lấy mã xác thực từ URL (nếu redirect URI được gọi lại)
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        // Gửi mã xác thực đến backend để lấy token và thông tin người dùng
        console.log('Authorization code:', code);
        // Gọi API backend để xử lý mã này (cần triển khai phía server)
        alert('Đăng nhập bằng Google thành công! Mã xác thực: ' + code);
    }
}

// Gọi hàm xử lý callback khi trang được tải
window.onload = function () {
    handleGoogleCallback();
};

function searchMovies() {
    const searchTerm = document.querySelector(".search-bar input").value;
    filterMovies(searchTerm);
}

window.onload = () => {
    showMovies("now-showing");
};