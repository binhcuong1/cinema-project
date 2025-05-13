const db = require('../config/db');

exports.getByUserId = (userId, callback) => {
  const sql = `
    SELECT 
    d.ma_don_dat,
    d.thoi_gian_dat AS ngay,
    'Mua bắp nước' AS hoat_dong,
    r.ten_rap AS chi_nhanh,
    d.tong_tien
    FROM don_dat_bap_nuoc_rieng d
    JOIN rap r ON d.ma_rap = r.ma_rap
    WHERE d.ma_tai_khoan = ?
    AND d.da_xoa = 0
    ORDER BY d.thoi_gian_dat DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

exports.getPopcornOrderDetailById = (maDonDat, callback) => {
  const sql = `
    SELECT 
      ct.*, 
      sp.ten_bap_nuoc, 
      sp.don_gia,
      d.tong_tien,
      r.ten_rap
    FROM ct_don_dat_bap_nuoc ct
    JOIN don_dat_bap_nuoc_rieng d ON ct.ma_don_dat = d.ma_don_dat
    JOIN bap_nuoc sp ON ct.ma_bap_nuoc = sp.ma_bap_nuoc
    JOIN rap r ON d.ma_rap = r.ma_rap
    WHERE ct.ma_don_dat = ?
  `;

  db.query(sql, [maDonDat], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
};

// Lịch sử mua vé theo tài khoản
exports.getTicketHistory = (userId, callback) => {
  const sql = `
    SELECT 
      dv.ma_dat_ve,
      dv.thoi_gian_dat AS ngay,
      'Mua vé' AS hoat_dong,
      r.ten_rap AS chi_nhanh,
      dv.tong_tien
    FROM dat_ve dv
    JOIN lich_chieu lc ON dv.ma_lich_chieu = lc.ma_lich_chieu
    JOIN phong_chieu pc ON lc.ma_phong = pc.ma_phong
    JOIN rap r ON pc.ma_rap = r.ma_rap
    WHERE dv.ma_tai_khoan = ?
    ORDER BY dv.thoi_gian_dat DESC
  `;

  db.query(sql, [userId], callback);
};

// Chi tiết đơn vé - thông tin chung
exports.getThongTinVe = (maDatVe, callback) => {
  const sql = `
    SELECT dv.ma_dat_ve, dv.thoi_gian_dat, dv.tong_tien,
           p.ten_phim, r.ten_rap, pc.ten_phong, p.thoi_luong_phut
    FROM dat_ve dv
    JOIN lich_chieu lc ON dv.ma_lich_chieu = lc.ma_lich_chieu
    JOIN phim p ON lc.ma_phim = p.ma_phim
    JOIN phong_chieu pc ON lc.ma_phong = pc.ma_phong
    JOIN rap r ON pc.ma_rap = r.ma_rap
    WHERE dv.ma_dat_ve = ?
  `;

  db.query(sql, [maDatVe], callback);
};

// Danh sách ghế theo mã đặt vé
exports.getDanhSachGhe = (maDatVe, callback) => {
  const sql = `
    SELECT g.ten_ghe
    FROM trang_thai_ghe_suat_chieu tt
    JOIN ghe g ON tt.ma_ghe = g.ma_ghe
    WHERE tt.ma_dat_ve = ?
  `;

  db.query(sql, [maDatVe], callback);
};

// Danh sách loại vé theo mã đặt vé
exports.getLoaiVe = (maDatVe, callback) => {
  const sql = `
    SELECT lv.ten_loai, lv.don_gia, ct.so_luong
    FROM ct_loai_ve ct
    JOIN loai_ve lv ON ct.ma_loai = lv.ma_loai
    WHERE ct.ma_dat_ve = ?
  `;

  db.query(sql, [maDatVe], callback);
};
// Bắp nước trong vévé
exports.getComboByTicketId = (maDatVe, callback) => {
  const sql = `
    SELECT 
      bn.ten_bap_nuoc, 
      bn.don_gia, 
      ct.so_luong
    FROM ct_bap_nuoc ct
    JOIN bap_nuoc bn ON ct.ma_bap_nuoc = bn.ma_bap_nuoc
    WHERE ct.ma_dat_ve = ?
  `;
  db.query(sql, [maDatVe], callback);
};
