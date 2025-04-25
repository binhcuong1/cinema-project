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
    if (!data.ten_khuyen_mai || !data.trang_thai) {
        return res.status(400).json({ error: 'Thiếu tên khuyến mãi hoặc trạng thái' });
    }

    promotion.create(data, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ success: 'true', id: result.insertId });
    });
};

exports.updatePromotion = (req, res) => {
    const id = req.params.id;
    const data = req.body;

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
