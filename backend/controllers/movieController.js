const movie = require('../models/Movie');

exports.getMovies = (req, res) => {
    movie.getAll((err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        res.json({ success: true, data: result });
    });
}

exports.getNowShowing = (req, res) => {
    const limit = 7;
    movie.getNowShowing(limit, (err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        res.json({ success: 'true', data: result });
    });
}

exports.getComingSoon = (req, res) => {
    const limit = 7;
    movie.getComingSoon(limit, (err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        res.json({ success: 'true', data: result });
    });
}

exports.getMovieByID = (req, res) => {
    let movieID = req.params.id;

    movie.getByID(movieID, (err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        if (!result)
            return res.status(404).json({ error: 'Không tìm thấy phim!' });
        res.json({ success: 'true', data: result[0] });
    });
}

exports.createMovie = (req, res) => {
    let movieData = req.body;
    let isEmptyData = !movieData.ten_phim || !movieData.mo_ta || !movieData.ngay_phat_hanh
        || !movieData.thoi_luong_phut || !movieData.noi_dung_phim || !movieData.gioi_han_tuoi

    // Nếu có file ảnh mới, cập nhật đường dẫn ảnh
    if (req.file) {
        movieData.image = `/frontend/assets/images/theater/${req.file.filename}`;
    }

    if (isEmptyData)
        return res.status(400).json({ error: 'Đã có thuộc tính bị trống!' });

    const posterPath = req.file ? `/frontend/assets/images/${req.file.filename}` : null;
    if (!posterPath)
        return res.status(400).json({error: 'Chưa upload ảnh poster!'});

    movieData.image = posterPath;

    console.log('Dữ liệu gửi lên database:', movieData); // Log để kiểm tra dữ liệu

    movie.create(movieData, (err, result) => {
        if (err) return res.status(500).json({ error: err });
        res.status(201).json({ success: 'true', poster: posterPath});
    });
}

exports.getMovieByTheater = (req, res) => {
    let theaterID = req.params.id;

    movie.getByTheater(theaterID, (err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        res.json({ success: 'true', data: result });
    });
}

exports.updateMovie = (req, res) => {
    let movieID = req.params.id;
    let data = req.body;
    
    // Nếu có file ảnh mới, cập nhật đường dẫn ảnh
    if (req.file) {
        data.poster = `/frontend/assets/images/${req.file.filename}`;
    }

    movie.update(movieID, data, (err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Không tìm thấy phim!' });

        res.status(200).json({ success: 'true' });
    });
}

exports.deleteMovie = (req, res) => {
    let movieID = req.params.id;

    movie.delete(movieID, (err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        if (result.affectedRows === 0)
            return res.status(404).json({ error: 'Không tìm thấy thông tin phim!' });

        res.status(200).json({ success: 'true' });
    });
}