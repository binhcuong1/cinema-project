const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaterController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu file ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../frontend/assets/images/theater/'));
    },
    filename: (req, file, cb) => {
        // Sử dụng tên gốc của file
        let originalName = file.originalname;
        
        // Kiểm tra file có tồn tại không, nếu có thì thêm hậu tố để tránh ghi đè
        let filePath = path.join(__dirname, '../../frontend/assets/images/theater/', originalName);
        let counter = 1;
        let newFileName = originalName;

        while (fs.existsSync(filePath)) {
            const ext = path.extname(originalName); // path.extname -> lấy phần mở rộng của file
            const nameWithoutExt = path.basename(originalName, ext); // path.basename lấy phần tên file
            newFileName = `${nameWithoutExt}-${counter}${ext}`; // Thêm số thứ tự: download-1.png
            filePath = path.join(__dirname, '../../frontend/assets/images/theater/', newFileName);
            counter++;
        }

        cb(null, newFileName);
    }
});
const upload = multer({ storage: storage });

router.get('/', theaterController.getTheaters);
router.get('/:id', theaterController.getTheaterByID);
router.post('/',upload.single('image'), theaterController.createTheater);
router.put('/:id',upload.single('image'), theaterController.updateTheater);
router.delete('/:id', theaterController.deleteTheater);

module.exports = router;