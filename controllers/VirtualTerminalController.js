require('dotenv').config();
const Configs = require('../config/config');
const Stripe = require('stripe')(Configs.StripeSecretKey);
const Helpers = require('../models/Helpers');
const Payments = require('../models/Payments');
const Terminals = require('../models/Terminals');

exports.stripeCharge = async function (req, res) {
    try {
        let { amount, id } = req.body;
        let inputs = req.body;
        let user = req.user;
        let status = 500;
        let paymentMerchant = 'stripe';
        let stripeResponse = '';
        await Stripe.paymentIntents
            .create({
                amount: amount * 100,
                currency: 'USD',
                description: 'Your Company Description',
                payment_method: id,
                confirm: true,
            })
            .then((response) => {
                stripeResponse = response;
            })
            .catch((error) => {
                console.log(
                    'Stripe virtual terminal stripe charge error ',
                    error
                );
                Helpers.errorLogging(
                    'Stripe virtual terminal stripe charge error : ' + error
                );
            });

        await Payments.createPayment(
            inputs,
            stripeResponse,
            paymentMerchant,
            user
        )
            .then((data) => {
                status = data.status;
            })
            .catch((error) => {
                console.log('Payment Create error : ', error);
                Helpers.errorLogging('Payment Create error :  ' + error);
            });

        return res.json({
            status,
            message: 'Payment Successful',
            success: true,
        });
    } catch (error) {
        console.log('Stripe virtual terminal stripe charge error ', error);
        Helpers.errorLogging(
            'Stripe virtual terminal stripe charge error : ' + error
        );
        return res.json({
            message: 'Payment Failed',
            success: false,
        });
    }
};

exports.invoiceCharge = async (req, res) => {
    try {
        let inputs = req.body;
        let paymentMerchant = 'invoice';
        let user = req.user;
        let status = 500;
        let paymentDetails = {
            description: 'Your company description',
            status: 'succeeded',
            currency: 'usd',
            payment_id: '',
            object: '',
            application: '',
            application_fee_amount: '',
            payment_method: '',
        };

        await Payments.createPayment(
            inputs,
            paymentDetails,
            paymentMerchant,
            user
        )
            .then((data) => {
                status = data.status;
            })
            .catch((error) => {
                console.log('Payment Create error : ', error);
                Helpers.errorLogging('Payment Create error:  ' + error);
            });

        return res.json({
            message: 'Payment Successfull',
            success: true,
            status,
        });
    } catch (error) {
        console.log('Payment Create error : ', error);
        Helpers.errorLogging('Payment Create error:  ' + error);
    }
};

exports.setupTerminal = async (req, res) => {
    try {
        let inputs = req.body;
        let user = req.user;
        let status = 500;

        await Terminals.setupTerminal(inputs, user)
            .then((data) => {
                status = data.status;
            })
            .catch((error) => {
                console.log('Setup Terminal error : ', error);
                Helpers.errorLogging('Setup Terminal error :  ' + error);
            });

        return res.json(status);
    } catch (error) {
        console.log('Setup Terminal error : ', error);
        Helpers.errorLogging('Setup Terminal error :  ' + error);
    }
};

exports.getSetupTerminal = async (req, res) => {
    try {
        let user = req.user;
        let status = 500;
        let setup = {};

        await Terminals.getSetupTerminal(user)
            .then((data) => {
                status = data.status;
                setup = data.setup;
            })
            .catch((error) => {
                console.log('Setup Terminal get error : ', error);
                Helpers.errorLogging('Setup Terminal get error :  ' + error);
            });

        return res.json({ setup, status });
    } catch (error) {
        console.log('Setup Terminal get error : ', error);
        Helpers.errorLogging('Setup Terminal get error :  ' + error);
    }
};
