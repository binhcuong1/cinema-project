const db = require('../config/db');

module.exports.getByScheduleID = (scheduleID, callback) => {
    const query = `
        SELECT ma_ghe
        FROM trang_thai_ghe_suat_chieu
        WHERE ma_lich_chieu = ?
    `;
    db.query(query, [scheduleID], callback);
};