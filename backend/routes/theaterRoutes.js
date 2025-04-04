const express = require('express');
const router = express.Router();
const theaterController = require('../controllers/theaterController');

router.get('/', theaterController.getTheaters);
router.get('/:id', theaterController.getTheaterByID);
router.post('/', theaterController.createTheater);
router.put('/:id', theaterController.updateTheater);
router.delete('/:id', theaterController.deleteTheater);

module.exports = router;