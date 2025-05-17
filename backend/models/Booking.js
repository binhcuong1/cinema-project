const db = require('../config/db');

module.exports.getByScheduleID = (scheduleID, callback) => {
    const query = `
        SELECT ma_ghe
        FROM trang_thai_ghe_suat_chieu
        WHERE ma_lich_chieu = ?
    `;
    db.query(query, [scheduleID], callback);
};


module.exports.checkSeats = (ma_lich_chieu, seatNames, callback) => {
    const query = `
        SELECT g.ma_ghe, g.ten_ghe, t.trang_thai
        FROM ghe g
        LEFT JOIN trang_thai_ghe_suat_chieu t
        ON g.ma_ghe = t.ma_ghe AND t.ma_lich_chieu = ?
        WHERE g.ten_ghe IN (?)
        AND g.da_xoa = 0
    `;
    db.query(query, [ma_lich_chieu, seatNames], callback);
};