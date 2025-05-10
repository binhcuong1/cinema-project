const db = require('../config/db');

const Banner = {
    getAll: (callback) => {
        const sql = 'SELECT * FROM banner WHERE da_xoa != 1 OR da_xoa IS NULL ORDER BY ngay_bat_dau DESC';
        db.query(sql, callback);
    },

    getById: (id, callback) => {
        const sql = 'SELECT * FROM banner WHERE id = ?';
        db.query(sql, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0]);
        });
    },

    create: (data, callback) => {
        const sql = 'INSERT INTO banner (ten, image, ngay_bat_dau, ngay_ket_thuc) VALUES (?, ?, ?, ?)';
        db.query(sql, [data.ten, data.image, data.ngay_bat_dau, data.ngay_ket_thuc], callback);
    },

    update: (id, data, callback) => {
        const sql = 'UPDATE banner SET ten = ?, image = ?, ngay_bat_dau = ?, ngay_ket_thuc = ? WHERE id = ?';
        db.query(sql, [data.ten, data.image, data.ngay_bat_dau, data.ngay_ket_thuc, id], callback);
    },

    softDelete: (id, callback) => {
        const sql = 'UPDATE banner SET da_xoa = 1 WHERE id = ?';
        db.query(sql, [id], callback);
    }
};

module.exports = Banner;
