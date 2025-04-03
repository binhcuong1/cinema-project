const express = require('express');
const app = express();

// Router
const router = require('./routes/index');

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