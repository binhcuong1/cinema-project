const jwt = require('jsonwebtoken');
const User = require('../models/User');
const JWT_SECRET = 'bi_mat_token';
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');


require('dotenv').config();
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

exports.login = (req, res) => {
    const { ten_dang_nhap, mat_khau } = req.body;
    
    if (!ten_dang_nhap || !mat_khau) {
        return res.status(400).json({ success: 'false', error: 'Thiếu thông tin' });
    }
    
    User.login(ten_dang_nhap, mat_khau, (err, user) => {
        if (err) return res.status(500).json({ success: 'false', error: 'Lỗi server' });
        if (!user) return res.status(401).json({ success: 'false', error: 'Tài khoản hoặc mật khẩu không đúng' });

        const token = jwt.sign(
            {
                ma_tai_khoan: user.ma_tai_khoan,
                role_id: user.role_id
            },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'Lax',
            maxAge: 3600000,
            secure: false,
        });
        res.json({ success: 'true', data: { ho_va_ten: user.ho_va_ten} });
    });
};

exports.getCurrentUser = (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ success: 'false', error: 'Chưa đăng nhập' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        User.findById(decoded.ma_tai_khoan, (err, user) => {
            if (err || !user) {
                return res.status(404).json({ success: 'false', error: 'Không tìm thấy user' });
            }
            res.json({
    success: 'true',
    data: {
        ma_tai_khoan: user.ma_tai_khoan,
        ten_dang_nhap: user.ten_dang_nhap,
        ho_va_ten: user.ho_va_ten,
        sdt: user.sdt,
        role_id: user.role_id
    }
    });
        });
    } catch (err) {
        return res.status(401).json({ success: 'false', error: 'Token không hợp lệ' });
    }
};

exports.checkAdmin = (req, res) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ success: 'false', error: 'Chưa đăng nhập' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        User.findById(decoded.ma_tai_khoan, (err, user) => {
            if (err || !user) {
                return res.status(404).json({ success: 'false', error: 'Không tìm thấy user' });
            }
            if (user.role_id === 1 || user.role_id === 99) {
                return res.json({
                    success: 'true',
                    data: {
                        ma_tai_khoan: user.ma_tai_khoan,
                        ten_dang_nhap: user.ten_dang_nhap,
                        ho_va_ten: user.ho_va_ten,
                        sdt: user.sdt,
                        role_id: user.role_id
                    }
                });
            } else {
                return res.status(403).json({ success: 'false', error: 'Bạn không có quyền truy cập' });
            }
        });
    } catch (err) {
        return res.status(401).json({ success: 'false', error: 'Token không hợp lệ' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('jwt');
    res.json({ success: 'true', message: 'Đăng xuất thành công' });
};

exports.forgotPassword = (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Vui lòng cung cấp email!' });
    }

    // Tìm người dùng theo email (ten_dang_nhap)
    User.findByEmail(email, (err, user) => {
        if (err || !user) {
            return res.status(404).json({ error: 'Không tìm thấy người dùng với email này!' });
        }

        if (!user.mat_khau || user.mat_khau.trim() === '') {
            return res.status(400).json({ error: 'Tài khoản này sử dụng Google để đăng nhập. Không thể đặt lại mật khẩu tại đây.' });
        }

        // Tạo token JWT
        const token = jwt.sign(
            { ma_tai_khoan: user.ma_tai_khoan },
            JWT_SECRET,
            { expiresIn: '15m' }
        );

        // Link đặt lại mật khẩu
        const resetLink = `http://127.0.0.1:5500/frontend/pages/auth/reset-password.html?token=${token}`;

        // Tạo transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Email nội dung
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.ten_dang_nhap,
            subject: 'Yêu cầu đặt lại mật khẩu - CBDH Cinema',
            html: `
                <h3>Xin chào ${user.ho_va_ten},</h3>
                <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào nút bên dưới để tiếp tục:</p>
                <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">Đặt lại mật khẩu</a>
                <p>Liên kết này sẽ hết hạn sau 15 phút.</p>
            `
        };

        // Gửi mail
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Lỗi gửi email:', error);
                return res.status(500).json({ error: 'Không thể gửi email. Vui lòng thử lại sau.' });
            }

            res.json({
                success: 'true',
                message: 'Email đặt lại mật khẩu đã được gửi thành công!'
            });
        });
    });
};

