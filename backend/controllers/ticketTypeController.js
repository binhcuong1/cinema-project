const ticketType = require('../models/TicketType');

exports.createTicketType = (req, res) => {
    let ticketData = req.body;
    let isEmptyData = !ticketData.ten_loai || !ticketData.don_gia;

    if (isEmptyData)
        return res.status(400).json({ error: 'Đã có thuộc tính bị trống!' });

    ticketType.create(ticketData, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ success: true, data: result });
    });
}

exports.getTicketTypeById = (req, res) => {
    let id = req.params.id;

    ticketType.getByID(id, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        if (!result) return res.status(404).json({ error: 'Không tìm thấy loại vé!' });
        res.status(200).json({ success: true, data: result });
    });
}

exports.getAllTicketTypes = (req, res) => { 
    ticketType.getAll((err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json({ success: true, data: result });
    });
}

exports.updateTicketType = (req, res) => {
    let ticketData = req.body;
    let id = req.params.id;
    let isEmptyData = !ticketData.ten_loai || !ticketData.don_gia;

    if (isEmptyData)
        return res.status(400).json({ error: 'Đã có thuộc tính bị trống!' });

    ticketType.update(id, ticketData, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json({ success: true, data: result });
    });
}

exports.deleteTicketType = (req, res) => {
    let id = req.params.id;

    ticketType.delete(id, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json({ success: true, data: result });
    });
}