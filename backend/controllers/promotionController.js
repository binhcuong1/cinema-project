// controllers/promotionController.js
const promotion = require('../models/Promotion');

exports.getPromotions = (req, res) => {
    promotion.getAll((err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ success: 'true', data: result });
    });
};

exports.getPromotionByID = (req, res) => {
    promotion.getByID(req.params.id, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (!result) return res.status(404).json({ error: 'Không tìm thấy khuyến mãi!' });
        res.json({ success: 'true', data: result });
    });
};

exports.createPromotion = (req, res) => {
    const data = req.body;

    const requiredFields = ['ten_khuyen_mai', 'mo_ta', 'gio_bat_dau', 'gio_ket_thuc', 'ngay_trong_tuan'];
    const isMissing = requiredFields.some(field => !data[field]);

    if (isMissing) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc!' });
    }

    if (req.file) {
        data.image = `/frontend/assets/images/${req.file.filename}`;
    } else {
        return res.status(400).json({ error: 'Chưa upload ảnh khuyến mãi!' });
    }

    // Tính trạng thái tự động
    const now = new Date();
    const [startHour, startMinute] = data.gio_bat_dau.split(':');
    const [endHour, endMinute] = data.gio_ket_thuc.split(':');

    const startTime = new Date(now);
    startTime.setHours(startHour, startMinute, 0, 0);

    const endTime = new Date(now);
    endTime.setHours(endHour, endMinute, 0, 0);

    if (now < startTime) {
        data.trang_thai = 'chua_kich_hoat';
    } else if (now > endTime) {
        data.trang_thai = 'het_han';
    } else {
        data.trang_thai = 'dang_hoat_dong';
    }

    data.da_xoa = 0;

    promotion.create(data, (err, result) => {
        if (err) return res.status(500).json({ error: err });

        res.status(201).json({
            success: 'true',
            message: 'Thêm khuyến mãi thành công!',
            image: data.image
        });
    });
};

exports.updatePromotion = (req, res) => {
    const id = req.params.id;
    const data = req.body;

    if (req.file) {
        data.image = `/frontend/assets/images/${req.file.filename}`;
    }

    promotion.update(id, data, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Không tìm thấy khuyến mãi!' });

        res.status(200).json({ success: 'true' });
    });
};

exports.deletePromotion = (req, res) => {
    const id = req.params.id;

    promotion.delete(id, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Không tìm thấy khuyến mãi!' });

        res.status(200).json({ success: true });
    });
};
