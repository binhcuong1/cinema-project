const theater = require('../models/Theater');

exports.getTheaters = (req, res) => {
    theater.getAll((err, result) => {
        if (err)
            return res.status(500).json({error: err});
        res.status(200).json({success: 'true', data: result});
    });
};

exports.getTheaterByID = (req, res) => {
    let theaterID = req.params.id;

    theater.getByID(theaterID, (err, result) => {
        if (err)
            return res.status(500).json({error: err});
        if (!result)
            return res.status(404).json({error: 'Không tìm thấy rạp!'});
        res.json({success: 'true', data: result});
    });
}

exports.createTheater = (req, res) => {
    let theaterData = req.body;
    let isEmptyData = !theaterData.ten_rap || !theaterData.dia_chi || !theaterData.sdt;
    
    if (isEmptyData)
        return res.status(400).json({ error: 'Đã có thuộc tính bị trống!' });

    theater.create(theaterData, (err, result) => {
        if (err) return res.status(500).json({error: err});
        res.status(201).json({success: 'true'});
    });
}

exports.updateTheater = (req, res) => {
    let theaterID = req.params.id;
    let data = req.body;

    theater.update(theaterID, data, (err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Không tìm thấy rạp!' });

        res.status(200).json({success: 'true'});
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