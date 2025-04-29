// Thiết lập base URL cho axios
axios.defaults.baseURL = 'http://127.0.0.1:3000';

// 1. KHỞI TẠO GIAO DIỆN
// Hàm tải và khởi tạo footer
function initializeFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) {
        console.error('Không tìm thấy footer-container trong trang');
        return;
    }

    axios.get('http://127.0.0.1:5500/frontend/pages/shares/footer.html')
        .then(response => {
            footerContainer.innerHTML = response.data;
            console.log('Footer đã được tải thành công');
        })
        .catch(error => console.error('Lỗi khi tải footer:', error));
}

// Hàm tải và khởi tạo header, sidebar và modal đăng nhập
async function initializeHeaderAndSidebar() {
    try {
        // Load header
        const headerResponse = await axios.get('http://127.0.0.1:5500/frontend/pages/shares/header.html');
        const headerPlaceholder = document.getElementById('header-placeholder');
        if (!headerPlaceholder) throw new Error('Không tìm thấy header-placeholder trong trang');
        headerPlaceholder.innerHTML = headerResponse.data;
        console.log('Header đã được tải thành công');

        // Load sidebar
        const sidebarResponse = await axios.get('http://127.0.0.1:5500/frontend/pages/shares/sidebar.html');
        const sidebarPlaceholder = document.getElementById('sidebar-placeholder');
        if (!sidebarPlaceholder) throw new Error('Không tìm thấy sidebar-placeholder trong trang');
        sidebarPlaceholder.innerHTML = sidebarResponse.data;
        console.log('Sidebar đã được tải thành công');

        // Khởi tạo sự kiện cho sidebar
        initializeSidebarEvents();

        // Khởi tạo modal đăng nhập
        await initializeAuthModal();

        // Gắn sự kiện cho các form đăng nhập/đăng ký/quên mật khẩu
        initLoginEvents();

        // Kiểm tra trạng thái đăng nhập
        await checkAuthStatus();

        // Gắn sự kiện cho nút "Đăng Nhập"
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', showLoginForm);
        } else {
            console.error('Không tìm thấy nút Đăng Nhập trong header');
        }
    } catch (error) {
        console.error('Lỗi khi tải layout:', error);
    }
}

// Hàm khởi tạo sự kiện cho sidebar
function initializeSidebarEvents() {
    const adminBtn = document.getElementById('adminBtn');
    const adminSidebar = document.getElementById('adminSidebar');
    const closeSidebar = document.getElementById('closeSidebar');

    if (adminBtn && adminSidebar && closeSidebar) {
        adminBtn.addEventListener('click', () => {
            adminSidebar.classList.toggle('hidden');
        });

        closeSidebar.addEventListener('click', () => {
            adminSidebar.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!adminSidebar.contains(e.target) && e.target !== adminBtn) {
                adminSidebar.classList.add('hidden');
            }
        });
    } else {
        console.error('Không tìm thấy các phần tử cần thiết cho sidebar');
        if (!adminBtn) console.error('Không tìm thấy adminBtn');
        if (!adminSidebar) console.error('Không tìm thấy adminSidebar');
        if (!closeSidebar) console.error('Không tìm thấy closeSidebar');
    }
}

