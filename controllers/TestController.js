require('dotenv').config();
const express = require('express');
const router = express.Router();
const Configs = require('../config/config');
const Stripe = require('stripe')(Configs.StripeSecretKey);
const moment = require('moment-timezone');
const TIME_ZONE = process.env.TIME_ZONE;
const UsHolidays = require('../helpers/UsHolidays');
const fs = require('fs');

const vendorAccountId = 'acct_1KdTJmPlqw3xT3oQ'; // MIchael Duglas
const customerId = 'cus_LK5naqImwAmmNI'; // test@user.com

router.createStripeCustomer = async function (req, res) {
    let status = 500;
    let message = '';
    let tokenId = '';

    await Stripe.tokens
        .create({
            card: {
                name: 'Test',
                number: '4242424242424242',
                exp_month: '12',
                exp_year: '2023',
                cvc: '123',
                address_line1: '301 South Hills Village',
                address_line2: 'Ste FC14',
                address_city: 'Parksburg',
                address_state: 'Pennsylvania',
                address_country: 'United States',
                address_zip: '15241',
            },
        })
        .then((response) => {
            status = 200;
            tokenId = response.id;
            console.log(response);
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
            console.log('create Payment Grid Payment token error : ', error);
        });

    if (status == 200) {
        let customerEmail = 'test@user.com';
        let stripeCustomerId = '';
        await Stripe.customers
            .create({
                email: customerEmail,
                name: 'Test User',
                phone: '123456789',
                address: {
                    city: 'hello',
                    line1: '301 South Hills Village',
                    line2: 'Ste FC14',
                    state: 'Pennsylvania',
                    country: 'United States',
                    postal_code: '15241',
                },
                description: 'Test customer email : ' + customerEmail,
                source: tokenId,
            })
            .then((response) => {
                status = 200;
                message = 'Success';
                stripeCustomerId = response.id;
            })
            .catch((error) => {
                status = 500;
                message = error.raw.message;
                console.log(
                    'create customer in Payment Grid Payment error : ',
                    error
                );
            });

        res.json({
            status: status,
            message: message,
            stripeCustomerId: stripeCustomerId,
        });
    } else {
        res.json({ status: status, message: message });
    }
};

router.stripeCharge = async function (req, res) {
    let status = 500;
    let message = '';

    let chargeId = '';
    await Stripe.charges
        .create({
            amount: 3000,
            currency: 'usd',
            customer: customerId,
            description: 'Testing Destination Charge For Connect Account',
            on_behalf_of: vendorAccountId,
            application_fee_amount: 1000,
            transfer_data: {
                destination: vendorAccountId,
            },
            capture: false,
        })
        .then((response) => {
            status = 200;
            message = 'Success';
            chargeId = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
            console.log('create Payment Grid Payment charge error : ', error);
        });

    if (status == 200) {
        res.json({ status: status, message: message, charge: chargeId });
    } else {
        res.json({ status: status, message: message });
    }
};

router.stripeChargeCapture = async function (req, res) {
    let status = 500;
    let message = '';
    let captureResponse = '';

    let chargeId = 'ch_3Kd4oIBXL7x68C9p0N24DFCH';
    await Stripe.charges
        .capture(chargeId, {
            amount: 100,
        })
        .then((response) => {
            status = 200;
            message = 'Success';
            captureResponse = response;
        })
        .catch((error) => {
            status = 500;
            console.log(error);
            /*message = error.raw.message;*/
        });

    res.json({ status: status, message: message, response: captureResponse });
};

router.stripeChargeRefund = async function (req, res) {
    let status = 500;
    let message = '';
    let refundResponse = '';

    let chargeId = 'ch_3Kd4oIBXL7x68C9p0N24DFCH';
    // amount = 150; optional
    // reason: 'requested_by_customer', 'duplicate', 'fraudulent',

    await Stripe.refunds
        .create({
            charge: chargeId,
            // amount: 500,
            reason: 'requested_by_customer',
        })
        .then((response) => {
            status = 200;
            message = 'Success';
            refundResponse = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, response: refundResponse });
};

router.stripeChargeRetrieve = async function (req, res) {
    let status = 500;
    let message = '';
    let chargeResponse = '';

    let chargeId = 'ch_3Kd4oIBXL7x68C9p0N24DFCH';
    await Stripe.charges
        .retrieve(chargeId)
        .then((response) => {
            status = 200;
            message = 'Success';
            chargeResponse = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, response: chargeResponse });
};

router.createStripeWebHook = async function (req, res) {
    let status = 500;
    let message = '';
    let webhookResponse = '';

    await Stripe.webhookEndpoints
        .create({
            url: Configs.BASE_URL + '/test/stripe-webhook/endpoint',
            enabled_events: ['charge.expired'],
        })
        .then((response) => {
            status = 200;
            message = 'Success';
            webhookResponse = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, response: webhookResponse });
};

