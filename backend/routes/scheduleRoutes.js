const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.get('/room/:id', scheduleController.getByRoom);
router.get('/audios/', scheduleController.getAudios);
router.get('/movie/:movieId/dates', scheduleController.getDatesByTheaterAndMovie);
router.get('/movie/:movieId/:date/showtimes', scheduleController.getShowtimesByMovieAndDate);
router.post('/audios/', scheduleController.createAudio);
router.post('/', scheduleController.createSchedules);

router.get('/:id', scheduleController.getById);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;