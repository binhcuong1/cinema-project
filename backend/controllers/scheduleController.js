const schedule = require('../models/Schedule');

exports.getByRoom = (req, res) => {
    const roomID = parseInt(req.params.id); // Chuyển đổi thành số
    const date = req.query.date; // Lấy tham số date từ query string
    
    // Kiểm tra date hợp lệ (YYYY-MM-DD)
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({ error: 'Ngày chiếu không hợp lệ! Định dạng: YYYY-MM-DD' });
    }

    schedule.getByRoom(roomID, date, (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Lỗi server: ' + err.message });
        }
        if (result.length === 0) {
            return res.status(404).json({ error: 'Không tìm thấy lịch chiếu cho phòng này!' });
        }
        res.json({ success: true, data: result });
    });
};

exports.getAudios = (req, res) => {
    schedule.getAudios((err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        res.json({ success: 'true', data: result });
    });
};

exports.createAudio = (req, res) => {
    let audioData = req.body;

    // Kiểm tra dữ liệu đầu vào
    let isEmptyData = !audioData.ten_am_thanh;
    if (isEmptyData) {
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc khi kiểm tra tại controller!' });
    }

    schedule.createAudio(audioData, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message || 'Không thể tạo âm thanh!' });
        }
        res.status(201).json({ success: 'true', data: result });
    });
};

exports.createSchedules = async (req, res) => {
    const {
        ma_phong,
        thoi_gian_bat_dau,
        num_shows,
        ma_am_thanh,
        movie_duration,
        interval_minutes
    } = req.body;
    const ma_phim = req.body.maPhim;

    if (!ma_phong || !thoi_gian_bat_dau || !num_shows || !ma_phim || !ma_am_thanh || !movie_duration || !interval_minutes) {
        console.log(ma_phong, thoi_gian_bat_dau, num_shows, ma_am_thanh, movie_duration, interval_minutes, ma_phim);
        return res.status(400).json({ error: 'Thiếu thông tin bắt buộc!' });
    }

    const roomId = parseInt(ma_phong);
    const numShows = parseInt(num_shows);
    const movieDuration = parseInt(movie_duration);
    const intervalMinutes = parseInt(interval_minutes);

    if (isNaN(roomId) || isNaN(numShows) || isNaN(movieDuration) || isNaN(intervalMinutes)) {
        return res.status(400).json({ error: 'Dữ liệu không hợp lệ!' });
    }

    if (numShows < 1) {
        return res.status(400).json({ error: 'Số suất chiếu phải lớn hơn 0!' });
    }

    // Chuẩn hóa thời gian: Thêm giây và múi giờ UTC+7
    const correctedStartTime = thoi_gian_bat_dau + ':00+07:00'; // Ví dụ: '2025-05-04T08:00:00+07:00'
    let currentStartTime = new Date(correctedStartTime);

    // Lấy danh sách lịch chiếu hiện tại của phòng
    const existingSchedules = await new Promise((resolve, reject) => {
        schedule.getByRoom(roomId, thoi_gian_bat_dau.split('T')[0], (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });

    const results = [];
    let errorOccurred = null;

    // Định dạng thời gian thủ công để đảm bảo đúng múi giờ
    const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    };

    try {
        for (let i = 0; i < numShows; i++) {
            const startTime = new Date(currentStartTime);
            const endTime = new Date(currentStartTime);
            endTime.setMinutes(endTime.getMinutes() + movieDuration);

            const scheduleData = {
                ma_phong: roomId,
                thoi_gian_bat_dau: formatDateTime(startTime),
                thoi_gian_ket_thuc: formatDateTime(endTime),
                ma_phim,
                ma_am_thanh,
                da_xoa: 0
            };

            // Kiểm tra xung đột lịch chiếu
            const hasConflict = existingSchedules.some((existing) => {
                const existingStart = new Date(existing.thoi_gian_bat_dau);
                const existingEnd = new Date(existing.thoi_gian_ket_thuc);
                return (startTime >= existingStart && startTime < existingEnd) ||
                       (endTime > existingStart && endTime <= existingEnd) ||
                       (startTime <= existingStart && endTime >= existingEnd);
            });

            if (hasConflict) {
                throw new Error('Phòng đã chiếu phim khác trong thời gian này!');
            }

            // Kiểm tra khoảng cách 15 phút với lịch chiếu trước đó
            const lastSchedule = existingSchedules
                .filter((existing) => new Date(existing.thoi_gian_ket_thuc) <= startTime)
                .sort((a, b) => new Date(b.thoi_gian_ket_thuc) - new Date(a.thoi_gian_ket_thuc))[0];

            if (lastSchedule) {
                const lastEndTime = new Date(lastSchedule.thoi_gian_ket_thuc);
                const minStartTime = new Date(lastEndTime);
                minStartTime.setMinutes(minStartTime.getMinutes() + intervalMinutes);
                if (startTime < minStartTime) {
                    throw new Error(`Thời gian bắt đầu phải cách ít nhất ${intervalMinutes} phút sau khi phim trước kết thúc!`);
                }
            }

            const result = await new Promise((resolve, reject) => {
                schedule.create(scheduleData, (err, result) => {
                    if (err) reject(err);
                    else resolve(result);
                });
            });

            results.push(result);
            existingSchedules.push({ thoi_gian_bat_dau: scheduleData.thoi_gian_bat_dau, thoi_gian_ket_thuc: scheduleData.thoi_gian_ket_thuc });

            currentStartTime = new Date(endTime);
            currentStartTime.setMinutes(currentStartTime.getMinutes() + intervalMinutes);
        }

        res.status(201).json({ success: true, data: results });
    } catch (error) {
        console.error("Lỗi khi thêm lịch chiếu:", error);
        res.status(400).json({ error: error.message });
    }
};

exports.deleteSchedule = (req, res) => {
    const scheduleID = req.params.id;
    
    schedule.delete(scheduleID, (err, result) => {
        if (err)
            return res.status(500).json( {error: err } );
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Không tìm thấy thông tin lịch chiếu!' });

        res.status(200).json({ success: true, message: "Xóa lịch chiếu thành công" });    });
};