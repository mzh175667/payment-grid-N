let express = require('express');
let router = express.Router();

const {
    createCustomer,
    getAllCustomers,
    getCustomerData,
    getCustomerCount,
    customerDelete,
    getCustomer,
    updateCustomerInformation,
} = require('../controllers/CustomerController');

const {
    isLoggedIn,
    requireSignin,
    parseToken,
} = require('../middlewares/auth');

// CREATE CUSTOMER
router.post(
    '/customer-create',
    parseToken,
    requireSignin,
    isLoggedIn,
    createCustomer
);

router.get(
    '/customers',
    parseToken,
    requireSignin,
    isLoggedIn,
    getAllCustomers
);

router.post(
    '/customers/list/data',
    parseToken,
    requireSignin,
    isLoggedIn,
    getCustomerData
);

router.get(
    '/customers/count',
    parseToken,
    requireSignin,
    isLoggedIn,
    getCustomerCount
);

router.post(
    '/customer/delete',
    parseToken,
    requireSignin,
    isLoggedIn,
    customerDelete
);

router.post(
    '/customer/get',
    parseToken,
    requireSignin,
    isLoggedIn,
    getCustomer
);

router.post(
    '/customer/updateInformation',
    parseToken,
    requireSignin,
    isLoggedIn,
    updateCustomerInformation
);

module.exports = router;
