const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');

router.get('/room/:id', scheduleController.getByRoom);
router.get('/audios/', scheduleController.getAudios);
router.post('/audios/', scheduleController.createAudio);
router.post('/', scheduleController.createSchedules);
router.delete('/:id', scheduleController.deleteSchedule);

module.exports = router;