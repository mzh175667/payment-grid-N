const Invoices = require('../models/Invoices');
const Customers = require('../models/Customers');
const Helpers = require('../models/Helpers');
const { paginateArray } = require('../utils');
const multer = require('multer');

let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/invoice');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

let upload = multer({ storage: storage }).array('file');

exports.invoiceNumberCount = async function (req, res) {
    try {
        let status = 500;
        let user = req.user;
        let count = 0;
        await Invoices.invoiceNumberCount(user)
            .then((response) => {
                status = response.status;
                count = Number(response.count) + 1;
            })
            .catch((error) => {
                console.log('Invoice track number count get error : ' + error);
                Helpers.errorLogging(
                    'Invoice track number count get error : ' + error
                );
            });
        let newCount = Helpers.zeroFill(count, 5);
        return res.status(200).json(newCount);
    } catch (error) {
        console.log('Invoice track number count get error : ' + error);
        Helpers.errorLogging('Invoice track number count get error : ' + error);
    }
};

exports.getPaymentDetails = async function (req, res) {
    try {
        let status = 500;
        let user = req.user;
        let paymentDetails = {};
        await Invoices.getPaymentDetails(user)
            .then((response) => {
                status = response.status;
                paymentDetails = response.paymentDetails;
            })
            .catch((error) => {
                console.log('Payment Details get error : ' + error);
                Helpers.errorLogging('Payment Details get error : ' + error);
            });

        return res.status(200).json(paymentDetails);
    } catch (error) {
        console.log('Payment Details get error : ' + error);
        Helpers.errorLogging('Payment Details get error : ' + error);
    }
};

exports.updatePaymentDetails = async function (req, res) {
    try {
        let status = 500;
        let user = req.user;
        let inputs = req.body;
        await Invoices.updatePaymentDetails(inputs, user)
            .then((response) => {
                status = response.status;
            })
            .catch((error) => {
                console.log('Payment Details update error : ' + error);
                Helpers.errorLogging('Payment Details update error : ' + error);
            });

        return res.status(200).json(status);
    } catch (error) {
        console.log('Payment Details update error : ' + error);
        Helpers.errorLogging('Payment Details update error : ' + error);
    }
};

exports.invoiceCustomerCreate = async function (req, res) {
    try {
        let status = 500;
        let user = req.user;
        let customer = {};
        let inputs = req.body;
        await Invoices.invoiceCustomerCreate(inputs, user)
            .then((response) => {
                status = response.status;
                customer = response.customer;
            })
            .catch((error) => {
                console.log('Customer create error : ' + error);
                Helpers.errorLogging('Customer create error : ' + error);
            });

        return res.status(200).json({ status, customer });
    } catch (error) {
        console.log('Customer create error : ' + error);
        Helpers.errorLogging('Customer create error : ' + error);
    }
};

exports.createInvoice = async function (req, res) {
    try {
        let status = 500;
        let user = req.user;
        let customer = {};
        let inputs = req.body.data;
        let invoiceData = {};
        await Invoices.createInvoice(inputs, user)
            .then((response) => {
                status = response.status;
                customer = response.customer;
                invoiceData = response.invoiceData;
            })
            .catch((error) => {
                console.log('Invoice create error: ' + error);
                Helpers.errorLogging('Invoice create error : ' + error);
            });

        return res.status(200).json({ status, customer, invoiceData });
    } catch (error) {
        console.log('Invoice create error: ' + error);
        Helpers.errorLogging('Invoice create error : ' + error);
    }
};

exports.getAllInvoices = async function (req, res) {
    try {
        let user = req.user;
        let invoices = [];
        let {
            q = '',
            perPage = 10,
            page = 1,
            status = null,
            sort,
            sortColumn,
        } = req.body.config;

        await Invoices.getAllInvoices(user)
            .then((response) => {
                status = response.status;
                invoices = response.invoices;
            })
            .catch((error) => {
                console.log('Invoice get error : ' + error);
                Helpers.errorLogging('Invoice get error : ' + error);
            });

        for (let i = 0; i < invoices.length; i++) {
            if (
                invoices[i].customer_id != null ||
                invoices[i].customer_id != undefined
            ) {
                await Customers.getCustomerById(invoices[i].customer_id)
                    .then((response) => {
                        invoices[i].customer_name = response.user.full_name;
                        invoices[i].customer_email = response.user.email;
                    })
                    .catch((error) => {
                        console.log('Customer by get id error ', error);
                    });
            } else {
                invoices[i].customer_name = 'No Customer Selected';
                invoices[i].customer_email = '---';
            }
        }

        const dataAsc = invoices.sort((a, b) => {
            if (a[sortColumn]) {
                return a[sortColumn] < b[sortColumn] ? -1 : 1;
            } else {
                const splitColumn = sortColumn.split('.');
                const columnA = a[splitColumn[0]][splitColumn[1]];
                const columnB = b[splitColumn[0]][splitColumn[1]];
                return columnA < columnB ? -1 : 1;
            }
        });

        const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse();

        const queryLowered = q.toLowerCase();

        const filteredData = dataToFilter.filter((invoice) => {
            if (String('paid').includes(queryLowered) && invoice.total === 0) {
                return invoice.total === 0;
            } else {
                return (
                    invoice.customer_email
                        .toLowerCase()
                        .includes(queryLowered) ||
                    invoice.customer_name
                        .toLowerCase()
                        .includes(queryLowered) ||
                    String(invoice.invoice_number)
                        .toLowerCase()
                        .includes(queryLowered) ||
                    String(invoice.total)
                        .toLowerCase()
                        .includes(queryLowered) ||
                    String(invoice.status).toLowerCase().includes(queryLowered)
                );
            }
        });

        let data = {
            allData: invoices,
            total: filteredData.length,
            invoices:
                filteredData.length <= perPage
                    ? filteredData
                    : paginateArray(filteredData, perPage, page),
        };

        return res.status(200).json(data);
    } catch (error) {
        console.log('Invoice get error : ' + error);
        Helpers.errorLogging('Invoice get error : ' + error);
    }
};

exports.deleteInvoice = async function (req, res) {
    try {
        let status = 500;
        let user = req.user;
        let id = req.body.id;
        await Invoices.deleteInvoice(user, id)
            .then((response) => {
                status = response.status;
            })
            .catch((error) => {
                console.log('Invoice Delete error : ' + error);
                Helpers.errorLogging('Invoice Delete error : ' + error);
            });

        return res.status(200).json(status);
    } catch (error) {
        console.log('Invoice Delete error : ' + error);
        Helpers.errorLogging('Invoice Delete error : ' + error);
    }
};

exports.getInvoiceByUuid = async function (req, res) {
    try {
        let status = 500;
        let user = req.user;
        let id = req.body.id;
        let invoice = {};
        await Invoices.getInvoiceByUuid(user, id)
            .then((response) => {
                status = response.status;
                invoice = response.invoice;
            })
            .catch((error) => {
                console.log('Invoice by UUid error : ' + error);
                Helpers.errorLogging('Invoice by UUid error : ' + error);
            });

        return res.status(200).json({ status, invoice });
    } catch (error) {
        console.log('Invoice by UUid error : ' + error);
        Helpers.errorLogging('Invoice by UUid error : ' + error);
    }
};

exports.uploadInvoicePdf = async function (req, res) {
    try {
        upload(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json(err);
            } else if (err) {
                return res.status(500).json(err);
            }

            return res.status(200).json({ files: req.files });
        });
    } catch (error) {
        console.log('Upload Invoice PDF error : ' + error);
        Helpers.errorLogging('Upload Invoice PDF error : ' + error);
    }
};
