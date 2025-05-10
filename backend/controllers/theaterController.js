const theater = require('../models/Theater');

exports.getTheaters = (req, res) => {
    theater.getAll((err, result) => {
        if (err)
            return res.status(500).json({error: err});
        res.status(200).json({success: true, data: result});
    });
};

exports.getTheaterByID = (req, res) => {
    let theaterID = req.params.id;

    theater.getByID(theaterID, (err, result) => {
        if (err)
            return res.status(500).json({error: err});
        if (!result)
            return res.status(404).json({error: 'Không tìm thấy rạp!'});
        res.json({success: true, data: result[0]});
    });
}

exports.createTheater = (req, res) => {
    let theaterData = req.body;
    let isEmptyData = !theaterData.ten_rap || !theaterData.dia_chi || !theaterData.sdt;
    
    if (isEmptyData)
        return res.status(400).json({ error: 'Đã có thuộc tính bị trống!' });

    const imagePath = req.file ? `/frontend/assets/images/theater/${req.file.filename}` : null;
    if (!imagePath)
        return res.status(400).json({error: 'Chưa upload ảnh!'});

    theaterData.image = imagePath;
    console.log('Dữ liệu gửi lên database:', theaterData);

    theater.create(theaterData, (err, result) => {
        if (err) return res.status(500).json({error: err});
        res.status(201).json({success: true, image: imagePath});
    });
}

exports.updateTheater = (req, res) => {
    let theaterID = req.params.id;
    let data = req.body;

    // Nếu có file ảnh mới, cập nhật đường dẫn ảnh
    if (req.file) {
        data.image = `/frontend/assets/images/theater/${req.file.filename}`;
    }

    // Kiểm tra dữ liệu
    if (!data.ten_rap || !data.dia_chi || !data.sdt) {
        return res.status(400).json({ error: "Thiếu các trường bắt buộc!" });
    }

    theater.update(theaterID, data, (err, result) => {
        if (err) {
            console.error("Lỗi khi cập nhật rạp:", err);
            return res.status(500).json({ error: err.message || "Lỗi server khi cập nhật rạp!" });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Không tìm thấy rạp!" });
        }
        res.status(200).json({ success: "true" });
    });
}

exports.deleteTheater = (req, res) => {
    let theaterID = req.params.id;

    theater.delete(theaterID, (err, result) => {
        if (err) 
            return res.status(500).json({ error: err });
        if (result.affectedRows === 0) 
            return res.status(404).json({ error: 'Không tìm thấy thông tin rạp!' });

        res.status(200).json({ success: true});
    });
}