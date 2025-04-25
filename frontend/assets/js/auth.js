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

                    // Gắn đúng cho tất cả form có nút này
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

export function closeAuthModal() {
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

// Khởi tạo
window.onload = () => {
    handleGoogleCallback();
};

export {
    initializeAuthModal,
    showLoginForm
};
