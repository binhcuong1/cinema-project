const db = require('../config/db');
const table_name = 'lich_chieu';

const schedule = {
    getById: (scheduleID, callback) => {
        const query = `
            SELECT * 
            FROM ${table_name} 
            JOIN am_thanh ON lich_chieu.ma_am_thanh = am_thanh.ma_am_thanh
            WHERE ma_lich_chieu = ?
        `;

        db.query(query, [scheduleID], (err, result) => {
            if (err) {
                return callback(err, null);
            }
            if (result.length === 0) {
                return callback(null, null);
            }
            callback(null, result);
        });
    },

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
                return callback(err, null);
            callback(null, result);
        });
    },

    getDatesByTheaterAndMovie: (movieId, theaterId, callback) => {
    const query = `
        SELECT DISTINCT DATE_FORMAT(lc.thoi_gian_bat_dau, '%Y-%m-%d') as date
        FROM lich_chieu lc
        JOIN phong_chieu pc ON lc.ma_phong = pc.ma_phong
        WHERE lc.ma_phim = ?
        AND pc.ma_rap = ?
        AND lc.da_xoa = 0
        AND lc.thoi_gian_bat_dau >= NOW()
        ORDER BY date ASC
    `;

    db.query(query, [movieId, theaterId], (err, result) => {
        if (err) {
            console.error("Lỗi truy vấn SQL:", err);
            return callback(err, null);
        }

        const dates = result.map(row => ({
            date: row.date // Chuỗi YYYY-MM-DD theo UTC+7
        }));
        callback(null, dates);
    });
},

    getShowtimesByMovieAndDate: (movieId, date, theaterId, callback) => {
        const query = `
        SELECT lc.ma_lich_chieu, TIME(lc.thoi_gian_bat_dau) as time
        FROM lich_chieu lc
        JOIN phong_chieu pc ON lc.ma_phong = pc.ma_phong
        WHERE lc.ma_phim = ?
        AND pc.ma_rap = ?
        AND lc.da_xoa = 0
        AND DATE(lc.thoi_gian_bat_dau) = ?
        AND lc.thoi_gian_bat_dau >= NOW()
        ORDER BY lc.thoi_gian_bat_dau ASC
    `;

        db.query(query, [movieId, theaterId, date], (err, result) => {
            if (err) {
                console.error("Lỗi truy vấn SQL:", err);
                return callback(err, null);
            }

            const showtimes = result.map(row => ({
                ma_lich_chieu: row.ma_lich_chieu,
                time: row.time // Chuỗi HH:mm:ss (ví dụ: "08:00:00")
            }));
            callback(null, showtimes);
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