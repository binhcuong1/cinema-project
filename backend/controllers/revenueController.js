const revenueModel = require('../models/Revenue');

exports.getTimeRevenue = (req, res) => {
    const { range } = req.query;

    if (!range || !['day', 'month'].includes(range)) {
        return res.status(400).json({ success: false, message: 'Tham số range không hợp lệ. Sử dụng "day" hoặc "month".' });
    }

    revenueModel.getTimeRevenue(range, (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
        }
        if (!result || result.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }
        res.status(200).json({ success: true, data: result });
    });
};

exports.getMovieRevenue = (req, res) => {
    revenueModel.getMovieRevenue((err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
        }
        if (!result || result.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }
        res.status(200).json({ success: true, data: result });
    });
};

exports.getTheaterRevenue = (req, res) => {
    revenueModel.getTheaterRevenue((err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
        }
        if (!result || result.length === 0) {
            return res.status(200).json({ success: true, data: [] });
        }
        res.status(200).json({ success: true, data: result });
    });
};