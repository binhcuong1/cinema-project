const Banner = require('../models/Banner');
const path = require('path');
const fs = require('fs');

exports.getAllBanners = (req, res) => {
    Banner.getAll((err, banners) => {
        if (err) return res.status(500).json({ error: 'Lỗi server' });
        res.json(banners);
    });
};

exports.getBannerById = (req, res) => {
    const id = req.params.id;
    Banner.getById(id, (err, banner) => {
        if (err || !banner) return res.status(404).json({ error: 'Không tìm thấy banner' });
        res.json(banner);
    });
};

exports.createBanner = (req, res) => {
    const { ten, ngay_bat_dau, ngay_ket_thuc } = req.body;
    const image = req.file?.filename || '';
    const da_xoa = 0;

    if (!ten || !ngay_bat_dau || !ngay_ket_thuc || !image) {
        return res.status(400).json({ error: 'Thiếu thông tin banner' });
    }

    const newBanner = {
        ten,
        image: `/frontend/assets/images/banner/${req.file.filename}`,
        ngay_bat_dau,
        ngay_ket_thuc,
        da_xoa
    };

    Banner.create(newBanner, (err, result) => {
        if (err) return res.status(500).json({ error: 'Không thể tạo banner' });
        res.json({ success: true, message: 'Tạo banner thành công', id: result.insertId });
    });
};

exports.updateBanner = (req, res) => {
    const id = req.params.id;
    const { ten, ngay_bat_dau, ngay_ket_thuc } = req.body;
    const image = req.file?.filename;

    Banner.getById(id, (err, banner) => {
        if (err || !banner) return res.status(404).json({ error: 'Banner không tồn tại' });

        const updatedBanner = {
            ten,
            ngay_bat_dau,
            ngay_ket_thuc,
            image: image ? `/frontend/assets/images/banner/${image}` : banner.image
        };

        Banner.update(id, updatedBanner, (err) => {
            if (err) return res.status(500).json({ error: 'Không thể cập nhật banner' });
            res.json({ success: true, message: 'Cập nhật banner thành công' });
        });
    });
};

exports.deleteBanner = (req, res) => {
    const id = req.params.id;
    Banner.softDelete(id, (err) => {
        if (err) return res.status(500).json({ error: 'Không thể xoá banner' });
        res.json({ success: true, message: 'Xoá banner thành công' });
    });
};
