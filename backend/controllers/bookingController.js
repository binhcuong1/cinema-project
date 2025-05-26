const db = require('../config/db');
const nodemailer = require('nodemailer');

// Cấu hình transporter cho Gmail SMTP
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'cbhdcinema@gmail.com',
        pass: 'yxjhcmpewgdvacvh',
    },
});

exports.getByScheduleID = (req, res) => {
    let scheduleID = req.params.id;

    // Lấy danh sách ghế đã đặt từ bảng trang_thai_ghe_suat_chieu
    db.query(
        'SELECT ma_ghe FROM trang_thai_ghe_suat_chieu WHERE ma_lich_chieu = ? AND trang_thai = "da-dat"',
        [scheduleID],
        (err, result) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Lỗi server: ' + err.message });
            }
            if (!result || result.length === 0) {
                return res.status(200).json({ success: true, data: { booked_seats: [] } });
            }

            const maGheList = result.map(row => row.ma_ghe);
            db.query(
                'SELECT ten_ghe FROM ghe WHERE ma_ghe IN (?) AND da_xoa = 0',
                [maGheList],
                (err, gheResult) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Lỗi truy vấn ghế: ' + err.message });
                    }
                    const bookedSeats = gheResult.map(row => row.ten_ghe);
                    res.json({ success: true, data: { booked_seats: bookedSeats } });
                }
            );
        }
    );
};

