let express = require('express');
let router = express.Router();

const {
    stripeCharge,
    invoiceCharge,
    setupTerminal,
    getSetupTerminal,
} = require('../controllers/VirtualTerminalController');

const {
    isLoggedIn,
    requireSignin,
    parseToken,
} = require('../middlewares/auth');

// STRIPE MANUALLY ENTERED CARD CHARGE
router.post(
    '/stripe-charge',
    parseToken,
    requireSignin,
    isLoggedIn,
    stripeCharge
);

router.post(
    '/invoice-charge',
    parseToken,
    requireSignin,
    isLoggedIn,
    invoiceCharge
);

router.post(
    '/setup-terminal',
    parseToken,
    requireSignin,
    isLoggedIn,
    setupTerminal
);

router.post(
    '/get-setup-terminal',
    parseToken,
    requireSignin,
    isLoggedIn,
    getSetupTerminal
);

module.exports = router;