router.stripeWebHookEndpoint = async function (req, res) {
    let data = req.body;
    let eventResponse = data.read ? data.read : '';
    let table = 'webhook';

    let currentDateTime = moment().tz(TIME_ZONE).format('YYYY-MM-DD HH:mm:ss');

    let insertData = {
        webhook_type: 1,
        webhook_response: data,
        ship_created_date: currentDateTime,
    };

    await knex(table)
        .insert(insertData)
        .then((response) => {})
        .catch((error) => {
            console.log('main stripe webhook insert error : ', error);
        });

    let insertObj = {
        webhook_type: 1,
        webhook_response: eventResponse,
        ship_created_date: currentDateTime,
    };

    await knex(table)
        .insert(insertObj)
        .then((response) => {})
        .catch((error) => {
            console.log('main stripe webhook read insert error : ', error);
        });
};

router.stripeChargeIntent = async function (req, res) {
    let status = 500;
    let message = '';

    //let customerId = 'card_1F6xLNEGtEycp48ZYBXJDzAo';

    let chargeResponse = '';
    await Stripe.paymentIntents
        .create({
            amount: 500,
            currency: 'usd',
            payment_method_types: ['card'],
            source: 'card_1F6xLNEGtEycp48ZYBXJDzAo',
            customer: customerId,
            description: 'Test Order with payment intent',
            on_behalf_of: vendorAccountId,
            //application_fee_amount: 50,
            transfer_data: {
                destination: vendorAccountId,
            },
            save_payment_method: true,
            capture_method: 'manual',
        })
        .then((response) => {
            status = 200;
            message = 'Success';
            chargeResponse = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
            console.log(
                'create Payment Grid Payment intent charge error : ',
                error
            );
        });

    res.json({ status: status, message: message, response: chargeResponse });
};

router.stripeChargeIntentConfirm = async function (req, res) {
    let status = 500;
    let message = '';
    let confirmResponse = '';

    let paymentId = 'pi_1FA9BcEGtEycp48ZZuk6dluh';
    await Stripe.paymentIntents
        .confirm(paymentId, { payment_method: 'pm_card_visa' })
        .then((response) => {
            status = 200;
            message = 'Success';
            confirmResponse = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, response: confirmResponse });
};

router.stripeChargeIntentCapture = async function (req, res) {
    let status = 500;
    let message = '';
    let captureResponse = '';

    let paymentId = 'pi_1FA9BcEGtEycp48ZZuk6dluh';
    await Stripe.paymentIntents
        .capture(paymentId, {
            //amount_to_capture: 500
        })
        .then((response) => {
            status = 200;
            message = 'Success';
            captureResponse = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, response: captureResponse });
};

router.stripeChargeIntentCancel = async function (req, res) {
    let status = 500;
    let message = '';
    let cancelResponse = '';

    let paymentId = 'pi_1F6zJ7EGtEycp48ZB5t6PJIp';
    await Stripe.paymentIntents
        .cancel(paymentId, { cancellation_reason: 'requested_by_customer' })
        .then((response) => {
            status = 200;
            message = 'Success';
            cancelResponse = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, response: cancelResponse });
};

router.stripeChargeIntentUpdate = async function (req, res) {
    let status = 500;
    let message = '';
    let cancelResponse = '';

    let paymentId = 'pi_1F6yDqEGtEycp48ZSurG2zFV';
    await Stripe.paymentIntents
        .update(paymentId, {
            amount: 600,
            metadata: { order_id: '6735' },
        })
        .then((response) => {
            status = 200;
            message = 'Success';
            cancelResponse = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, response: cancelResponse });
};

router.stripeUpdateCapabilities = async function (req, res) {
    await Stripe.accounts.createLoginLink(
        'acct_1F1oEnLDoknTT3fe',
        function (err, link) {
            res.json({ err: err, link: link });
        }
    );
    /*await Stripe.accounts.update(
        'acct_1F1plvBYdLIrwZwb',
        {
            individual:{
                ssn_last_4:'0000'
            },
        },
        function(err, person) {
            res.json({err:err,person:person});
        }
    );*/
};

router.usHolidayList = async function (req, res) {
    let dateList = [];
    await UsHolidays.holidayDateList(2020).then((response) => {
        dateList = response;
    });
    res.json({ dateList: dateList });
};

