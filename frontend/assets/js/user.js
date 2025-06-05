axios.defaults.baseURL = "http://127.0.0.1:3000";
import { closeAuthModal, switchToLogin } from "./auth.js";

// Xử lý đăng nhập
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;
  const errorDiv = document.getElementById("login-error");

  try {
    const response = await axios.post(
      "/api/users/login",
      {
        ten_dang_nhap: username,
        mat_khau: password,
      },
      { withCredentials: true }
    );

    if (response.data.success === "true") {
      localStorage.setItem("user", JSON.stringify(response.data.data));
      closeAuthModal();
      window.location.reload();
    } else {
      throw new Error(response.data.error || "Đăng nhập thất bại!");
    }
  } catch (err) {
    console.error("Lỗi đăng nhập:", err);

    const errorDiv = document.getElementById("login-error");
    let errorMessage = "Đăng nhập thất bại.";

    if (err.response?.status === 401) {
      errorMessage = "Tài khoản hoặc mật khẩu không đúng!";
      document.getElementById("login-password")?.classList.add("input-error");
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else {
      errorMessage = err.message || "Đăng nhập thất bại.";
    }

    if (errorDiv) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.display = "block";
    } else {
      alert(errorMessage);
    }
  }
}

// Kiểm tra trạng thái đăng nhập
export async function checkAuthStatus() {
  const authBtn = document.getElementById("auth-btn");
  const logoutBtn = document.getElementById("logout-btn");

  try {
    const res = await axios.get("/api/users/me", {
      withCredentials: true,
    });
    if (res.data.success === "true") {
      const user = res.data.data;
      if (authBtn && logoutBtn) {
        authBtn.textContent = `Xin chào, ${user.ho_va_ten}`;
        authBtn.classList.remove("login-btn");
        authBtn.removeAttribute("onclick");
        logoutBtn.style.display = "inline-block";
      }
    }
  } catch (err) {
    console.error("Lỗi khi gọi /api/users/me:", err);
    if (authBtn && logoutBtn) {
      authBtn.textContent = "Đăng Nhập";
      authBtn.classList.add("login-btn");
      authBtn.setAttribute("onclick", "showLoginForm()");
      logoutBtn.style.display = "none";
    }
  }
}

// Đăng xuất
function handleLogout() {
  axios.post("/api/users/logout", {}, { withCredentials: true }).then(() => {
    localStorage.removeItem("user");
    window.location.reload();
  });
}

// Quên mật khẩu
async function handleForgotPassword(e) {
  e.preventDefault();
  const emailInput = document.getElementById("forgot-email");
  const errorDiv = document.getElementById("forgot-error");

  // Reset lỗi cũ nếu có
  emailInput?.classList.remove("input-error");
  if (errorDiv) {
    errorDiv.style.display = "none";
    errorDiv.textContent = "";
  }

  try {
    const res = await axios.post("/api/users/forgot-password", {
      email: emailInput.value,
    });

    if (res.data.success === "true") {
      alert("📧 Đã gửi email đặt lại mật khẩu!");
      switchToLogin();
    } else {
      throw new Error(res.data.error || "Thất bại!");
    }
  } catch (err) {
    let errorMessage = "Có lỗi xảy ra.";
    const errorDiv = document.getElementById("forgot-error");

    if (err.response?.status === 404) {
      errorMessage = "Không tìm thấy người dùng với email này!";
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else {
      errorMessage = err.message || "Gửi yêu cầu thất bại.";
    }

    if (errorDiv) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.display = "block";
    }

    document.getElementById("forgot-email")?.classList.add("input-error");
  }
}

// Đăng ký tài khoản
async function handleRegister(e) {
  e.preventDefault();

  const ten_dang_nhap = document.getElementById("email").value;
  const mat_khau = document.getElementById("password").value;
  const mat_khau_lai = document.getElementById("confirm-password").value;
  const ho_va_ten = document.getElementById("fullname").value;
  const sdt = document.getElementById("phone").value;
  const errorDiv = document.getElementById("register-error");

  if (mat_khau !== mat_khau_lai) {
    errorDiv.textContent = "Mật khẩu nhập lại không khớp.";
    errorDiv.style.display = "block";
    return;
  }

  try {
    const res = await axios.post("/api/users/register", {
      ten_dang_nhap,
      mat_khau,
      ho_va_ten,
      sdt,
    });

    if (res.data.success === true || res.data.success === "true") {
      alert("🎉 Đăng ký thành công! Vui lòng đăng nhập.");
      window.location.reload();
    } else {
      throw new Error(res.data.error || "Đăng ký thất bại!");
    }
  } catch (err) {
    let errorMessage = "Đăng ký thất bại.";

    if (err.response && err.response.status === 409) {
      errorMessage = "Email hoặc tài khoản đã tồn tại!";
      document.getElementById("email")?.classList.add("input-error");
    } else if (err.response?.data?.error) {
      errorMessage = err.response.data.error;
    } else {
      errorMessage = err.message || "Đăng ký thất bại.";
    }

    if (errorDiv) {
      errorDiv.textContent = errorMessage;
      errorDiv.style.display = "block";
    }
  }
}

// Lấy danh sách người dùng
let currentUserId = null;
let currentUserRoleId = null;

