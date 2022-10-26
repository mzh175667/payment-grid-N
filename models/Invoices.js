const invoiceTable = 'invoices';
const invoiceNumberTrackTable = 'invoice_number_track';
const customerTable = 'customers';
const billingAddressTable = 'billing_address';
const paymentDetailTable = 'payment_detail';
const moment = require('moment-timezone');
const Helpers = require('./Helpers');
let timeZone = process.env.TIME_ZONE;
const knex = require('../knex/knex.js');

function invoiceNumberCount(user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let count = 0;
        let status = 500;

        await knex(invoiceNumberTrackTable)
            .where('user_id', userId)
            .then((response) => {
                count = response[0].count;
                status = 200;
            })
            .catch((error) => {
                console.log('Invoice track number count get error : ', error);
                Helpers.errorLogging(
                    'Invoice track number count get error : ' + error
                );
                status = 500;
            });

        resolve({
            status: status,
            count,
        });
    });
}

function getPaymentDetails(user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let paymentDetails = {};
        let status = 500;

        await knex(paymentDetailTable)
            .where('user_id', userId)
            .then((response) => {
                paymentDetails = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Payment Detail get error : ', error);
                Helpers.errorLogging('Payment Detail  get error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
            paymentDetails,
        });
    });
}

function updatePaymentDetails(inputs, user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let paymentDetails = {};
        let status = 500;
        let getUuid = '';
        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        await Helpers.getUuid().then((response) => {
            getUuid = response;
        });

        await knex(paymentDetailTable)
            .where('user_id', userId)
            .then((response) => {
                paymentDetails = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Payment Detail get error : ', error);
                Helpers.errorLogging('Payment Detail  get error : ' + error);
                status = 500;
            });
        if (!paymentDetails) {
            await knex(paymentDetailTable)
                .insert({
                    user_id: userId,
                    uuid: getUuid,
                    bank_name: inputs.formPaymentDetails.bank_name,
                    bank_country: inputs.formPaymentDetails.bank_country,
                    iban: inputs.formPaymentDetails.iban,
                    swift_code: inputs.formPaymentDetails.swift_code,
                    created_at: currentDateTime,
                })
                .then((response) => {
                    status = 200;
                })
                .catch((error) => {
                    console.log('Payment Detail insert error : ', error);
                    Helpers.errorLogging(
                        'Payment Detail insert error : ' + error
                    );
                    status = 500;
                });
        } else {
            await knex(paymentDetailTable)
                .where('user_id', userId)
                .update({
                    bank_name: inputs.formPaymentDetails.bank_name,
                    bank_country: inputs.formPaymentDetails.bank_country,
                    iban: inputs.formPaymentDetails.iban,
                    swift_code: inputs.formPaymentDetails.swift_code,
                    updated_at: currentDateTime,
                })
                .then((response) => {
                    status = 200;
                })
                .catch((error) => {
                    console.log('Payment Detail update error : ', error);
                    Helpers.errorLogging(
                        'Payment Detail  update error : ' + error
                    );
                    status = 500;
                });
        }

        resolve({
            status: status,
        });
    });
}

