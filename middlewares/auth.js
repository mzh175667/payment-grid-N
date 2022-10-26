const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const Users = require('../models/Users');
const Helpers = require('../models/Helpers');

exports.isLoggedIn = (req, res, next) => {
    let authcookie = req.headers.authorization;
    const bearerToken = authcookie.split(' ')[1];
    let user = [];
    jwt.verify(
        bearerToken.replace(/\"/g, ''),
        process.env.JWT_SECRET,
        async (err, data) => {
            if (err) {
                let error = 'Invalid refresh token';
                return res.status(401).json({
                    error,
                });
            } else {
                await Users.getUserDataByUUID(data.id)
                    .then((response) => {
                        user = response[0];
                    })
                    .catch((err) => {
                        console.log('Error getting user record');
                        Helpers.errorLogging(
                            'Error getting user record : error ' + err
                        );
                    });
                req.user = user;
                return next();
            }
        }
    );
};

exports.parseToken = (req, res, next) => {
    let authcookie = req.headers.authorization;
    let bearerToken = authcookie.replace(/\"/g, '');
    req.headers.authorization = bearerToken;
    next();
};

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['HS256'],
    userProperty: 'auth',
});
