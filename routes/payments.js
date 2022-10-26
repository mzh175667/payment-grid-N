let express = require('express');
let router = express.Router();

const {
    getAllPayments,
    getPaymentsData,
    getPaymentCount,
    getPayment,
    paymentDelete,
    updatePaymentInformation,
} = require('../controllers/PaymentController');

const {
    isLoggedIn,
    requireSignin,
    parseToken,
} = require('../middlewares/auth');

router.get('/payments', parseToken, requireSignin, isLoggedIn, getAllPayments);

router.post(
    '/payments/list/data',
    parseToken,
    requireSignin,
    isLoggedIn,
    getPaymentsData
);

router.get(
    '/payments/count',
    parseToken,
    requireSignin,
    isLoggedIn,
    getPaymentCount
);

router.post('/payment/get', parseToken, requireSignin, isLoggedIn, getPayment);

router.post(
    '/payment/delete',
    parseToken,
    requireSignin,
    isLoggedIn,
    paymentDelete
);

router.post(
    '/payment/updateInformation',
    parseToken,
    requireSignin,
    isLoggedIn,
    updatePaymentInformation
);

module.exports = router;