// Hàm tải và khởi tạo modal đăng nhập
function initializeAuthModal() {
    return new Promise((resolve, reject) => {
        const authContainer = document.getElementById('auth-container');
        if (!authContainer) {
            console.error('Không tìm thấy auth-container trong trang');
            reject('Không tìm thấy auth-container');
            return;
        }

        axios.get('http://127.0.0.1:5500/frontend/pages/auth/auth-modal.html')
            .then(response => {
                authContainer.innerHTML = response.data;

                // Đợi DOM cập nhật rồi mới gắn sự kiện
                requestAnimationFrame(() => {
                    // Mắt hiện/ẩn mật khẩu
                    document.querySelectorAll('.eye-icon').forEach(icon => {
                        icon.addEventListener('click', () => {
                            const input = icon.parentElement.querySelector('input');
                            const isPassword = input.type === 'password';
                            input.type = isPassword ? 'text' : 'password';
                            icon.innerHTML = `<span class="eye-icon"><i class="fas fa-eye${isPassword ? '-slash' : ''}"></i></span>`;
                        });
                    });

                    // TẮT modal
                    document.querySelectorAll('.close-form-btn')?.forEach(btn =>
                        btn.addEventListener('click', closeAuthModal)
                    );

                    // Gắn sự kiện chuyển đổi giữa các form
                    document.querySelectorAll('.switch-login')?.forEach(btn =>
                        btn.addEventListener('click', switchToLogin)
                    );
                    document.querySelectorAll('.switch-register')?.forEach(btn =>
                        btn.addEventListener('click', switchToRegister)
                    );
                    document.querySelectorAll('.forgot-password')?.forEach(link =>
                        link.addEventListener('click', switchToForgotPassword)
                    );
                    document.querySelectorAll('.google-login-btn')?.forEach(btn =>
                        btn.addEventListener('click', continueWithGoogle)
                    );

                    resolve();
                });
            })
            .catch(error => {
                console.error('Lỗi khi tải modal:', error);
                reject(error);
            });
    });
}

// 2. XỬ LÝ MODAL ĐĂNG NHẬP/ĐĂNG KÝ
// Hiển thị modal và form đăng nhập
function showLoginForm() {
    const modal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordForm = document.getElementById('forgot-password-form');

    if (!modal || !loginForm) {
        console.error('Modal hoặc form đăng nhập không tồn tại');
        return;
    }

    modal.classList.add('active');
    loginForm.classList.add('visible');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    forgotPasswordForm.style.display = 'none';

    document.querySelector('#login-form .tab:nth-child(1)').classList.add('active');
    document.querySelector('#login-form .tab:nth-child(2)').classList.remove('active');
}

// Chuyển sang form đăng ký
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

// Chuyển về form đăng nhập
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

// Chuyển sang form quên mật khẩu
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

// Đóng modal
function closeAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('active');
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('forgot-password-form').style.display = 'none';
}