exports.createBooking = (req, res) => {
    const {
        ma_lich_chieu,
        ma_hinh_thuc,
        ma_tai_khoan,
        ten_dang_nhap,
        thoi_gian_dat,
        so_luong_ghe,
        tong_tien,
        trang_thai,
        trang_thai_ghe_suat_chieu,
        ct_loai_ve,
        ct_bap_nuoc
    } = req.body;

    if (!ma_lich_chieu || !ma_tai_khoan || !thoi_gian_dat || !so_luong_ghe || !tong_tien || !trang_thai_ghe_suat_chieu) {
        return res.status(400).json({ success: false, message: 'Dữ liệu bắt buộc bị thiếu.' });
    };

    const getSeatsQuery = `
        SELECT g.ma_ghe, g.ten_ghe
        FROM ghe g
        JOIN lich_chieu lc ON lc.ma_lich_chieu = ?
        WHERE g.ten_ghe IN (?)
        AND g.ma_phong = lc.ma_phong
        AND g.da_xoa = 0
    `;

    db.query(getSeatsQuery, [ma_lich_chieu, trang_thai_ghe_suat_chieu], (err, seatResults) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi lấy thông tin ghế: ' + err.message });
        }

        if (seatResults.length !== trang_thai_ghe_suat_chieu.length) {
            const foundSeats = seatResults.map(seat => seat.ten_ghe);
            const missingSeats = trang_thai_ghe_suat_chieu.filter(seat => !foundSeats.includes(seat));
            return res.status(400).json({ success: false, message: `Ghế ${missingSeats.join(', ')} không tồn tại.` });
        }

        const seatMap = seatResults.reduce((map, seat) => {
            map[seat.ten_ghe] = seat.ma_ghe;
            return map;
        }, {});

        const insertBookingQuery = `
            INSERT INTO dat_ve (ma_lich_chieu, ma_hinh_thuc, ma_tai_khoan, ten_dang_nhap, thoi_gian_dat, so_luong_ghe, tong_tien)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const bookingValues = [
            ma_lich_chieu,
            ma_hinh_thuc || null,
            ma_tai_khoan,
            ten_dang_nhap,
            thoi_gian_dat,
            so_luong_ghe,
            tong_tien
        ];

        db.query(insertBookingQuery, bookingValues, (err, bookingResult) => {
            if (err) {
                console.error('Chi tiết lỗi MySQL:', err);
                return res.status(500).json({ success: false, message: 'Lỗi khi tạo đơn đặt vé: ' + err.message });
            }

            const ma_dat_ve = bookingResult.insertId;

            if (ct_loai_ve) {
                const ticketDetails = Object.entries(ct_loai_ve)
                    .filter(([_, so_luong]) => so_luong > 0)
                    .map(([ma_loai, so_luong]) => [ma_dat_ve, ma_loai, so_luong]);

                if (ticketDetails.length > 0) {
                    db.query(
                        'INSERT INTO ct_loai_ve (ma_dat_ve, ma_loai, so_luong) VALUES ?',
                        [ticketDetails],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ success: false, message: 'Lỗi khi thêm chi tiết loại vé: ' + err.message });
                            }
                        }
                    );
                }
            }

            if (ct_bap_nuoc) {
                const snackDetails = Object.entries(ct_bap_nuoc)
                    .filter(([_, so_luong]) => so_luong > 0)
                    .map(([ma_bap_nuoc, so_luong]) => [ma_bap_nuoc, ma_dat_ve, so_luong]);

                if (snackDetails.length > 0) {
                    db.query(
                        'INSERT INTO ct_bap_nuoc (ma_bap_nuoc, ma_dat_ve, so_luong) VALUES ?',
                        [snackDetails],
                        (err) => {
                            if (err) {
                                return res.status(500).json({ success: false, message: 'Lỗi khi thêm chi tiết bắp nước: ' + err.message });
                            }
                        }
                    );
                }
            }

            const seatUpdates = trang_thai_ghe_suat_chieu.map(seat => [
                ma_lich_chieu,
                seatMap[seat],
                'da-dat',
                ma_dat_ve
            ]);
            db.query(
                'INSERT INTO trang_thai_ghe_suat_chieu (ma_lich_chieu, ma_ghe, trang_thai, ma_dat_ve) VALUES ? ON DUPLICATE KEY UPDATE trang_thai = "da-dat", ma_dat_ve = ?',
                [seatUpdates, ma_dat_ve],
                (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Lỗi khi cập nhật trạng thái ghế: ' + err.message });
                    }
                    return res.status(201).json({
                        success: true,
                        message: 'Đặt vé thành công.',
                        data: { ma_dat_ve }
                    });
                }
            );
        });
    });
};

exports.createPopcornOrder = (req, res) => {
    const { ma_tai_khoan, ten_dang_nhap, thoi_gian_dat, items } = req.body;

    if (!ma_tai_khoan || !ten_dang_nhap || !thoi_gian_dat || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin đơn đặt bắp nước.' });
    }

    // 1. Tạo đơn đặt bắp nước riêng
    const insertOrderQuery = `
        INSERT INTO don_dat_bap_nuoc_rieng (ma_tai_khoan, thoi_gian_dat, tong_tien, ma_rap, da_xoa)
        VALUES (?, ?, ?, ?, 0)
    `;
    // Tính tổng tiền
    const tong_tien = items.reduce((sum, item) => sum + (item.don_gia * item.so_luong), 0);
    // Lấy ma_rap từ frontend nếu có, hoặc bạn có thể truyền thêm từ client
    const ma_rap = req.body.ma_rap || null;

    db.query(insertOrderQuery, [ma_tai_khoan, thoi_gian_dat, tong_tien, ma_rap], (err, result) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi khi tạo đơn đặt bắp nước: ' + err.message });
        }
        const ma_don_dat = result.insertId;

        // 2. Thêm chi tiết bắp nước
        const detailValues = items.map(item => [ma_don_dat, item.ma_bap_nuoc, item.so_luong]);
        db.query(
            'INSERT INTO ct_don_dat_bap_nuoc (ma_don_dat, ma_bap_nuoc, so_luong) VALUES ?',
            [detailValues],
            (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Lỗi khi thêm chi tiết bắp nước: ' + err.message });
                }
                res.status(201).json({
                    success: true,
                    message: 'Đặt bắp nước thành công.',
                    data: { ma_don_dat }
                });
            }
        );
    });
};

exports.sendEmail = async (req, res) => {
    const { to, subject, html } = req.body;

    if (!to || !subject || !html) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin email (to, subject, html)' });
    }

    const mailOptions = {
        from: 'cbhdcinema@gmail.com',
        to: to,
        subject: subject,
        html: html,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email đã được gửi thành công' });
    } catch (error) {
        console.error('Lỗi khi gửi email:', error);
        res.status(500).json({ success: false, message: 'Lỗi khi gửi email: ' + error.message });
    }
};

exports.getBookingDetailById = (req, res) => {
    const ma_dat_ve = req.params.ma_dat_ve;

    // 1. Lấy thông tin đặt vé + phim + suất chiếu + phòng + rạp + âm thanh
    const bookingQuery = `
        SELECT dv.*, 
               lc.thoi_gian_bat_dau, lc.thoi_gian_ket_thuc, 
               lc.ma_phim, f.ten_phim, f.image AS phim_image, f.thoi_luong_phut, f.gioi_han_tuoi,
               lc.ma_phong, pc.ten_phong, pc.ma_rap, r.ten_rap, r.dia_chi, r.image AS rap_image,
               lc.ma_am_thanh, at.ten_am_thanh
        FROM dat_ve dv
        JOIN lich_chieu lc ON dv.ma_lich_chieu = lc.ma_lich_chieu
        JOIN phim f ON lc.ma_phim = f.ma_phim
        JOIN phong_chieu pc ON lc.ma_phong = pc.ma_phong
        JOIN rap r ON pc.ma_rap = r.ma_rap
        LEFT JOIN am_thanh at ON lc.ma_am_thanh = at.ma_am_thanh
        WHERE dv.ma_dat_ve = ?
    `;

    db.query(bookingQuery, [ma_dat_ve], (err, bookingResult) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi truy vấn đặt vé: ' + err.message });
        }
        if (!bookingResult || bookingResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt vé.' });
        }

        const booking = bookingResult[0];

        // 2. Lấy chi tiết loại vé
        db.query(
            `SELECT lv.ten_loai, lv.don_gia, clv.so_luong 
             FROM ct_loai_ve clv 
             JOIN loai_ve lv ON clv.ma_loai = lv.ma_loai 
             WHERE clv.ma_dat_ve = ?`,
            [ma_dat_ve],
            (err, ticketDetails) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Lỗi truy vấn loại vé: ' + err.message });
                }

                // 3. Lấy chi tiết bắp nước
                db.query(
                    `SELECT bn.ten_bap_nuoc, bn.don_gia, bn.image, cbn.so_luong 
                     FROM ct_bap_nuoc cbn 
                     JOIN bap_nuoc bn ON cbn.ma_bap_nuoc = bn.ma_bap_nuoc 
                     WHERE cbn.ma_dat_ve = ?`,
                    [ma_dat_ve],
                    (err, snackDetails) => {
                        if (err) {
                            return res.status(500).json({ success: false, message: 'Lỗi truy vấn bắp nước: ' + err.message });
                        }

                        // 4. Lấy danh sách ghế đã đặt
                        db.query(
                            `SELECT g.ten_ghe, g.hang_ghe 
                             FROM trang_thai_ghe_suat_chieu ttsc 
                             JOIN ghe g ON ttsc.ma_ghe = g.ma_ghe 
                             WHERE ttsc.ma_dat_ve = ?`,
                            [ma_dat_ve],
                            (err, seatDetails) => {
                                if (err) {
                                    return res.status(500).json({ success: false, message: 'Lỗi truy vấn ghế: ' + err.message });
                                }

                                res.json({
                                    success: true,
                                    data: {
                                        booking,
                                        ticketDetails,
                                        snackDetails,
                                        seatDetails
                                    }
                                });
                            }
                        );
                    }
                );
            }
        );
    });
};

exports.getPopcornOrderDetailById = (req, res) => {
    const ma_don_dat = req.params.ma_don_dat;

    const popcornOrderQuery = `
        SELECT ddbn.*, r.ten_rap, r.dia_chi, r.image AS rap_image, tk.ten_dang_nhap, tk.ho_va_ten
        FROM don_dat_bap_nuoc_rieng ddbn
        JOIN rap r ON ddbn.ma_rap = r.ma_rap
        JOIN tai_khoan tk ON ddbn.ma_tai_khoan = tk.ma_tai_khoan
        WHERE ddbn.ma_don_dat = ?
    `;

    db.query(popcornOrderQuery, [ma_don_dat], (err, orderResult) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Lỗi truy vấn đơn đặt bắp nước: ' + err.message });
        }
        if (!orderResult || orderResult.length === 0) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy đơn đặt bắp nước.' });
        }

        const order = orderResult[0];

        // 2. Lấy chi tiết bắp nước
        db.query(
            `SELECT bn.ten_bap_nuoc, bn.don_gia, bn.image, ctdbn.so_luong
             FROM ct_don_dat_bap_nuoc ctdbn
             JOIN bap_nuoc bn ON ctdbn.ma_bap_nuoc = bn.ma_bap_nuoc
             WHERE ctdbn.ma_don_dat = ?`,
            [ma_don_dat],
            (err, snackDetails) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Lỗi truy vấn chi tiết bắp nước: ' + err.message });
                }

                res.json({
                    success: true,
                    data: {
                        order,
                        snackDetails
                    }
                });
            }
        );
    });
};