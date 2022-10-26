let express = require('express');
let router = express.Router();

const {
    invoiceNumberCount,
    getPaymentDetails,
    updatePaymentDetails,
    invoiceCustomerCreate,
    createInvoice,
    getAllInvoices,
    deleteInvoice,
    uploadInvoicePdf,
    getInvoiceByUuid,
} = require('../controllers/InvoiceController');

const {
    isLoggedIn,
    requireSignin,
    parseToken,
} = require('../middlewares/auth');

// INVOICE NUMBER
router.post(
    '/invoice-number-count',
    parseToken,
    requireSignin,
    isLoggedIn,
    invoiceNumberCount
);

// GET PAYMENT DETAILS
router.get(
    '/get-payment-details',
    parseToken,
    requireSignin,
    isLoggedIn,
    getPaymentDetails
);

// UPDATE PAYMENT DETAILS
router.post(
    '/update-payment-details',
    parseToken,
    requireSignin,
    isLoggedIn,
    updatePaymentDetails
);

// Customer create Invoice
router.post(
    '/invoice-customer-create',
    parseToken,
    requireSignin,
    isLoggedIn,
    invoiceCustomerCreate
);

// create invoice
router.post(
    '/create-invoice',
    parseToken,
    requireSignin,
    isLoggedIn,
    createInvoice
);

// get all invoices
router.post(
    '/get-all-invoices',
    parseToken,
    requireSignin,
    isLoggedIn,
    getAllInvoices
);

// delete invoice
router.post(
    '/delete-invoice',
    parseToken,
    requireSignin,
    isLoggedIn,
    deleteInvoice
);

// get Invoice by uui invoice
router.post(
    '/get-invoice',
    parseToken,
    requireSignin,
    isLoggedIn,
    getInvoiceByUuid
);

// get Invoice by uui invoice
router.post(
    '/upload-invoice-pdf',
    parseToken,
    requireSignin,
    isLoggedIn,
    uploadInvoicePdf
);

module.exports = router;
