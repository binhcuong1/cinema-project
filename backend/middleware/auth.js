const jwt = require('jsonwebtoken');
const JWT_SECRET = 'bi_mat_token';

// Middleware kiểm tra token
const authenticateToken = (req, res, next) => {
    const token = req.cookies.jwt;
    if (!token) {
        return res.status(401).json({ success: 'false', error: 'Chưa đăng nhập, vui lòng đăng nhập để tiếp tục' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Lưu thông tin user vào req
        next();
    } catch (err) {
        return res.status(403).json({ success: 'false', error: 'Token không hợp lệ hoặc đã hết hạn' });
    }
};

// Middleware kiểm tra vai trò admin
const isAdmin = (req, res, next) => {
    if (req.user.role_id !== 1 || req.user.role_id !== 99) {
        return res.status(403).json({ success: 'false', error: 'Bạn không có quyền truy cập trang này' });
    }
    next();
};

module.exports = { authenticateToken, isAdmin };