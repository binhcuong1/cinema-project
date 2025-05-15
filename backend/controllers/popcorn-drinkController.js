const BapNuoc = require('../models/Popcorn-Drink');

exports.getAll = (req, res) => {
  BapNuoc.getAll((err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: result });
  });
};

exports.getLoai = (req, res) => {
  BapNuoc.getAllLoai((err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, data: result });
  });
};

exports.getById = (req, res) => {
  const id = req.params.id;
  BapNuoc.getById(id, (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    if (!result || result.length === 0)
      return res.status(404).json({ success: false, error: 'Không tìm thấy combo' });
    res.json({ success: true, data: result[0] });
  });
};

exports.create = (req, res) => {
  const data = req.body;

  if (!data.ten_bap_nuoc || !data.ma_loai || !data.don_gia) {
    return res.status(400).json({ success: false, error: 'Thiếu thông tin bắt buộc.' });
  }
  
  if (req.file) {
    data.image = `/frontend/assets/images/popcorn-drink/${req.file.filename}`;
  }

  BapNuoc.create(data, (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.status(201).json({ success: true });
  });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const data = req.body;

  if (req.file) {
    data.image = `/frontend/assets/images/popcorn-drink/${req.file.filename}`;
  }

  BapNuoc.update(id, data, (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
};

exports.remove = (req, res) => {
  const id = req.params.id;
  BapNuoc.delete(id, (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true });
  });
};
