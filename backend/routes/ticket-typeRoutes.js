const express = require('express');
const router = express.Router();
const tickeyTypeController = require('../controllers/ticketTypeController');

router.get('/', tickeyTypeController.getAllTicketTypes);
router.get('/:id', tickeyTypeController.getTicketTypeById);
router.post('/', tickeyTypeController.createTicketType);
router.post('/update/:id', tickeyTypeController.updateTicketType);
router.delete('/:id', tickeyTypeController.deleteTicketType);

module.exports = router;