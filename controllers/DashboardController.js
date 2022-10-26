require('dotenv').config();
const Customers = require('../models/Customers');
const Payments = require('../models/Payments');
const Helpers = require('../models/Helpers');

exports.dashboardCustomers = async function (req, res) {
    try {
        let user = req.user;
        let customers = [];

        await Customers.getCustomerCount(user)
            .then((response) => {
                customers = response.usersCount;
            })
            .catch((error) => {
                console.log('Customer get error : ' + error);
                Helpers.errorLogging('Customer get error : ' + error);
            });

        let data = {
            customers_gained: {
                series: [
                    {
                        name: 'Customers',
                        data: [0, 0],
                    },
                ],
                analyticsData: {
                    customers: customers,
                },
            },
        };

        return res.status(200).json(data);
    } catch (error) {
        console.log('Customer get error : ' + error);
        Helpers.errorLogging('Customer get error : ' + error);
    }
};

exports.dashboardPayments = async function (req, res) {
    try {
        let user = req.user;
        let payments = 0;

        await Payments.getPaymentCount(user)
            .then((response) => {
                payments = response.paymentCount;
            })
            .catch((error) => {
                console.log('Payments count error : ' + error);
                Helpers.errorLogging('Payment count error : ' + error);
            });

        let data = {
            total_payments: {
                series: [
                    {
                        name: 'Payments',
                        data: [0, 0],
                    },
                ],
                analyticsData: {
                    orders: payments,
                },
            },
        };

        return res.status(200).json(data);
    } catch (error) {
        console.log('Payments count error : ' + error);
        Helpers.errorLogging('Payment count error : ' + error);
    }
};
