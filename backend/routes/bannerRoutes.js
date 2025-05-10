const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu ảnh banner
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../frontend/assets/images/banner/'));
    },
    filename: (req, file, cb) => {
        let originalName = file.originalname;
        let filePath = path.join(__dirname, '../../frontend/assets/images/banner/', originalName);
        let counter = 1;
        let newFileName = originalName;

        while (fs.existsSync(filePath)) {
            const ext = path.extname(originalName);
            const nameWithoutExt = path.basename(originalName, ext);
            newFileName = `${nameWithoutExt}-${counter}${ext}`;
            filePath = path.join(__dirname, '../../frontend/assets/images/banner/', newFileName);
            counter++;
        }

        cb(null, newFileName);
    }
});
const upload = multer({ storage });

// Routes
router.get('/', bannerController.getAllBanners);
router.get('/:id', bannerController.getBannerById);
router.post('/', upload.single('image'), bannerController.createBanner);
router.put('/:id', upload.single('image'), bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
