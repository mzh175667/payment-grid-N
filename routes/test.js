let express = require('express');
let router = express.Router();

let TestController = require('../controllers/TestController');

router.get('/', function (req, res, next) {
    return res.json({
        status: 200,
        error: false,
        message: 'Welcome To Payment Grid Test Routes',
    });
});

router.get('/updateCapabilities', TestController.stripeUpdateCapabilities);

router.get('/stripe-customer', TestController.createStripeCustomer);
router.get('/stripe-charge', TestController.stripeCharge);
router.get('/stripe-charge-capture', TestController.stripeChargeCapture);
router.get('/stripe-charge-refund', TestController.stripeChargeRefund);
router.get('/stripe-charge-retrieve', TestController.stripeChargeRetrieve);
router.get('/stripe-webhook', TestController.createStripeWebHook);
router.get('/stripe-webhook/endpoint', TestController.stripeWebHookEndpoint);

router.get('/stripe-charge-intent', TestController.stripeChargeIntent);
router.get(
    '/stripe-charge-intent-confirm',
    TestController.stripeChargeIntentConfirm
);
router.get(
    '/stripe-charge-intent-capture',
    TestController.stripeChargeIntentCapture
);
router.get(
    '/stripe-charge-intent-cancel',
    TestController.stripeChargeIntentCancel
);
router.get('/chargewithfee', TestController.chargewithfee);

router.get(
    '/stripe-charge-intent-update',
    TestController.stripeChargeIntentUpdate
);
router.get('/us-holidays', TestController.usHolidayList);
router.get('/ach-bank', TestController.stripeAchBank);
router.get('/createCustomAccount', TestController.createCustomAccount);
router.get('/fetchAccount', TestController.fetchAccount);
router.get('/create-plan', TestController.createPlan);
router.get('/customer-subscription', TestController.customerSubscription);
router.get('/invoice-item', TestController.invoiceItemsRetrieve);
router.get('/subscriptions-retrieve', TestController.subscriptionsRetrieve);

router.get('/standardAccount', TestController.standardAccount);
router.get('/standardAccountRes1', TestController.standardAccountRes1);
router.get('/standardAccountRes2', TestController.standardAccountRes2);

module.exports = router;
