const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'bi_mat_token';

// Bắt đầu xác thực với Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Callback từ Google
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login-failed' }),
    (req, res) => {
        if (!req.user) {
            return res.redirect('/login-failed');
        }

        const token = jwt.sign({ ma_tai_khoan: req.user.ma_tai_khoan }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('jwt', token, {
            httpOnly: true,
            sameSite: 'Lax',
            secure: false,
            maxAge: 3600000
        });

        res.redirect('http://127.0.0.1:5500/frontend/pages/index.html'); // Quay lại frontend
    }
);

module.exports = router;
