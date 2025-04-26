const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
//Passport GG
const passport = require('passport');
require('./config/passport');

const session = require('express-session');
app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());
// Router
const router = require('./routes/index');

// Cấu hình CORS
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true
}));

// Lấy thông tin từ file .env
require('dotenv').config();

app.use(express.json()); // Bật tính năng đọc JSON
app.use(cookieParser()); // Bật tính năng đọc cookie
app.use('/api', router);

app.get('/', (req, res) => {
    res.send('Cinema API đang chạy');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server đang chạy tại http://127.0.0.1:${PORT}`);
});