const db = require('../config/db');
const table_name = 'lich_chieu';

const schedule = {
    getByRoom: (roomID, date, callback) => {
        // Lấy lịch chiếu trong ngày được chọn
        const startOfDay = `${date} 00:00:00`;
        const endOfDay = `${date} 23:59:59`;

        const query = `
            SELECT lc.*, p.ten_phim 
            FROM ${table_name} lc
            JOIN phim p ON lc.ma_phim = p.ma_phim
            WHERE lc.ma_phong = ?
            AND lc.thoi_gian_bat_dau >= ? 
            AND lc.thoi_gian_bat_dau <= ?
            AND lc.da_xoa = 0
        `;

        db.query(query, [roomID, startOfDay, endOfDay], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },

    getAudios: (callback) => {
        db.query(`SELECT * FROM am_thanh`, (err, result) => {
            if (err)
                return callback(err,null);
            callback(null, result);
        });
    },

    createAudio: (data, callback) => {
        db.query(`INSERT INTO am_thanh (ten_am_thanh) VALUES(?)`, data.ten_am_thanh, (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    create: (scheduleData, callback) => {
        const query = `
            INSERT INTO ${table_name} (ma_phong, thoi_gian_bat_dau, thoi_gian_ket_thuc, ma_phim, ma_am_thanh, da_xoa)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        const values = [
            scheduleData.ma_phong,
            scheduleData.thoi_gian_bat_dau,
            scheduleData.thoi_gian_ket_thuc,
            scheduleData.ma_phim,
            scheduleData.ma_am_thanh,
            scheduleData.da_xoa
        ];

        db.query(query, values, (err, result) => {
            if (err) {
                return callback(err, null);
            }
            callback(null, result);
        });
    },

    delete: (scheduleID, callback) => {
        const query = `
        DELETE FROM lich_chieu 
        WHERE ma_lich_chieu = ?`;

        db.query(query, [scheduleID], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    }
};

module.exports = schedule;