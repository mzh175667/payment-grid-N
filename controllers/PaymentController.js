require('dotenv').config();
const Payments = require('../models/Payments');
const Helpers = require('../models/Helpers');
const { paginateArray } = require('../utils');

exports.getAllPayments = async (req, res) => {
    try {
        let status = 500;
        let user = req.user;
        let payments = [];
        await Payments.getAllPayments(user)
            .then((response) => {
                status = response.status;
                payments = response.payments;
            })
            .catch((error) => {
                console.log('Customer get error : ' + error);
                Helpers.errorLogging('Customer get error : ' + error);
            });

        return res.status(200).json(payments);
    } catch (error) {
        console.log('Customer get error : ' + error);
        Helpers.errorLogging('Customer get error : ' + error);
    }
};

exports.getPaymentsData = async (req, res) => {
    try {
        let user = req.user;
        let payments = [];
        let status = 500;

        const {
            q = '',
            page = 1,
            perPage = 10,
            sort = 'asc',
            sortColumn = 'merchant',
        } = req.body.config;

        const queryLowered = q.toLowerCase();

        await Payments.getAllPayments(user)
            .then((response) => {
                status = response.status;
                payments = response.payments;
            })
            .catch((error) => {
                console.log('Payments get error : ' + error);
                Helpers.errorLogging('Payments get error : ' + error);
            });

        const dataAsc = payments.sort((a, b) =>
            a[sortColumn] < b[sortColumn] ? -1 : 1
        );

        const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse();

        const filteredData = dataToFilter.filter(
            (payment) =>
                payment.amount.toLowerCase().includes(queryLowered) ||
                payment.merchant.toLowerCase().includes(queryLowered) ||
                payment.currency.toLowerCase().includes(queryLowered) ||
                payment.description.toLowerCase().includes(queryLowered) ||
                payment.status.toLowerCase().includes(queryLowered)
        );

        return res.status(200).json({
            total: filteredData.length,
            users: paginateArray(filteredData, perPage, page),
        });
    } catch (error) {
        console.log('Payments get error : ' + error);
        Helpers.errorLogging('Payments get error : ' + error);
    }
};

exports.getPaymentCount = async (req, res) => {
    try {
        let status = 500;
        let user = req.user;
        let paymentCount = 0;
        await Payments.getPaymentCount(user)
            .then((response) => {
                status = response.status;
                paymentCount = response.paymentCount;
            })
            .catch((error) => {
                console.log('Payments count error : ' + error);
                Helpers.errorLogging('Payments count error : ' + error);
            });

        return res.status(200).json(paymentCount);
    } catch (error) {
        console.log('Payments count error : ' + error);
        Helpers.errorLogging('Payments count error : ' + error);
    }
};

exports.getPayment = async (req, res) => {
    try {
        let status = 500;
        let paymentId = req.body.id;
        let payment = {};
        await Payments.getPayment(paymentId)
            .then((response) => {
                status = response.status;
                payment = response.payment;
            })
            .catch((error) => {
                console.log('Payment get error : ' + error);
                Helpers.errorLogging('Payment get error : ' + error);
            });

        return res.status(200).json(payment);
    } catch (error) {
        console.log('Payment get error : ' + error);
        Helpers.errorLogging('Payment get error : ' + error);
    }
};

exports.paymentDelete = async (req, res) => {
    try {
        let status = 500;
        let user = req.user;
        let deleteId = req.body.id;

        await Payments.paymentDelete(deleteId, user)
            .then((response) => {
                status = response.status;
            })
            .catch((error) => {
                console.log('Customer delete error : ' + error);
                Helpers.errorLogging('Customer delete error : ' + error);
            });

        return res.status(200).json(status);
    } catch (error) {
        console.log('Customer delete error : ' + error);
        Helpers.errorLogging('Customer delete error : ' + error);
    }
};

exports.updatePaymentInformation = async (req, res) => {
    try {
        let status = 500;
        let paymentId = req.body.id;
        let inputs = req.body.data;

        await Payments.updatePaymentInformation(inputs, paymentId)
            .then((response) => {
                status = response.status;
            })
            .catch((error) => {
                console.log('Payment update error : ' + error);
                Helpers.errorLogging('Payment update error : ' + error);
            });

        return res.status(200).json(status);
    } catch (error) {
        console.log('Payment update error : ' + error);
        Helpers.errorLogging('Payment update error : ' + error);
    }
};
