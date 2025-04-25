const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

require('dotenv').config();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: 'http://127.0.0.1:3000/api/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
    const email = profile.emails[0].value;
    const ho_va_ten = profile.displayName;

    User.findByEmail(email, (err, existingUser) => {
        if (err) return done(err);

        if (existingUser) {
            return done(null, existingUser); // đã có user → login
        }

        // chưa có → tạo mới
        const newUser = {
            ten_dang_nhap: email,
            mat_khau: '', // Hoặc có thể đặt mật khẩu giả để tránh null
            ho_va_ten,
            sdt: '',
            diachi: '',
            role_id: 2
        };

        User.create(newUser, (err, result) => {
            if (err) return done(err);

            // Sau khi thêm thành công → lấy lại user (để lấy ID đầy đủ)
            User.findByEmail(email, (err, createdUser) => {
                if (err) return done(err);
                return done(null, createdUser);
            });
        });
    });
}));

passport.serializeUser((user, done) => {
    done(null, user);
});
passport.deserializeUser((obj, done) => {
    done(null, obj);
});
