const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình multer để lưu file ảnh
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../frontend/assets/images/'));
    },
    filename: (req, file, cb) => {
        // Sử dụng tên gốc của file
        let originalName = file.originalname;
        
        // Kiểm tra file có tồn tại không, nếu có thì thêm hậu tố để tránh ghi đè
        let filePath = path.join(__dirname, '../../frontend/assets/images/', originalName);
        let counter = 1;
        let newFileName = originalName;

        while (fs.existsSync(filePath)) {
            const ext = path.extname(originalName); // path.extname -> lấy phần mở rộng của file
            const nameWithoutExt = path.basename(originalName, ext); // path.basename lấy phần tên file
            newFileName = `${nameWithoutExt}-${counter}${ext}`; // Thêm số thứ tự: download-1.png
            filePath = path.join(__dirname, '../../frontend/assets/images/', newFileName);
            counter++;
        }

        cb(null, newFileName);
    }
});
const upload = multer({ storage: storage });

router.get('/', movieController.getMovies);
router.get('/now-showing', movieController.getNowShowing);
router.get('/:id', movieController.getMovieByID);
router.get('/theater/:id', movieController.getMovieByTheater);
router.post('/', upload.single('poster'), movieController.createMovie);
router.put('/:id',upload.single('poster'), movieController.updateMovie);
router.delete('/:id', movieController.deleteMovie);

module.exports = router;