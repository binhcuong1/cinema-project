const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const controller = require('../controllers/popcorn-drinkController');

// Cấu hình lưu file ảnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../frontend/assets/images/popcorn-drink/'));
  },
  filename: (req, file, cb) => {
    let originalName = file.originalname;
    let filePath = path.join(__dirname, '../../frontend/assets/images/popcorn-drink/', originalName);
    let counter = 1;
    let newFileName = originalName;

    while (fs.existsSync(filePath)) {
      const ext = path.extname(originalName);
      const nameWithoutExt = path.basename(originalName, ext);
      newFileName = `${nameWithoutExt}-${counter}${ext}`;
      filePath = path.join(__dirname, '../../frontend/assets/images/popcorn-drink/', newFileName);
      counter++;
    }

    cb(null, newFileName);
  }
});
const upload = multer({ storage });

// ROUTES
router.get('/', controller.getAll);
router.get('/loai', controller.getLoai);
router.get('/:id', controller.getById);
router.post('/', upload.single('image'), controller.create);
router.put('/:id', upload.single('image'), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;
