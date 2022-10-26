const customerTable = 'customers';
const billingAddressTable = 'billing_address';
const moment = require('moment-timezone');
const Helpers = require('./Helpers');
let timeZone = process.env.TIME_ZONE;
const knex = require('../knex/knex.js');

function createCustomer(inputs, user) {
    return new Promise(async function (resolve, reject) {
        let email = inputs.data.accountDetails.email;
        let first_name = inputs.data.accountDetails.firstname;
        let last_name = inputs.data.accountDetails.lastname;
        let phone = inputs.data.accountDetails.phone;
        let street_1 = inputs.data.personalInfo.street1;
        let street_2 = inputs.data.personalInfo.street2;
        let city = inputs.data.personalInfo.city;
        let state = inputs.data.personalInfo.state;
        let zip = inputs.data.personalInfo.zip;
        let gender = inputs.data.personalInfo.gender;
        let country = inputs.data.personalInfo.country;
        let tax_id = inputs.data.personalInfo.tax_id;
        let company_name = inputs.data.personalInfo.company_name;
        let full_name = first_name + ' ' + last_name;
        let status = 500;
        let getUuid = '';
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

        resolve({
            status: status,
        });
    });
}

function getAllCustomers(user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let users = [];
        let status = 500;

        await knex(customerTable)
            .where('user_id', userId)
            .then((response) => {
                users = response;
                status = 200;
            })
            .catch((error) => {
                console.log('Customer get error : ', error);
                Helpers.errorLogging('Customer get error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
            users,
        });
    });
}

function getCustomerCount(user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let usersCount = 0;
        let allCustomers = [];
        let status = 500;

        await knex(customerTable)
            .where('user_id', userId)
            .then((response) => {
                usersCount = response.length;
                allCustomers = response;
                status = 200;
            })
            .catch((error) => {
                console.log('Customer get error : ', error);
                Helpers.errorLogging('Customer get error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
            usersCount,
            allCustomers,
        });
    });
}

function customerDelete(deleteId, user) {
    return new Promise(async function (resolve, reject) {
        let userId = user.id;
        let status = 500;

        await knex(customerTable)
            .where('user_id', userId)
            .where('uuid', deleteId)
            .delete()
            .then((response) => {
                status = 200;
            })
            .catch((error) => {
                console.log('Customer delete error : ', error);
                Helpers.errorLogging('Customer delete error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
        });
    });
}

function getCustomer(customerId) {
    return new Promise(async function (resolve, reject) {
        let user = {};
        let billingAddress = {};
        let status = 500;

        await knex(customerTable)
            .where('uuid', customerId)
            .then((response) => {
                user = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Customer get error : ', error);
                Helpers.errorLogging('Customer get error : ' + error);
                status = 500;
            });

        await knex(billingAddressTable)
            .where('customer_id', user.id)
            .then((response) => {
                billingAddress = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Customer billing address get error : ', error);
                Helpers.errorLogging(
                    'Customer billing address get error : ' + error
                );
                status = 500;
            });

        resolve({
            status: status,
            user,
            billingAddress,
        });
    });
}

function getCustomerById(customerId) {
    return new Promise(async function (resolve, reject) {
        let user = {};
        let billingAddress = {};
        let status = 500;

        await knex(customerTable)
            .where('id', customerId)
            .then((response) => {
                user = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Customer get error : ', error);
                Helpers.errorLogging('Customer get error : ' + error);
                status = 500;
            });

        await knex(billingAddressTable)
            .where('customer_id', user.id)
            .then((response) => {
                billingAddress = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Customer billing address get error : ', error);
                Helpers.errorLogging(
                    'Customer billing address get error : ' + error
                );
                status = 500;
            });

        resolve({
            status: status,
            user,
            billingAddress,
        });
    });
}

function updateCustomerInformation(inputs, customerId) {
    return new Promise(async function (resolve, reject) {
        let status = 500;
        let customerUpdate = {
            first_name: inputs.firstname,
            last_name: inputs.lastname,
            full_name: inputs.firstname + ' ' + inputs.lastname,
            gender: inputs.gender,
            email: inputs.email,
            street_2: inputs.street2,
            street_1: inputs.street1,
            city: inputs.city,
            state: inputs.state,
            zip: inputs.zip,
            tax_id: inputs.tax_id,
            phone: inputs.phone,
            country: inputs.country,
            company_name: inputs.company_name,
        };
        await knex(customerTable)
            .where('uuid', customerId)
            .update(customerUpdate)
            .then((response) => {
                status = 200;
            })
            .catch((error) => {
                console.log('Customer update error : ', error);
                Helpers.errorLogging('Customer update error : ' + error);
                status = 500;
            });

        resolve({
            status: status,
        });
    });
}

module.exports = {
    createCustomer,
    getAllCustomers,
    getCustomerCount,
    customerDelete,
    getCustomer,
    updateCustomerInformation,
    getCustomerById,
};
