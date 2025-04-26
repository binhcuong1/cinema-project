const db = require('../config/db'); // kết nối MySQL pool
const bcrypt = require('bcryptjs');

exports.login = (ten_dang_nhap, mat_khau, callback) => {
    const query = 'SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?';
    db.query(query, [ten_dang_nhap], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(null, null);

        const user = results[0];

        // So sánh mật khẩu đã hash
        bcrypt.compare(mat_khau, user.mat_khau, (err, isMatch) => {
            if (err) return callback(err);
            if (!isMatch) return callback(null, null);

            return callback(null, user);
        });
    });
};

exports.findById = (id, callback) => {
    const query = 'SELECT * FROM tai_khoan WHERE ma_tai_khoan = ?';
    db.query(query, [id], (err, results) => {
        if (err) return callback(err);
        if (results.length === 0) return callback(null, null);
        return callback(null, results[0]);
    });
};

exports.findByEmail = (email, callback) => {
    const sql = 'SELECT * FROM tai_khoan WHERE ten_dang_nhap = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return callback(err);
        callback(null, results[0]);
    });
};

exports.updatePassword = (userId, newPassword, callback) => {
    bcrypt.hash(newPassword, 10, (err, hashedPassword) => {
        if (err) return callback(err);

        const sql = 'UPDATE tai_khoan SET mat_khau = ? WHERE ma_tai_khoan = ?';
        db.query(sql, [hashedPassword, userId], (err, result) => {
            if (err) return callback(err);
            callback(null, result);
        });
    });
};

exports.create = (data, callback) => {
    bcrypt.hash(data.mat_khau, 10, (err, hashedPassword) => {
        if (err) return callback(err);

        const sql = `
            INSERT INTO tai_khoan (ten_dang_nhap, mat_khau, ho_va_ten, sdt, diachi, role_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.ten_dang_nhap,
            hashedPassword,
            data.ho_va_ten,
            data.sdt,
            data.diachi,
            data.role_id
        ];

        db.query(sql, values, callback);
    });
};