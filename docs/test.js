const express = require('express');
const app = express();
const db = require('./db'); // Giả định module kết nối DB

app.use(express.json());

// API lấy cấu trúc ghế của phòng chiếu và trạng thái ghế
app.get('/api/rooms/:roomId/seats/:scheduleId', async (req, res) => {
    const { roomId, scheduleId } = req.params;

    try {
        // Lấy tất cả ghế của phòng chiếu
        const [seats] = await db.query(`
            SELECT 
                g.ma_ghe, g.hang_ghe, g.so_thu_tu, 
                CONCAT(g.hang_ghe, LPAD(g.so_thu_tu, 2, '0')) AS ten_ghe,
                lg.ten_loai AS loai_ghe, g.vi_tri_dac_thu, g.trang_thai
            FROM ghe g
            JOIN loai_ghe lg ON g.ma_loai_ghe = lg.ma_loai_ghe
            WHERE g.ma_phong = ? AND g.da_xoa = 0
            ORDER BY g.hang_ghe, g.so_thu_tu
        `, [roomId]);

        // Lấy ghế đã được đặt cho lịch chiếu
        const [bookedSeats] = await db.query(`
            SELECT g.ma_ghe
            FROM ct_dat_ghe cdg
            JOIN dat_ve dv ON cdg.ma_dat_ve = dv.ma_dat_ve
            JOIN ghe g ON cdg.ma_ghe = g.ma_ghe
            WHERE dv.ma_lich_chieu = ?
        `, [scheduleId]);

        const bookedSeatIds = bookedSeats.map(s => s.ma_ghe);

        // Kết hợp trạng thái ghế
        const seatLayout = {};
        seats.forEach(seat => {
            if (!seatLayout[seat.hang_ghe]) {
                seatLayout[seat.hang_ghe] = [];
            }
            seatLayout[seat.hang_ghe].push({
                ma_ghe: seat.ma_ghe,
                ten_ghe: seat.ten_ghe,
                loai_ghe: seat.loai_ghe,
                vi_tri_dac_thu: seat.vi_tri_dac_thu,
                trang_thai: bookedSeatIds.includes(seat.ma_ghe) ? 'booked' : seat.trang_thai
            });
        });

        res.status(200).json(seatLayout);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy cấu trúc ghế', error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));