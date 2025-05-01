const db = require('../config/db');
const table_name = 'phong_chieu';

const room = {
    getByID: (id, callback) => {
        // 1. Lấy thông tin phòng chiếu
        const roomQuery = `SELECT * FROM ${table_name} WHERE ma_phong = ?`;
        db.query(roomQuery, [id], (err, roomResult) => {
            if (err) {
                return callback(err, null);
            }
            if (roomResult.length === 0) {
                return callback(null, null);
            }
    
            const room = roomResult[0];
    
            // 2. Lấy danh sách ghế và tính seats_per_row + row_count
            const seatsQuery = `
                SELECT hang_ghe, ten_ghe
                FROM ghe
                WHERE ma_phong = ? AND da_xoa = 0
                ORDER BY hang_ghe, ten_ghe
            `;
            db.query(seatsQuery, [id], (seatErr, seats) => {
                if (seatErr) {
                    return callback(seatErr, null);
                }
    
                // 3. Tính seats_per_row và row_count
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
                const rowCount = Object.keys(groupedSeats).length; // Số lượng hàng
    
                // 4. Kết hợp dữ liệu
                const result = { ...room, seats_per_row: seatsPerRow, so_luong_hang: rowCount };
                callback(null, result);
            });
        });
    },

    getAll: (theaterID, callback) => {
        db.query(`SELECT * FROM ${table_name} WHERE ma_rap = ?`,[theaterID], (err, result) => {
            if (err)
                return callback(err,null);
            callback(null, result);
        });
    },

    create: (data, callback) => {
        // 1. Thêm phòng chiếu vào bảng phong_chieu
        const insertRoomQuery = `
            INSERT INTO ${table_name} (ma_rap, ten_phong, so_luong_ghe)
            VALUES (?, ?, ?)
        `;
        const params = [data.ma_rap, data.ten_phong, data.so_luong_ghe];

        db.query(insertRoomQuery, params, (err, result) => {
            if (err) {
                return callback(err, null);
            }

            const ma_phong = result.insertId; // Lấy ID của phòng chiếu vừa tạo

            // 2. Tạo ghế trong bảng ghe dựa trên seats_per_row
            const seats_per_row = data.seats_per_row; // Mảng: [10, 12, 8]
            let seatInsertions = 0;
            const totalSeatsToInsert = seats_per_row.reduce((sum, count) => sum + count, 0);

            if (totalSeatsToInsert === 0) {
                const newRoom = { ma_phong, ...data };
                return callback(null, newRoom);
            }

            for (let i = 0; i < seats_per_row.length; i++) {
                const rowLabel = String.fromCharCode(65 + i); // A, B, C...
                const seatCount = seats_per_row[i]; // Số ghế trong hàng

                for (let j = 1; j <= seatCount; j++) {
                    const ten_ghe = `${rowLabel}${j}`; // Ví dụ: A1, A2, ...
                    const params = [ma_phong, rowLabel, ten_ghe];
                    const insertSeatQuery = `
                        INSERT INTO ghe (ma_phong, hang_ghe, ten_ghe)
                        VALUES (?, ?, ?)
                    `;

                    db.query(insertSeatQuery, params, (seatErr) => {
                        if (seatErr) {
                            return callback(seatErr, null);
                        }
                        seatInsertions++;
                        // Khi tất cả ghế đã được chèn, trả về kết quả
                        if (seatInsertions === totalSeatsToInsert) {
                            const newRoom = { ma_phong, ...data };
                            callback(null, newRoom);
                        }
                    });
                }
            }
        });
    },

    update: (roomID, data, callback) => {
        // 1. Sửa thông tin phòng chiếu trong bảng phong_chieu
        const updateRoomQuery = `
            UPDATE ${table_name}
            SET ten_phong = ?, so_luong_ghe = ?
            WHERE ma_phong = ?
        `;
        const roomParams = [data.ten_phong, data.so_luong_ghe, roomID];
    
        db.query(updateRoomQuery, roomParams, (err, result) => {
            if (err) {
                return callback(err, null);
            }
    
            if (result.affectedRows === 0) {
                return callback(new Error('Phòng chiếu không tồn tại!'), null);
            }
    
            // 2. Xóa toàn bộ ghế cũ của phòng chiếu trong bảng ghe
            const deleteSeatsQuery = `
                DELETE FROM ghe
                WHERE ma_phong = ?
            `;
            db.query(deleteSeatsQuery, [roomID], (deleteErr) => {
                if (deleteErr) {
                    return callback(deleteErr, null);
                }
    
                // 3. Tạo ghế mới dựa trên seats_per_row
                const seats_per_row = data.seats_per_row; // Mảng: [10, 12, 8]
                let seatInsertions = 0;
                const totalSeatsToInsert = data.so_luong_ghe; // Sử dụng so_luong_ghe từ data
    
                if (totalSeatsToInsert === 0) {
                    const updatedRoom = { ma_phong: roomID, ...data };
                    return callback(null, updatedRoom);
                }
    
                for (let i = 0; i < seats_per_row.length; i++) {
                    const rowLabel = String.fromCharCode(65 + i); // A, B, C...
                    const seatCount = seats_per_row[i]; // Số ghế trong hàng
    
                    for (let j = 1; j <= seatCount; j++) {
                        const ten_ghe = `${rowLabel}${j}`; // Ví dụ: A1, A2, ...
                        const seatParams = [roomID, rowLabel, ten_ghe, 0];
                        const insertSeatQuery = `
                            INSERT INTO ghe (ma_phong, hang_ghe, ten_ghe, da_xoa)
                            VALUES (?, ?, ?, ?)
                        `;
    
                        db.query(insertSeatQuery, seatParams, (seatErr) => {
                            if (seatErr) {
                                return callback(seatErr, null);
                            }
                            seatInsertions++;
                            if (seatInsertions === totalSeatsToInsert) {
                                const updatedRoom = { ma_phong: roomID, ...data };
                                callback(null, updatedRoom);
                            }
                        });
                    }
                }
            });
        });
    }
};

module.exports = room;