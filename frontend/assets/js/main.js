import { initializeAuthModal, showLoginForm } from './auth.js';
import { initLoginEvents, checkAuthStatus } from './user.js';

document.addEventListener('DOMContentLoaded', async () => {
    initializeFooter();
    await initializeHeaderAndSidebar(); // sau đó gọi auth modal từ đây
});

async function initializeHeaderAndSidebar() {
    try {
        // Load header
        const headerResponse = await axios.get('http://127.0.0.1:5500/frontend/pages/shares/header.html');
        document.getElementById('header-placeholder').innerHTML = headerResponse.data;
        console.log('Header đã được tải thành công');

        // Load sidebar
        const sidebarResponse = await axios.get('http://127.0.0.1:5500/frontend/pages/shares/sidebar.html');
        document.getElementById('sidebar-placeholder').innerHTML = sidebarResponse.data;
        console.log('Sidebar đã được tải thành công');

        // Gọi auth modal từ file auth.js
        await initializeAuthModal();

        // ✅ Gắn sau khi tất cả modal + DOM đã có
        initLoginEvents();
        checkAuthStatus();
        // Gắn sự kiện sau khi modal đã tải xong
        document.querySelector('.login-btn')?.addEventListener('click', showLoginForm);

    } catch (error) {
        console.error('Lỗi khi tải layout:', error);
    }
}

function initializeFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) {
        console.error('Không tìm thấy footer-container');
        return;
    }

    axios.get('http://127.0.0.1:5500/frontend/pages/shares/footer.html')
        .then(response => {
            footerContainer.innerHTML = response.data;
            console.log('Footer đã được tải thành công');
        })
        .catch(error => console.error('Lỗi khi tải footer:', error));
}

// Hàm tải và khởi tạo modal đăng nhập
function initializeAuthModal() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) {
        console.error('Không tìm thấy auth-container trong trang');
        throw new Error('Không tìm thấy auth-container');
    }

    return axios.get('http://127.0.0.1:5500/frontend/pages/auth/auth-modal.html')
        .then(response => {
            const html = response.data;
            authContainer.innerHTML = html;
            console.log('Auth modal đã được tải thành công');

            // Gắn sự kiện cho icon mắt (eye-icon)
            document.querySelectorAll('.eye-icon').forEach(icon => {
                icon.addEventListener('click', () => {
                    const input = icon.parentElement.querySelector('input');
                    const isPassword = input.type === 'password';
                    input.type = isPassword ? 'text' : 'password';
                    icon.innerHTML = `<span class="eye-icon"><i class="fas fa-eye${isPassword ? '-slash' : ''}"></i></span>`;
                });
            });
        })
        .catch(error => {
            console.error('Lỗi khi tải auth modal:', error);
            throw error;
        });
}

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
    const clientId = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:3000/auth/google/callback';
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

async function initializeHeaderAndSidebar() {
    try {
        // Tải header
        const headerResponse = await axios.get('http://127.0.0.1:5500/frontend/pages/shares/header.html');
        document.getElementById('header-placeholder').innerHTML = headerResponse.data;
        console.log('Header đã được tải thành công');

        // Tải sidebar
        const sidebarResponse = await axios.get('http://127.0.0.1:5500/frontend/pages/shares/sidebar.html');
        document.getElementById('sidebar-placeholder').innerHTML = sidebarResponse.data;
        console.log('Sidebar đã được tải thành công');

        // Tải auth modal
        await initializeAuthModal();

        // Sau khi tất cả được tải, gắn sự kiện cho nút "Đăng Nhập"
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                showLoginForm();
            });
        } else {
            console.error('Không tìm thấy nút Đăng Nhập trong header');
        }

        // Gắn sự kiện cho các nút trong auth modal
        const closeModalBtn = document.querySelector('.close-form-btn');
        const switchToRegisterBtn = document.querySelector('#login-form .tab:nth-child(2)');
        const switchToLoginBtn = document.querySelector('#register-form .tab:nth-child(1)');
        const forgotPasswordLink = document.querySelector('.forgot-password');
        const googleLoginBtn = document.querySelector('.google-login-btn');

        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', closeAuthModal);
        }
        if (switchToRegisterBtn) {
            switchToRegisterBtn.addEventListener('click', switchToRegister);
        }
        if (switchToLoginBtn) {
            switchToLoginBtn.addEventListener('click', switchToLogin);
        }
        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', switchToForgotPassword);
        }
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', continueWithGoogle);
        }

        // Khởi tạo sự kiện cho sidebar
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
        }
    } catch (error) {
        console.error('Lỗi trong quá trình tải header, sidebar hoặc auth modal:', error);
    }
}

// Gắn vào sự kiện DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initializeFooter();
    initializeHeaderAndSidebar();
});

// Xử lý callback Google khi trang tải
window.onload = () => {
    handleGoogleCallback();
};