router.stripeAchBank = async function (req, res) {
    let status = 500;
    let message = '';
    let customerStripeId = 'cus_FWvICVI0RcRBf6';
    let responseJson = {};
    let bankId = '';
    let sourceId = '';
    let level = 'token';

    await Stripe.tokens
        .create({
            bank_account: {
                country: 'US',
                currency: 'usd',
                account_holder_name: 'Jenny Rosen',
                account_holder_type: 'individual',
                routing_number: '110000000',
                account_number: '000123456789',
            },
        })
        .then((response) => {
            status = 200;
            bankId = response.id;
            responseJson = response;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
            responseJson = error;
        });

    if (status == 200) {
        level = 'create source';
        await Stripe.customers
            .createSource(customerStripeId, {
                source: bankId,
            })
            .then((response) => {
                sourceId = response.id;
                status = 200;
                responseJson = response;
            })
            .catch((error) => {
                status = 500;
                message = error.raw.message;
                responseJson = error;
            });
    }

    if (status == 200) {
        level = 'Bank Verify';
        await Stripe.customers
            .verifySource(customerStripeId, sourceId, {
                amounts: [32, 45],
            })
            .then((response) => {
                status = 200;
                sourceId = response.id;
                responseJson = response;
            })
            .catch((error) => {
                message = error.raw.message;
                status = 500;
                responseJson = error;
            });
    }

    if (status == 200) {
        level = 'Payment Intents';
        let paymentIntentObj = {
            amount: 100,
            currency: 'usd',
            description: 'Testing with bank',
            capture_method: 'manual',
            payment_method_types: ['ach_debit'],
            source: sourceId,
            customer: customerStripeId,
        };
        await Stripe.paymentIntents
            .create(paymentIntentObj)
            .then((response) => {
                status = 200;
                responseJson = response;
            })
            .catch((error) => {
                message = error.raw.message;
                status = 500;
                responseJson = error;
            });
    }

    res.json({
        status: status,
        level: level,
        message: message,
        response: responseJson,
    });
};
router.chargewithfee = async function (req, res) {
    await Stripe.charges
        .create({
            amount: 1000,
            currency: 'usd',
            source: 'tok_bypassPending',
            on_behalf_of: 'acct_1FFgxPBCxFH25aPA',
            application_fee_amount: 123,
            description: 'Charging a payment of SLOT 2',
            transfer_data: {
                destination: 'acct_1FFgxPBCxFH25aPA',
            },
        })
        .then((charge) => {
            console.log(charge);
            res.json({ charge: charge });
        })
        .catch((err) => {
            console.log(err);
            res.json({ err: err });
        });
};
router.createCustomAccount = async function (req, res) {
    let status = 500;
    let message = '';
    let tokenId = '';
    let accountToken = '';
    let logfilePath = './logs/custom-damien.txt';
    await Stripe.tokens
        .create({
            card: {
                name: 'Test',
                number: '4242424242424242',
                exp_month: '12',
                exp_year: '2023',
                cvc: '123',
                address_line1: '301 South Hills Village',
                address_line2: 'Ste FC14',
                address_city: 'Parksburg',
                address_state: 'Pennsylvania',
                address_country: 'United States',
                address_zip: '15241',
            },
        })
        .then((response) => {
            status = 200;
            tokenId = response.id;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
            console.log('create Payment Grid Payment token error : ', error);
        });

    await Stripe.tokens
        .create({
            account: {
                individual: {
                    first_name: 'Damien',
                    last_name: 'Johns',
                },
                tos_shown_and_accepted: true,
            },
        })
        .then((response) => {
            status = 200;
            accountToken = response.id;
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
            console.log('create custom account error : ', error);
        });

    if (status == 200) {
        let accountData = [];
        await Stripe.accounts
            .create({
                type: 'custom',
                country: 'US',
                email: 'damien@mailinator.com',
                requested_capabilities: ['card_payments', 'transfers'],
                business_profile: {
                    mcc: '5533',
                    name: 'Damien Store 2',
                    product_description: 'We Sell Car Part On our platform',
                    support_email: 'damien@mailinator.com',
                    support_phone: '1236548790',
                },
                business_type: 'company',
                // business_type: 'company',
                company: {
                    name: 'Damien Store',
                    phone: '1236548790',
                    tax_id: '741258963546',
                    address: {
                        city: 'Columbus',
                        country: 'US',
                        line1: '1505 Bethel Road',
                        line2: 'Suite 102',
                        postal_code: '43220',
                        state: 'OH',
                    },
                },
                external_account: {
                    object: 'bank_account',
                    // account: 'acct_1IZho8BXL7x68C9p',
                    account_number: '000123456789',
                    // account_holder_name: null,
                    // account_holder_type: null,
                    // account_type: null,
                    available_payout_methods: ['standard'],
                    bank_name: 'FIFTH THIRD BANK',
                    country: 'US',
                    currency: 'usd',
                    default_for_currency: true,
                    // fingerprint: 'p6LCLWQzrUuqKGt7',
                    // last4: '0399',
                    // metadata: {},
                    routing_number: '044002161',
                    // status: 'new',
                },
                tos_acceptance: {
                    date: Math.floor(Date.now() / 1000),
                    ip: req.connection.remoteAddress, // Assumes you're not using a proxy
                },
                // account_token: tokenId,
            })
            .then((response) => {
                status = 200;
                message = 'Success';
                accountData = response;
                fs.appendFile(logfilePath, response + ' \n\n ', function (err) {
                    if (err) throw err;
                });
            })
            .catch((error) => {
                status = 500;
                message = error;
                console.log('create custom account error : ', error);
            });

        res.json({
            status: status,
            message: message,
            accountData: accountData,
        });
    } else {
        res.json({ status: status, message: message });
    }
};

