axios.defaults.baseURL = ' http://localhost:3000';
import { closeAuthModal } from './auth.js';


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

        const errorDiv = document.getElementById('login-error');
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
export async function checkAuthStatus() {
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

export function initLoginEvents() {
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