// Lấy thông tin người dùng hiện tại từ backend
async function fetchCurrentUser() {
  try {
    const res = await axios.get("/api/users/me", { withCredentials: true });
    if (res.data.success === "true") {
      currentUserId = res.data.data.ma_tai_khoan;
      currentUserRoleId = parseInt(res.data.data.role_id); // đảm bảo là số
      fetchUsers(); // gọi sau khi đã có role
    } else {
      alert("Không lấy được thông tin người dùng hiện tại");
    }
  } catch (err) {
    console.error("Lỗi khi lấy người dùng hiện tại:", err);
    alert("Vui lòng đăng nhập lại!");
    window.location.href = "/login.html";
  }
}

async function fetchUsers() {
  console.log("Bạn là:", currentUserRoleId);
  const userList = document.getElementById("user-list");
  const errorMessage = document.getElementById("error-message");

  try {
    const response = await axios.get("/api/users", { withCredentials: true });

    if (response.data.success === true && Array.isArray(response.data.data)) {
      userList.innerHTML = "";

      response.data.data.forEach((user) => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.ten_dang_nhap}</td>
          <td>${user.ho_va_ten}</td>
          <td>${user.sdt || ""}</td>
          <td>${user.diachi || ""}</td>
          <td>
            <select class="role-select" data-id="${user.ma_tai_khoan}" ${user.role_id === 99 ? "disabled" : ""}>
                <option value="1" ${
                  user.role_id === 1 ? "selected" : ""
                }>Admin</option>
                <option value="2" ${
                  user.role_id === 2 ? "selected" : ""
                }>Nhân viên</option>
                <option value="3" ${
                  user.role_id === 3 ? "selected" : ""
                }>Người dùng</option>
                ${
                  user.role_id === 99
                    ? '<option value="99" selected disabled>SuperAdmin</option>'
                    : ""
                }
            </select>
            ${
              user.role_id === 99 
              ? ""
              :
              `<button class="update-role-btn" data-id="${
                  user.ma_tai_khoan
                }" data-role="${user.role_id}">Cập nhật</button>
            `
            }
          </td>
        `;
        userList.appendChild(row);
      });

      // Gắn sự kiện click sau khi render
      document.querySelectorAll(".update-role-btn").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const userId = btn.getAttribute("data-id");
          const oldRole = parseInt(btn.getAttribute("data-role")); // Lấy vai trò gốc của người bị chỉnh
          const select = document.querySelector(
            `.role-select[data-id="${userId}"]`
          );
          const newRole = parseInt(select.value);

          // Kiểm tra quyền hạn của người dùng hiện tại
          if (currentUserRoleId === 1 && (oldRole === 1 || oldRole === 99)) {
            alert("❌ Bạn không có đủ quyền hạn để chỉnh sửa người này!");
            return;
          }

          try {
            const res = await axios.put(`/api/users/${userId}/role`, {
              role_id: newRole,
            });
            if (res.data.success) {
              alert("✅ Cập nhật vai trò thành công!");
              fetchUsers(); // Reload lại danh sách nếu cần
            } else {
              throw new Error(res.data.error || "Thất bại!");
            }
          } catch (err) {
            console.error("Lỗi cập nhật vai trò:", err);
            alert("❌ Không thể cập nhật vai trò!");
          }
        });
      });
    } else {
      throw new Error("Dữ liệu không hợp lệ hoặc không có người dùng.");
    }
  } catch (err) {
    console.error("Lỗi khi lấy danh sách người dùng:", err);
    if (errorMessage) {
      errorMessage.textContent =
        err.response?.data?.error || "Không thể tải danh sách người dùng.";
      errorMessage.style.display = "block";
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.body.getAttribute("data-page") === "user-list") {
    fetchCurrentUser();
    fetchUsers();
  }
});

// Thêm người dùng trong Hệ thống
document.getElementById("add-user-button")?.addEventListener("click", () => {
  document.getElementById("add-user-modal").style.display = "flex";
});

document.querySelector(".close-modal")?.addEventListener("click", () => {
  document.getElementById("add-user-modal").style.display = "none";
});

document
  .getElementById("confirm-add-user")
  ?.addEventListener("click", async () => {
    const ho_va_ten = document.getElementById("new-fullname").value.trim();
    const ten_dang_nhap = document.getElementById("new-username").value.trim();
    const mat_khau = "1";

    if (!ho_va_ten || !ten_dang_nhap) {
      alert("Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    try {
      const res = await axios.post("/api/users/register", {
        ho_va_ten,
        ten_dang_nhap,
        mat_khau,
      });

      if (res.data.success) {
        alert("🎉 Thêm người dùng thành công!");
        document.getElementById("add-user-modal").style.display = "none";
        fetchUsers();
      } else {
        throw new Error(res.data.error || "Thêm người dùng thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi thêm người dùng:", err);
      alert(err.response?.data?.error || "Không thể thêm người dùng!");
    }
  });

export function initLoginEvents() {
  const loginForm = document.getElementById("login-form-submit");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  const forgotForm = document.getElementById("forgot-password-form-submit");
  if (forgotForm) {
    forgotForm.addEventListener("submit", handleForgotPassword);
  }

  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  const registerForm = document.getElementById("register-form-submit");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
}
