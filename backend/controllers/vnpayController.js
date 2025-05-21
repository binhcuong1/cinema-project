const db = require('../config/db');
const express = require('express');
const { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } = require('vnpay');
const app = express();

app.use(express.json());

exports.createQR = async (req, res) => {
    const { ma_dat_ve, tongTien } = req.body;

    const vnpay = new VNPay({
        tmnCode: 'DO2V2FCU',
        secureSecret: '1O5X6DP6H2PN1KYTN16QFD9O6KZ0AQZ2',
        vnpayHost: 'https://sandbox.vnpayment.vn',
        testMode: true,
        hashAlgorithm: 'SHA512',
        loggerFn: ignoreLogger
    });

    const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: tongTien,
        vnp_IpAddr: '127.0.0.1',
        vnp_TxnRef: `TXN_${Date.now()}`,
        vnp_OrderInfo: 'Thanh toán đơn hàng 123456789',
        vnp_OrderType: ProductCode.Other,
        vnp_Locale: VnpLocale.VN,
        vnp_ReturnUrl: 'http://127.0.0.1:3000/api/vnpay/check-payment-vnpay',
        vnp_CreateDate: dateFormat(new Date()),
        vnp_ExpireDate: dateFormat(new Date(Date.now() + 60 * 60 * 1000)),
    });

    return res.status(201).json({ payUrl: vnpayResponse, ma_dat_ve });
};

exports.checkPaymentVNPAY = async (req, res) => {
    const vnpayResponse = req.query;
    console.log('VNPAY Response:', vnpayResponse);

    if (vnpayResponse.vnp_TxnRef) {
        return res.redirect(`http://127.0.0.1:5500/frontend/pages/booking/checkout.html?paymentSuccess=true&maDatVe=${vnpayResponse.vnp_TxnRef}`);
    } else {
        return res.status(400).json({
            message: 'Thanh toán thất bại, không nhận được phản hồi hợp lệ',
        });
    }
};