// Hàm để tải và chèn modal vào DOM
function initializeAuthModal() {
    const authContainer = document.getElementById('auth-container');
    if (!authContainer) {
        console.error('Không tìm thấy auth-container trong trang');
        return;
    }

    axios.get('/frontend/pages/auth/auth-modal.html') 
    .then(response => {
        const html = response.data;
        authContainer.innerHTML = html;

        document.querySelectorAll('.eye-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                const input = icon.parentElement.querySelector('input');
                const isPassword = input.type == 'password';
                input.type = isPassword ? 'text' : 'password';
                icon.innerHTML = `<span class="eye-icon"><i class="fas fa-eye${isPassword ? '-slash' : ''}"></i></span>`;
            });
        });
    })
    .catch(error => console.error('Lỗi khi tải modal:', error));
}

// Gọi ngay lập tức để đảm bảo modal sẵn sàng
initializeAuthModal();

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

// Khởi tạo
window.onload = () => {
    handleGoogleCallback(); 
};