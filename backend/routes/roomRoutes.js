const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/:id', roomController.getRoomByID);
router.get('/theater/:id', roomController.getAll);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);

module.exports = router;