exports.resetPassword = (req, res) => {
    const { token } = req.query;
    const { newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Thiếu token hoặc mật khẩu mới!' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Token không hợp lệ hoặc đã hết hạn!' });
        }

        const userId = decoded.ma_tai_khoan;

        User.updatePassword(userId, newPassword, (err) => {
            if (err) {
                return res.status(500).json({ error: 'Không thể cập nhật mật khẩu!' });
            }

            res.json({ success: 'true', message: 'Cập nhật mật khẩu thành công!' });
        });
    });
};

exports.register = (req, res) => {
    const { ten_dang_nhap, mat_khau, ho_va_ten, sdt, diachi } = req.body;

    if (!ten_dang_nhap || !mat_khau || !ho_va_ten) {
        return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra trùng tên đăng nhập
    User.findByEmail(ten_dang_nhap, (err, existingUser) => {
        if (err) return res.status(500).json({ success: false, error: 'Lỗi server' });
        if (existingUser) {
            return res.status(409).json({ success: false, error: 'Tên đăng nhập đã tồn tại' });
        }

        // Thêm user mới
        const newUser = {
            ten_dang_nhap,
            mat_khau,
            ho_va_ten,
            sdt,
            diachi,
            role_id: 2
        };

        User.create(newUser, (err, result) => {
            if (err) return res.status(500).json({ success: false, error: 'Không thể tạo tài khoản' });

            res.json({ success: true, message: 'Đăng ký thành công!' });
        });
    });
};

exports.updateProfile = (req, res) => {
    const { fullname, phone, email } = req.body;
    const token = req.cookies.jwt;

    if (!token) return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.ma_tai_khoan;

        User.updateProfile(userId, fullname, phone, email, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, error: 'Lỗi server khi cập nhật thông tin' });
            }

            if (result.emailTaken) {
                return res.status(409).json({ success: false, error: 'Email này đã được sử dụng cho tài khoản khác.' });
            }

            res.json({ success: true, message: 'Cập nhật thành công!' });
        });
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
    }
};

exports.changePassword = (req, res) => {
    const token = req.cookies.jwt;
    const { oldPassword, newPassword } = req.body;

    if (!token) return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });

    if (!oldPassword || !newPassword ) {
        return res.status(400).json({ success: false, error: 'Thiếu thông tin mật khẩu' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.ma_tai_khoan;

        // Lấy user để kiểm tra mật khẩu
        User.findById(userId, (err, user) => {
            if (err || !user) {
                return res.status(404).json({ success: false, error: 'Không tìm thấy người dùng' });
            }

            if (!user.mat_khau || user.mat_khau.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Tài khoản của bạn sử dụng Google để đăng nhập. Vui lòng đổi mật khẩu trên Google.'
                });
            }

            // So sánh mật khẩu cũ
            bcrypt.compare(oldPassword, user.mat_khau, (err, isMatch) => {
                if (err) return res.status(500).json({ success: false, error: 'Lỗi xác thực mật khẩu' });
                if (!isMatch) return res.status(401).json({ success: false, error: 'Mật khẩu cũ không đúng' });

                // Cập nhật mật khẩu mới
                User.updatePassword(userId, newPassword, (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, error: 'Không thể cập nhật mật khẩu' });
                    }

                    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
                });
            });
        });
    } catch (err) {
        return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
    }
};

exports.updateRole = (req, res) => {
    const { role_id } = req.body;
    const { id } = req.params;

    User.updateRole(id, role_id, (err, result) => {
        if (err) return res.status(500).json({ success: false, error: 'Lỗi khi cập nhật vai trò' });
        res.json({ success: true, message: 'Đã cập nhật vai trò' });
    });
};

exports.getAllUsers = (req, res) => {
  User.getAll((err, users) => {
    if (err) return res.status(500).json({ success: false, error: 'Không thể lấy danh sách người dùng' });
    res.json({ success: true, data: users });
  });
};


