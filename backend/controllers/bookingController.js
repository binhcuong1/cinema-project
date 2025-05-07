const booking = require('../models/Booking');
const db = require('../config/db');

exports.getByScheduleID = (req, res) => {
    let scheduleID = req.params.id;

    // Lấy danh sách ghế đã đặt từ bảng trang_thai_ghe_suat_chieu
    booking.getByScheduleID(scheduleID, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Lỗi server: ' + err });
        }
        if (!result || result.length === 0) {
            return res.status(200).json({ success: true, data: { booked_seats: [] } });
        }

        // Lấy danh sách ma_ghe từ kết quả
        const maGheList = result.map(row => row.ma_ghe);

        // Truy vấn bảng ghe để lấy ten_ghe tương ứng
        const query = `
            SELECT ten_ghe
            FROM ghe
            WHERE ma_ghe IN (?)
        `;

        db.query(query, [maGheList], (err, gheResult) => {
            if (err) {
                return res.status(500).json({ error: 'Lỗi truy vấn ghế: ' + err });
            }
            const bookedSeats = gheResult.map(row => row.ten_ghe);
            res.json({ success: true, data: { booked_seats: bookedSeats } });
        });
    });
};