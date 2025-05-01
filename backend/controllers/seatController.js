const seat = require('../models/Seat');

exports.getSeatsByRoom = (req, res) => {
    const ma_phong = req.params.id;

    seat.getSeatsByRoom(ma_phong, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message || 'Không thể lấy danh sách ghế!' });
        }
        res.json({ success: 'true', seats_per_row: result });
    });
};