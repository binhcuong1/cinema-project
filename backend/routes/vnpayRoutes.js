const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/vnpayController');


router.post('/create-qr', vnpayController.createQR);
router.post('/popcorn/create-qr', vnpayController.popcorn_CreateQR);

router.get('/check-payment-vnpay', vnpayController.checkPaymentVNPAY);
router.get('/popcorn/check-payment-vnpay', vnpayController.popcorn_checkPaymentVNPAY);

module.exports = router;