router.fetchAccount = async function (req, res) {
    let accountData = [];
    let errorMsg = '';
    let status = 200;
    await Stripe.accounts
        .retrieve('acct_1KdTJmPlqw3xT3oQ')
        .then((response) => {
            status = 200;
            accountData = response;
        })
        .catch((error) => {
            status = 500;
            errorMsg = error;
            console.log('create custom account error : ', error);
        });
    res.json({ accountData: accountData, errorMsg: errorMsg });
};

router.createPlan = async function (req, res) {
    let status = 500;
    let message = 'Ooops...Something went wrong. Please try again.';
    let planId = '';

    let planName = 'daily';
    let planPrice = '5';
    let interval = 'day';
    let intervalCount = 3;

    await Stripe.plans
        .create({
            amount: parseFloat(planPrice) * 100,
            currency: 'usd',
            interval: interval,
            interval_count: intervalCount,
            product: { name: planName },
            nickname: planName,
        })
        .then((response) => {
            status = 200;
            planId = response.id;
            message = 'success';
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, plan_id: planId });
};

router.customerSubscription = async function (req, res) {
    let status = 500;
    let message = 'Ooops...Something went wrong. Please try again.';

    let customerId = 'cus_LK5naqImwAmmNI';
    let planId = 'plan_LK7hREqrpsrIPi';
    let id = '';

    var tierStartDate = moment().unix();
    var currentDate = moment().format('YYYY-MM-DD');
    var tierEndDate = moment(currentDate).add(2, 'days').unix();
    var startDate = moment(currentDate).add(3, 'days').unix();

    await Stripe.subscriptions
        .create({
            customer: customerId,
            items: [{ plan: planId }],
        })
        .then((response) => {
            status = 200;
            id = response.id;
            message = 'success';
            console.log(response);
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, id: id });
};

router.invoiceItemsRetrieve = async function (req, res) {
    let status = 500;
    let message = 'Ooops...Something went wrong. Please try again.';

    let invoiceId = 'in_1KdTT2BXL7x68C9pZGC8VAvI';

    let invoiceData = {};
    await Stripe.invoiceItems
        .retrieve(invoiceId)
        .then((response) => {
            status = 200;
            invoiceData = response;
            message = 'success';
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, data: invoiceData });
};

router.subscriptionsRetrieve = async function (req, res) {
    let status = 500;
    let message = 'Ooops...Something went wrong. Please try again.';

    let subscriptionId = 'sub_1KdTT2BXL7x68C9pWbvWoamX';

    let data = {};
    await Stripe.subscriptions
        .retrieve(subscriptionId)
        .then((response) => {
            status = 200;
            data = response;
            message = 'success';
        })
        .catch((error) => {
            status = 500;
            message = error.raw.message;
        });

    res.json({ status: status, message: message, data: data });
};
router.standardAccount = async function (req, res) {
    let acCreate = [];
    let acLink = [];
    let status = 500;
    await Stripe.accounts
        .create({
            type: 'standard',
            email: 'waleed123@mailinator.com',
        })
        .then((response) => {
            status = 200;
            acCreate = response;
        })
        .catch((error) => {
            status = 500;
            console.log('Error creating a standard account');
        });
    if (status == 200) {
        await Stripe.accountLinks
            .create({
                account: acCreate.id,
                refresh_url: 'http://localhost:4002/test/standardAccountRes1',
                return_url: 'http://localhost:4002/test/standardAccountRes2',
                type: 'account_onboarding',
            })
            .then((response) => {
                status = 200;
                acLink = response;
            })
            .catch((error) => {
                status = 500;
                console.log('Error creating a standard account Link');
            });
    } else {
        console.log('Error something went wrong');
    }
    res.json({ account: acCreate, accountLink: acLink });
};
router.standardAccountRes1 = async function (req, res) {
    console.log('standardAccountRes1');
    console.log('GET ', req.params);
    console.log('POST ', req.body);
    res.json({ standardAccountRes1: 'standardAccountRes1' });
};
router.standardAccountRes2 = async function (req, res) {
    console.log('standardAccountRes2');
    console.log('GET ', req.params);
    console.log('POST ', req.body);
    res.json({ standardAccountRes1: 'standardAccountRes2' });
};

module.exports = router;
