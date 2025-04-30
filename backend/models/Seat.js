const db = require('../config/db');

const seat = {
    getSeatsByRoom: (ma_phong, callback) => {
        const query = `
            SELECT hang_ghe, ten_ghe
            FROM ghe
            WHERE ma_phong = ? AND da_xoa = 0
            ORDER BY hang_ghe, ten_ghe
        `;
        db.query(query, [ma_phong], (err, seats) => {
            if (err) {
                return callback(err, null);
            }

            // Nhóm ghế theo hàng và tính seats_per_row
            const groupedSeats = seats.reduce((acc, seat) => {
                const row = seat.hang_ghe;
                if (!acc[row]) acc[row] = [];
                acc[row].push(seat);
                return acc;
            }, {});

            const seatsPerRow = [];
            for (const row in groupedSeats) {
                seatsPerRow.push(groupedSeats[row].length);
            }

            callback(null, seatsPerRow);
        });
    }
};

module.exports = seat;