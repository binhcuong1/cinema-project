const jwt = require('jsonwebtoken');
const Order = require('../models/Order'); // file model sẽ tạo ở bước dưới
const JWT_SECRET = 'bi_mat_token';

exports.getUserOrderHistory = (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.ma_tai_khoan;

    Order.getByUserId(userId, (err, orders) => {
      if (err) return res.status(500).json({ success: false, error: 'Không thể lấy lịch sử đơn hàng' });
      res.json({ success: true, data: orders });
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
};

exports.getPopcornDrinkOrderDetail = (req, res) => {
  const orderId = req.params.id;

  Order.getPopcornOrderDetailById(orderId, (err, result) => {
    if (err) {
      console.error('Lỗi khi lấy chi tiết đơn combo:', err);
      return res.status(500).json({ success: false, error: 'Lỗi hệ thống' });
    }

    res.json({ success: true, data: result });
  });
};

exports.getTicketHistory = (req, res) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ success: false, error: 'Chưa đăng nhập' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.ma_tai_khoan;

    Order.getTicketHistory(userId, (err, results) => {
      if (err) {
        console.error('Lỗi lấy lịch sử vé:', err);
        return res.status(500).json({ success: false, error: 'Lỗi hệ thống.' });
      }

      res.json({ success: true, data: results });
    });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token không hợp lệ' });
  }
};

exports.getDetailTicket = (req, res) => {
  const maDatVe = req.params.id;

  Order.getThongTinVe(maDatVe, (err, thongTinChung) => {
    if (err) return res.status(500).json({ error: 'Lỗi truy vấn thông tin vé' });
    if (thongTinChung.length === 0) return res.status(404).json({ message: 'Không tìm thấy vé' });

    Order.getDanhSachGhe(maDatVe, (err, danhSachGhe) => {
      if (err) return res.status(500).json({ error: 'Lỗi truy vấn ghế' });

      Order.getLoaiVe(maDatVe, (err, loaiVe) => {
        if (err) return res.status(500).json({ error: 'Lỗi truy vấn loại vé' });

        Order.getComboByTicketId(maDatVe, (err, comboList) => {
          if (err) return res.status(500).json({ error: 'Lỗi truy vấn combo' });

          res.json({
            success: true,
            data: {
              thongTin: thongTinChung[0],
              ghe: danhSachGhe.map(row => row.ten_ghe),
              loai_ve: loaiVe,
              combo: comboList
            }
          });
        });
      });
    });
  });
};
