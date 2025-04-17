const express = require('express');
const cors = require('cors');
const app = express();

// Router
const router = require('./routes/index');

// Cấu hình CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'] 
}));

// Lấy thông tin từ file .env
require('dotenv').config();

app.use(express.json()); // Bật tính năng đọc JSON
app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Cinema API đang chạy');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại port ${PORT}`);
});