// Đăng nhập bằng Google
function continueWithGoogle() {
    const clientId = '645538866530-ntui5qvddhtr4dgiohal1nooj59t4q6h.apps.googleusercontent.com';
    const redirectUri = 'http://127.0.0.1:3000/api/auth/google/callback';
    const scope = 'profile email';
    const responseType = 'code';

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}&access_type=offline&prompt=consent`;
    window.location.href = authUrl;
}

// Xử lý callback Google
function handleGoogleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
        console.log('Authorization code:', code);
        alert('Đăng nhập bằng Google thành công! Mã xác thực: ' + code);
    }
}

// 3. XỬ LÝ ĐĂNG NHẬP/ĐĂNG KÝ/QUÊN MẬT KHẨU
// Xử lý đăng nhập
async function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');

    try {
        const response = await axios.post('/api/users/login', {
            ten_dang_nhap: username,
            mat_khau: password
        }, { withCredentials: true });

        if (response.data.success === 'true') {
            localStorage.setItem('user', JSON.stringify(response.data.data));
            closeAuthModal();
            window.location.reload();
        } else {
            throw new Error(response.data.error || 'Đăng nhập thất bại!');
        }
    } catch (err) {
        console.error('Lỗi đăng nhập:', err);

        let errorMessage = 'Đăng nhập thất bại.';

        if (err.response?.status === 401) {
            errorMessage = 'Tài khoản hoặc mật khẩu không đúng!';
            document.getElementById('login-password')?.classList.add('input-error');
        } else if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
        } else {
            errorMessage = err.message || 'Đăng nhập thất bại.';
        }

        if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        } else {
            alert(errorMessage);
        }
    }
}

// Kiểm tra trạng thái đăng nhập
async function checkAuthStatus() {
    const authBtn = document.getElementById('auth-btn');
    const logoutBtn = document.getElementById('logout-btn');

    try {
        const res = await axios.get('/api/users/me', {
            withCredentials: true
        });
        if (res.data.success === 'true') {
            const user = res.data.data;
            if (authBtn && logoutBtn) {
                authBtn.textContent = `Xin chào, ${user.ho_va_ten}`;
                authBtn.classList.remove('login-btn');
                authBtn.removeAttribute('onclick');
                logoutBtn.style.display = 'inline-block';
            }
        }
    } catch (err) {
        console.error('Lỗi khi gọi /api/users/me:', err);
        if (authBtn && logoutBtn) {
            authBtn.textContent = 'Đăng Nhập';
            authBtn.classList.add('login-btn');
            authBtn.setAttribute('onclick', 'showLoginForm()');
            logoutBtn.style.display = 'none';
        }
    }
}

// Đăng xuất
function handleLogout() {
    axios.post('/api/users/logout', {}, { withCredentials: true }).then(() => {
        localStorage.removeItem('user');
        window.location.reload();
    });
}

// Quên mật khẩu
async function handleForgotPassword(e) {
    e.preventDefault();
    const emailInput = document.getElementById('forgot-email');
    const errorDiv = document.getElementById('forgot-error');

    // Reset lỗi cũ nếu có
    emailInput?.classList.remove('input-error');
    if (errorDiv) {
        errorDiv.style.display = 'none';
        errorDiv.textContent = '';
    }

    try {
        const res = await axios.post('/api/users/forgot-password', { email: emailInput.value });

        if (res.data.success === 'true') {
            alert('📧 Đã gửi email đặt lại mật khẩu!');
            switchToLogin();
        } else {
            throw new Error(res.data.error || 'Thất bại!');
        }
    } catch (err) {
        let errorMessage = 'Có lỗi xảy ra.';
        const errorDiv = document.getElementById('forgot-error');

        if (err.response?.status === 404) {
            errorMessage = 'Không tìm thấy người dùng với email này!';
        } else if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
        } else {
            errorMessage = err.message || 'Gửi yêu cầu thất bại.';
        }

        if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        }

        document.getElementById('forgot-email')?.classList.add('input-error');
    }
}

// Đăng ký tài khoản
async function handleRegister(e) {
    e.preventDefault();

    const ten_dang_nhap = document.getElementById('email').value;
    const mat_khau = document.getElementById('password').value;
    const mat_khau_lai = document.getElementById('confirm-password').value;
    const ho_va_ten = document.getElementById('fullname').value;
    const sdt = document.getElementById('phone').value;
    const errorDiv = document.getElementById('register-error');

    if (mat_khau !== mat_khau_lai) {
        errorDiv.textContent = 'Mật khẩu nhập lại không khớp.';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        const res = await axios.post('/api/users/register', {
            ten_dang_nhap,
            mat_khau,
            ho_va_ten,
            sdt
        });

        if (res.data.success === true || res.data.success === 'true') {
            alert('🎉 Đăng ký thành công! Vui lòng đăng nhập.');
            window.location.reload();
        } else {
            throw new Error(res.data.error || 'Đăng ký thất bại!');
        }
    } catch (err) {
        let errorMessage = 'Đăng ký thất bại.';

        if (err.response && err.response.status === 409) {
            errorMessage = 'Email hoặc tài khoản đã tồn tại!';
            document.getElementById('email')?.classList.add('input-error');
        } else if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
        } else {
            errorMessage = err.message || 'Đăng ký thất bại.';
        }

        if (errorDiv) {
            errorDiv.textContent = errorMessage;
            errorDiv.style.display = 'block';
        }
    }
}

// Gắn sự kiện cho các form
function initLoginEvents() {
    const loginForm = document.getElementById('login-form-submit');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const forgotForm = document.getElementById('forgot-password-form-submit');
    if (forgotForm) {
        forgotForm.addEventListener('submit', handleForgotPassword);
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }

    const registerForm = document.getElementById('register-form-submit');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// 4. KHỞI TẠO KHI TRANG TẢI
document.addEventListener('DOMContentLoaded', () => {
    initializeFooter();
    initializeHeaderAndSidebar();
});

window.onload = () => {
    handleGoogleCallback();
};