const room = require('../models/Room');

exports.getRoomByID = (req, res) => {
    let roomID = req.params.id;

    room.getByID(roomID, (err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        if (!result)
            return res.status(404).json({ error: 'Không tìm thấy phòng chiếu!' });
        res.json({ success: 'true', data: result });
    });
}


exports.getAll = (req, res) => {
    const theaterID = req.params.id;

    room.getAll(theaterID, (err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        res.json({ success: 'true', data: result });
    });
};

exports.createRoom = (req, res) => {
    let roomData = req.body;

    // Kiểm tra dữ liệu đầu vào
    let isEmptyData = !roomData.ma_rap || !roomData.ten_phong || !roomData.so_luong_ghe || !roomData.seats_per_row;
    if (isEmptyData) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc khi kiểm tra tại controller!' });
    }

    console.log('Dữ liệu gửi lên database:', roomData); // Log để kiểm tra dữ liệu

    // Gọi model để tạo phòng chiếu và ghế
    room.create(roomData, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message || 'Không thể tạo phòng chiếu!' });
        }
        res.status(201).json({ success: 'true', data: result });
    });
};

exports.updateRoom = (req, res) => {
    let roomData = req.body;
    let roomID = req.params.id;

    // Kiểm tra dữ liệu đầu vào
    let isEmptyData = !roomData.ten_phong || !roomData.so_luong_ghe || !roomData.seats_per_row;
    if (isEmptyData) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc khi kiểm tra tại controller!' });
    }

    const result = { ma_phong: roomID, ...roomData};
    console.log('Dữ liệu gửi lên database:', result); // Log để kiểm tra dữ liệu

    // Gọi model để sửa phòng chiếu và ghế
    room.update(roomID, roomData, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message || 'Không thể sửa phòng chiếu!' });
        }
        res.status(200).json({ success: 'true', data: result });
    });
}