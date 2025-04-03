const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');

router.get('/', movieController.getMovies);
router.get('/:id', movieController.getMovieByID);
router.get('/theater/:id', movieController.getMovieByTheater);
router.post('/', movieController.createMovie);
router.put('/:id', movieController.updateMovie);
router.delete(':id', movieController.deleteMovie);

module.exports = router;