let express = require('express');
let router = express.Router();

const {
    dashboardCustomers,
    dashboardPayments,
} = require('../controllers/DashboardController');

const {
    isLoggedIn,
    requireSignin,
    parseToken,
} = require('../middlewares/auth');

router.post(
    '/dashborad/statistics/customers',
    parseToken,
    requireSignin,
    isLoggedIn,
    dashboardCustomers
);

router.post(
    '/dashborad/statistics/payments',
    parseToken,
    requireSignin,
    isLoggedIn,
    dashboardPayments
);

module.exports = router;
