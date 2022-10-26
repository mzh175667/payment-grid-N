const paymentTable = 'payments';
const moment = require('moment-timezone');
const Helpers = require('./Helpers');
let timeZone = process.env.TIME_ZONE;
const knex = require('../knex/knex.js');

function createPayment(inputs, paymentDetails, paymentMerchant, user) {
    return new Promise(async function (resolve, reject) {
        let amount = inputs.amount;
        let form_fields = JSON.stringify(inputs.formFieldData);
        let status = 500;
        let getUuid = '';
        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        await Helpers.getUuid().then((response) => {
            getUuid = response;
        });

        let paymentInsert = {
            uuid: getUuid,
            user_id: user.id,
            amount,
            merchant: paymentMerchant,
            payment_id: paymentDetails.id,
            object: paymentDetails.object,
            application: paymentDetails.application,
            application_fee_amount: paymentDetails.application_fee_amount,
            currency: paymentDetails.currency,
            description: paymentDetails.description,
            status: paymentDetails.status,
            payment_method: paymentDetails.payment_method,
            created_at: currentDateTime,
            form_fields,
        };

        await knex(paymentTable)
            .insert(paymentInsert)
            .then((response) => {
                status = 200;
            })
            .catch((error) => {
                console.log('Payment create error : ', error);
                Helpers.errorLogging('Payment create error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
        });
    });
}

function getPaymentCount(user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let paymentCount = 0;
        let allPayments = [];
        let status = 500;

        await knex(paymentTable)
            .where('user_id', userId)
            .then((response) => {
                allPayments = response;
                status = 200;
            })
            .catch((error) => {
                console.log('Payments get error : ', error);
                Helpers.errorLogging('Payments get error : ' + error);
                status = 500;
            });

        for (let i = 0; i < allPayments.length; i++) {
            paymentCount = paymentCount + Number(allPayments[i].amount);
        }

        resolve({
            status: status,
            paymentCount,
            allPayments,
        });
    });
}

function getAllPayments(user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let payments = [];
        let status = 500;

        await knex(paymentTable)
            .where('user_id', userId)
            .then((response) => {
                payments = response;
                status = 200;
            })
            .catch((error) => {
                console.log('Payments get error : ', error);
                Helpers.errorLogging('Payments get error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
            payments,
        });
    });
}

function getPayment(paymentId) {
    return new Promise(async function (resolve, reject) {
        let payment = {};
        let status = 500;

        await knex(paymentTable)
            .where('uuid', paymentId)
            .then((response) => {
                payment = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Payment get error : ', error);
                Helpers.errorLogging('Payment get error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
            payment,
        });
    });
}

function paymentDelete(deleteId, user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let status = 500;

        await knex(paymentTable)
            .where('user_id', userId)
            .where('uuid', deleteId)
            .delete()
            .then((response) => {
                status = 200;
            })
            .catch((error) => {
                console.log('Payment delete error : ', error);
                Helpers.errorLogging('Payment delete error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
        });
    });
}

function updatePaymentInformation(inputs, paymentId) {
    return new Promise(async function (resolve, reject) {
        let status = 500;
        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');
        let paymentUpdate = {
            status: inputs.status,
            updated_at: currentDateTime,
        };
        await knex(paymentTable)
            .where('uuid', paymentId)
            .update(paymentUpdate)
            .then((response) => {
                status = 200;
            })
            .catch((error) => {
                console.log('Payment update error : ', error);
                Helpers.errorLogging('Payment update error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
        });
    });
}

module.exports = {
    createPayment,
    getPaymentCount,
    getAllPayments,
    getPayment,
    paymentDelete,
    updatePaymentInformation,
};
