const db = require('../config/db');

module.exports.getTimeRevenue = (range, callback) => {
    let query;
    if (range === 'day') {
        query = `
            SELECT DATE(thoi_gian_dat) AS ngay, SUM(tong_tien) AS tong_doanh_thu
            FROM dat_ve
            WHERE thoi_gian_dat IS NOT NULL
            GROUP BY DATE(thoi_gian_dat)
            ORDER BY ngay
        `;
    } else {
        query = `
            SELECT MONTH(thoi_gian_dat) AS thang, YEAR(thoi_gian_dat) AS nam, SUM(tong_tien) AS tong_doanh_thu
            FROM dat_ve
            WHERE thoi_gian_dat IS NOT NULL
            GROUP BY YEAR(thoi_gian_dat), MONTH(thoi_gian_dat)
            ORDER BY nam, thang
        `;
    }
    db.query(query, [], callback);
};

module.exports.getMovieRevenue = (callback) => {
    const query = `
        SELECT p.ten_phim, SUM(dv.tong_tien) AS tong_doanh_thu
        FROM dat_ve dv
        JOIN lich_chieu lc ON dv.ma_lich_chieu = lc.ma_lich_chieu
        JOIN phim p ON lc.ma_phim = p.ma_phim
        WHERE dv.thoi_gian_dat IS NOT NULL AND p.da_xoa = 0
        GROUP BY p.ten_phim
    `;
    db.query(query, [], callback);
};

module.exports.getTheaterRevenue = (callback) => {
    const query = `
        SELECT r.ten_rap, SUM(dv.tong_tien) AS tong_doanh_thu
        FROM dat_ve dv
        JOIN lich_chieu lc ON dv.ma_lich_chieu = lc.ma_lich_chieu
        JOIN phong_chieu pc ON lc.ma_phong = pc.ma_phong
        JOIN rap r ON pc.ma_rap = r.ma_rap
        WHERE dv.thoi_gian_dat IS NOT NULL AND r.da_xoa = 0
        GROUP BY r.ten_rap
    `;
    db.query(query, [], callback);
};