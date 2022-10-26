require('dotenv').config();
const Customers = require('../models/Customers');
const Helpers = require('../models/Helpers');
const { paginateArray } = require('../utils');

exports.createCustomer = async function (req, res) {
    try {
        let status = 500;
        let inputs = req.body;
        let user = req.user;

        await Customers.createCustomer(inputs, user)
            .then((response) => {
                status = response.status;
            })
            .catch((error) => {
                console.log('Customer create error : ' + error);
                Helpers.errorLogging('Customer create error : ' + error);
            });

        return res.status(200).json(status);
    } catch (error) {
        console.log('Customer create error : ' + error);
        Helpers.errorLogging('Customer create error : ' + error);
    }
};

// GET ALL CUSTOMERS BY UUID
exports.getAllCustomers = async (req, res) => {
    try {
        let status = 500;
        let user = req.user;
        let users = [];
        await Customers.getAllCustomers(user)
            .then((response) => {
                status = response.status;
                users = response.users;
            })
            .catch((error) => {
                console.log('Customer get error : ' + error);
                Helpers.errorLogging('Customer get error : ' + error);
            });

        return res.status(200).json(users);
    } catch (error) {
        console.log('Customer get error : ' + error);
        Helpers.errorLogging('Customer get error : ' + error);
    }
};

exports.getCustomerData = async (req, res) => {
    try {
        let user = req.user;
        let users = [];
        let status = 500;

        const {
            q = '',
            page = 1,
            perPage = 10,
            sort = 'asc',
            sortColumn = 'full_name',
        } = req.body.config;

        const queryLowered = q.toLowerCase();

        await Customers.getAllCustomers(user)
            .then((response) => {
                status = response.status;
                users = response.users;
            })
            .catch((error) => {
                console.log('Customer get error : ' + error);
                Helpers.errorLogging('Customer get error : ' + error);
            });

        const dataAsc = users.sort((a, b) =>
            a[sortColumn] < b[sortColumn] ? -1 : 1
        );

        const dataToFilter = sort === 'asc' ? dataAsc : dataAsc.reverse();

        const filteredData = dataToFilter.filter(
            (user) =>
                user.email.toLowerCase().includes(queryLowered) ||
                user.full_name.toLowerCase().includes(queryLowered) ||
                user.city.toLowerCase().includes(queryLowered) ||
                user.country.toLowerCase().includes(queryLowered) ||
                user.phone.toLowerCase().includes(queryLowered)
        );

        return res.status(200).json({
            total: filteredData.length,
            users: paginateArray(filteredData, perPage, page),
        });
    } catch (error) {
        console.log('Customer get error : ' + error);
        Helpers.errorLogging('Customer get error : ' + error);
    }
};

exports.getCustomerCount = async (req, res) => {
    try {
        let status = 500;
        let user = req.user;
        let usersCount = 0;
        await Customers.getCustomerCount(user)
            .then((response) => {
                status = response.status;
                usersCount = response.usersCount;
            })
            .catch((error) => {
                console.log('Customer count error : ' + error);
                Helpers.errorLogging('Customer count error : ' + error);
            });

        return res.status(200).json(usersCount);
    } catch (error) {
        console.log('Customer count error : ' + error);
        Helpers.errorLogging('Customer count error : ' + error);
    }
};

exports.customerDelete = async (req, res) => {
    try {
        let status = 500;
        let user = req.user;
        let deleteId = req.body.id;
        let customerDetail = {};

        await Customers.getCustomer(deleteId)
            .then((data) => {
                customerDetail = data;
                status = 200;
            })
            .catch((error) => {
                status = 500;
                console.log('Customer get error : ' + error);
                Helpers.errorLogging('Customer get error : ' + error);
            });

        await Customers.customerDelete(deleteId, user)
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

exports.getCustomer = async (req, res) => {
    try {
        let status = 500;
        let customerId = req.body.id;
        let user = {};
        await Customers.getCustomer(customerId)
            .then((response) => {
                status = response.status;
                user = response.user;
                user.paymentMethod = response.paymentMethod;
                user.billingAddress = response.billingAddress;
            })
            .catch((error) => {
                console.log('Customer get error : ' + error);
                Helpers.errorLogging('Customer get error : ' + error);
            });

        return res.status(200).json(user);
    } catch (error) {
        console.log('Customer get error : ' + error);
        Helpers.errorLogging('Customer get error : ' + error);
    }
};

exports.updateCustomerInformation = async (req, res) => {
    try {
        let status = 500;
        let customerId = req.body.id;
        let inputs = req.body.data;

        await Customers.updateCustomerInformation(inputs, customerId)
            .then((response) => {
                status = response.status;
            })
            .catch((error) => {
                console.log('Customer update error : ' + error);
                Helpers.errorLogging('Customer update error : ' + error);
            });

        return res.status(200).json(status);
    } catch (error) {
        console.log('Customer update error : ' + error);
        Helpers.errorLogging('Customer update error : ' + error);
    }
};