function invoiceCustomerCreate(inputs, user) {
    return new Promise(async function (resolve, reject) {
        let email = inputs.data.email;
        let first_name = inputs.data.firstname;
        let last_name = inputs.data.lastname;
        let phone = inputs.data.phone;
        let street_1 = inputs.data.street1;
        let street_2 = inputs.data.street2;
        let city = inputs.data.city;
        let state = inputs.data.state;
        let zip = inputs.data.zip;
        let gender = inputs.data.gender;
        let country = inputs.data.country;
        let tax_id = inputs.data.tax_id;
        let company_name = inputs.data.company_name;
        let full_name = first_name + ' ' + last_name;
        let status = 500;
        let getUuid = '';
        let customer = {};
        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        let customerId = '';
        await Helpers.getUuid().then((response) => {
            getUuid = response;
        });

        let customerInsert = {
            first_name,
            last_name,
            full_name,
            email,
            phone,
            city,
            state,
            zip,
            country,
            gender,
            street_1,
            street_2,
            created_at: currentDateTime,
            uuid: getUuid,
            user_id: user.id,
            tax_id,
            company_name,
        };

        await knex(customerTable)
            .insert(customerInsert)
            .then((response) => {
                customerId = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Customer create error : ', error);
                Helpers.errorLogging('Customer create error : ' + error);
                status = 500;
            });

        let billingAddressInsert = {
            tax_id: tax_id,
            street_1: street_1,
            street_2: street_2,
            email: email,
            phone: phone,
            city: city,
            state: state,
            zip: zip,
            country: country,
            vat_number: '',
            company_name: company_name,
            created_at: currentDateTime,
            customer_id: customerId,
        };

        await knex(billingAddressTable)
            .insert(billingAddressInsert)
            .then((response) => {
                status = 200;
            })
            .catch((error) => {
                console.log('Customer billing address create error : ', error);
                Helpers.errorLogging(
                    'Customer billing address create error : ' + error
                );
                status = 500;
            });

        await knex(customerTable)
            .where('id', customerId)
            .then((response) => {
                customer = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Customer get error : ', error);
                Helpers.errorLogging('Customer get error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
            customer,
        });
    });
}

function createInvoice(inputs, user) {
    return new Promise(async function (resolve, reject) {
        let invoiceStatus = 'Draft';
        let files = inputs.files;
        let filesToUplaod = inputs.filesOnBackend;
        let uploadFiles = [];
        for (let i = 0; i < files.length; i++) {
            let word = files[i].path;

            for (let j = 0; j < filesToUplaod.length; j++) {
                if (word == filesToUplaod[j].originalname) {
                    uploadFiles.push(filesToUplaod[j]);
                }
            }
        }
        const unique = [...new Set(uploadFiles)];

        let date = inputs.date.value;
        let dueDateFrom = inputs.dueDateFrom.value;
        let dueDateTo = inputs.dueDateTo.value;
        let dueIn = inputs.dueIn.value;
        let salesPerson = inputs.salesPerson;
        let note = inputs.note;
        let terms = inputs.terms;
        let subtotal = inputs.subtotal;
        let tax = inputs.tax;
        let discount = inputs.discount;
        let total = inputs.total;
        let productDetails = inputs.productDetail;
        let customerId = inputs.customerDetail.value;
        let bankDetailId = inputs.bankDetail.id;
        let status = 500;
        let getUuid = '';
        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');
        let invoiceId = '';
        let invoiceData = {};

        await Helpers.getUuid().then((response) => {
            getUuid = response;
        });

        let newDate = moment(date).tz(timeZone).format('YYYY-MM-DD HH:mm:ss');

        let newDueDateFrom = moment(dueDateFrom)
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        let newDueDateTo = moment(dueDateTo)
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        let invoiceInsert = {
            date: newDate,
            due_date_from: newDueDateFrom,
            due_date_to: newDueDateTo,
            due_in: dueIn,
            sales_person: salesPerson,
            note,
            terms,
            subtotal,
            tax,
            discount,
            total,
            product_details: productDetails,
            payment_detail_id: bankDetailId,
            customer_id: customerId,
            created_at: currentDateTime,
            uuid: getUuid,
            user_id: user.id,
            status: invoiceStatus,
            invoice_number: inputs.invoiceNumber,
            files: JSON.stringify(unique),
        };

        await knex(invoiceTable)
            .insert(invoiceInsert)
            .then((response) => {
                status = 200;
                invoiceId = response[0];
            })
            .catch((error) => {
                console.log('Invoice create error : ', error);
                Helpers.errorLogging('Invoice create error : ' + error);
                status = 500;
            });

        // get invoice By Id
        await invoiceById(invoiceId)
            .then((response) => {
                invoiceData = response.invoice;
            })
            .catch((error) => {
                console.log('Invoice get error : ', error);
                Helpers.errorLogging('Invoice get error : ' + error);
                status = 500;
            });

        // UPDATE INVOICE COUNT OF USER
        await knex(invoiceNumberTrackTable)
            .where('user_id', user.id)
            .increment('count', 1)
            .then((response) => {
                status = 200;
            })
            .catch((error) => {
                console.log('Invoice increment error : ', error);
                Helpers.errorLogging('Invoice increment error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
            invoiceData,
        });
    });
}

function getAllInvoices(user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let invoices = [];
        let status = 500;

        await knex(invoiceTable)
            .where('user_id', userId)
            .then((response) => {
                invoices = response;
                status = 200;
            })
            .catch((error) => {
                console.log('Invoice get error : ', error);
                Helpers.errorLogging('Invoice get error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
            invoices,
        });
    });
}

function deleteInvoice(user, id) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let status = 500;

        await knex(invoiceTable)
            .where('user_id', userId)
            .where('uuid', id)
            .delete()
            .then((response) => {
                status = 200;
            })
            .catch((error) => {
                console.log('Invoice delete error : ', error);
                Helpers.errorLogging('Invoice delete error : ' + error);
                status = 500;
            });
        resolve({
            status: status,
        });
    });
}

// INVOICE BY ID
function invoiceById(id) {
    return new Promise(async function (resolve, reject) {
        let status = 500;
        let invoice = {};

        await knex(invoiceTable)
            .where('id', id)
            .then((response) => {
                invoice = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Invoice get error : ', error);
                Helpers.errorLogging('Invoice get error : ' + error);
                status = 500;
            });
        resolve({
            status: status,
            invoice,
        });
    });
}

// INVOICE BY UUID
function getInvoiceByUuid(user, uuid) {
    return new Promise(async function (resolve, reject) {
        let status = 500;
        let invoice = {};
        let customer_detail = {};
        let payment_detail = {};

        await knex(invoiceTable)
            .where('uuid', uuid)
            .then((response) => {
                invoice = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Invoice get error : ', error);
                Helpers.errorLogging('Invoice get error : ' + error);
                status = 500;
            });

        if (invoice && invoice.customer_id && invoice.customer_id != '') {
            await knex('customers')
                .where('id', invoice.customer_id)
                .then((response) => {
                    customer_detail = response[0];
                    invoice.customer_detail = customer_detail;
                })
                .catch((error) => {
                    console.log('Invoice Customer get error : ', error);
                    Helpers.errorLogging(
                        'Invoice Customer get error : ' + error
                    );
                });
        } else {
            customer_detail = '';
        }
        if (invoice) {
            await getPaymentDetails(user)
                .then((response) => {
                    payment_detail = response.paymentDetails;
                    invoice.payment_detail = payment_detail;
                })
                .catch((error) => {
                    console.log('Invoice Payment method get error : ', error);
                    Helpers.errorLogging(
                        'Invoice Payment method get error : ' + error
                    );
                });
        }

        resolve({
            status: status,
            invoice,
        });
    });
}

module.exports = {
    invoiceNumberCount,
    getPaymentDetails,
    invoiceCustomerCreate,
    updatePaymentDetails,
    createInvoice,
    getAllInvoices,
    deleteInvoice,
    invoiceById,
    getInvoiceByUuid,
};
