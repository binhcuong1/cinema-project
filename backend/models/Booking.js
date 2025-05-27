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

// Hàm đếm tổng số vé (dùng để tính totalPages)
module.exports.countBookings = (search, startDate, endDate, callback) => {
    let query = `
        SELECT COUNT(*) as total
        FROM dat_ve dv
        JOIN tai_khoan tk ON dv.ma_tai_khoan = tk.ma_tai_khoan
        JOIN lich_chieu lc ON dv.ma_lich_chieu = lc.ma_lich_chieu
        JOIN phim p ON lc.ma_phim = p.ma_phim
        JOIN phong_chieu pc ON lc.ma_phong = pc.ma_phong
        JOIN rap r ON pc.ma_rap = r.ma_rap
        WHERE 1=1
    `;

    const params = [];
    if (search) {
        query += ` AND (dv.ma_dat_ve LIKE ? OR tk.ho_va_ten LIKE ? OR tk.ten_dang_nhap LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }
    if (startDate) {
        query += ` AND dv.thoi_gian_dat >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        query += ` AND dv.thoi_gian_dat <= ?`;
        params.push(endDate);
    }

    db.query(query, params, callback);
};

// Hàm lấy danh sách vé với phân trang, tìm kiếm và lọc
module.exports.getBookings = (page, pageSize, search, startDate, endDate, callback) => {
    const offset = (page - 1) * pageSize;

    let query = `
        SELECT dv.ma_dat_ve, tk.ho_va_ten AS ten_khach_hang, tk.ten_dang_nhap AS email, 
               p.ten_phim, r.ten_rap, lc.thoi_gian_bat_dau, lc.thoi_gian_ket_thuc, 
               dv.so_luong_ghe, dv.tong_tien, dv.da_xoa
        FROM dat_ve dv
        JOIN tai_khoan tk ON dv.ma_tai_khoan = tk.ma_tai_khoan
        JOIN lich_chieu lc ON dv.ma_lich_chieu = lc.ma_lich_chieu
        JOIN phim p ON lc.ma_phim = p.ma_phim
        JOIN phong_chieu pc ON lc.ma_phong = pc.ma_phong
        JOIN rap r ON pc.ma_rap = r.ma_rap
        WHERE dv.da_xoa IN (0, 1) -- Bao gồm cả vé đã xóa và chưa xóa
    `;

    const params = [];
    if (search) {
        query += ` AND (dv.ma_dat_ve LIKE ? OR tk.ho_va_ten LIKE ? OR tk.ten_dang_nhap LIKE ?)`;
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
    }
    if (startDate) {
        query += ` AND dv.thoi_gian_dat >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        query += ` AND dv.thoi_gian_dat <= ?`;
        params.push(endDate);
    }

    query += ` ORDER BY dv.thoi_gian_dat DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    db.query(query, params, callback);
};