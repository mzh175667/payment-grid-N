const jwt = require('jsonwebtoken');
const Users = require('../models/Users');
const Helpers = require('../models/Helpers');

exports.register = async (req, res) => {
    try {
        const inputs = req.body;
        let user = {};
        let status = 500;
        let uuid = '';
        let error = {};
        let fullName = '';

        await Users.createUser(inputs)
            .then((response) => {
                status = response.status;
                uuid = response.uuid;
                fullName = response.fullName;
                isEmailAlreadyInUse = response.isEmailAlreadyInUse;
            })
            .catch((error) => console.log(error));

        const accessToken = jwt.sign({ id: user.uuid }, process.env.JWT_SECRET);

        res.cookie('t', accessToken, {
            expire: new Date() + 9999,
            httpOnly: false,
        });

        if (status == 500) {
            error = {
                email: isEmailAlreadyInUse
                    ? 'This email is already in use.'
                    : null,
            };

            return res.status(200).json({ error });
        } else if (status == 200) {
            user = {
                id: uuid,
                fullName: fullName,
                first_name: `${req.body.first_name}`,
                last_name: `${req.body.last_name}`,
                avatar: '',
                avatar_color: 1,
                email: `${req.body.email}`,
                role: 'admin',
                extras: {
                    eCommerceCartItemsCount: 5,
                },
                verifyUser: 0,
            };
        }
        const response = {
            user,
            accessToken,
        };
        return res.status(200).json(response);
    } catch (error) {
        console.log('Registeration error : ' + error);
        Helpers.errorLogging('Registeration error : ' + error);
    }
};

exports.login = async (req, res) => {
    try {
        const inputs = req.body;
        let status = 500;
        let uuid = '';
        let error = {};
        await Users.loginUser(inputs)
            .then((response) => {
                status = response.status;
                uuid = response.uuid;
                userData = response.user;
            })
            .catch((error) => {
                console.log('Error logging user : error ' + error);
                Helpers.errorLogging('Error logging user : error ' + err);
            });

        if (status == 500) {
            error = {
                email: ['Email or Password is Invalid'],
            };
            return res.status(200).json({ error });
        }

        // making password undefined
        userData.password = undefined;
        let user = {
            id: userData.uuid,
            fullName: userData.full_name,
            first_name: userData.first_name,
            last_name: userData.last_name,
            avatar: userData.avatar,
            email: userData.email,
            avatar_color: userData.avatar_color,
            userObject: userData,
            role: 'admin',
            extras: {
                eCommerceCartItemsCount: 5,
            },
            verifyUser: userData.verify_user,
        };
        if (userData.verify_user == 1) {
            user.ability = [
                {
                    action: 'manage',
                    subject: 'all',
                },
            ];
        }

        const accessToken = jwt.sign(
            { id: userData.uuid },
            process.env.JWT_SECRET
        );

        res.cookie('t', accessToken, { expire: new Date() + 9999 });

        const response = {
            userData: user,
            accessToken: accessToken,
            refreshToken: accessToken,
        };

        return res.status(200).json(response);
    } catch (error) {
        console.log('Login error : ' + error);
        Helpers.errorLogging('Login error : ' + error);
    }
};

exports.logout = (req, res) => {
    try {
        res.clearCookie('t');
        return res.json({
            message: 'Signout success',
        });
    } catch (error) {
        console.log('Logout error : ' + error);
        Helpers.errorLogging('Logout error : ' + error);
    }
};

exports.verifyToken = async (req, res) => {
    try {
        let authcookie = req.headers.authorization;
        let userData = [];
        const bearerToken = authcookie.split(' ')[1];
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
                    const id = data.id;
                    await Users.getUserDataByUUID(id)
                        .then((response) => {
                            userData = response[0];
                        })
                        .catch((error) => {
                            console.log(
                                'Failed to get user data error : ',
                                error
                            );
                            Helpers.errorLogging(
                                'Failed to get user data : error ' + error
                            );
                        });

                    // making password undefined
                    userData.password = undefined;

                    let user = {
                        id: userData.uuid,
                        fullName: userData.full_name,
                        first_name: userData.first_name,
                        last_name: userData.last_name,
                        avatar: userData.avatar,
                        avatar_color: userData.avatar_color,
                        userObject: userData,
                        email: userData.email,
                        role: 'admin',
                        ability: [
                            {
                                action: 'manage',
                                subject: 'all',
                            },
                        ],
                        extras: {
                            eCommerceCartItemsCount: 5,
                        },
                        verifyUser: userData.verify_user,
                    };

                    const accessToken = jwt.sign(
                        { id: userData.uuid },
                        process.env.JWT_SECRET
                    );
                    const refreshToken = jwt.sign(
                        { id: userData.uuid },
                        process.env.JWT_SECRET
                    );

                    res.cookie('t', accessToken, { expire: new Date() + 9999 });

                    const response = {
                        userData: user,
                        accessToken: JSON.stringify(accessToken),
                        refreshToken: JSON.stringify(refreshToken),
                    };

                    return res.status(200).json(response);
                }
            }
        );
    } catch (error) {
        console.log('Failed to get user data : error ', error);
        Helpers.errorLogging('Failed to get user data : error ' + error);
    }
};

exports.isLoggedIn = (req, res, next) => {
    try {
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
                        .catch((error) => {
                            console.log(
                                'Error getting user record error : ' + error
                            );
                            Helpers.errorLogging(
                                'Error getting user record : error ' + error
                            );
                        });
                    req.user = user;
                    return next();
                }
            }
        );
    } catch (error) {
        console.log('Error getting user record isLoggedIn : error ' + error);
        Helpers.errorLogging(
            'Error getting user record  isLoggedIn : error ' + error
        );
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        let status = 500;
        let inputs = req.body;
        let userData = {};
        await Users.verifyEmail(inputs)
            .then((response) => {
                status = response.status;
                userData = response.updatedData;
            })
            .catch((error) => {
                console.log('Verify Email : error ' + error);
                Helpers.errorLogging('Verify Email : error ' + error);
            });

        const accessToken = jwt.sign(
            { id: userData.uuid },
            process.env.JWT_SECRET
        );

        let data = {
            status,
            accessToken,
            userData,
        };
        return res.status(200).json(data);
    } catch (error) {
        console.log('Verify Email : error ' + error);
        Helpers.errorLogging('Verify Email : error ' + error);
    }
};

exports.newVerificationCode = async (req, res) => {
    try {
        let status = 500;
        let inputs = req.body;
        await Users.newVerificationCode(inputs)
            .then((response) => {
                status = response.status;
            })
            .catch((error) => {
                console.log('Verification code : error ', error);
                Helpers.errorLogging('Verification code : error ' + error);
            });

        return res.status(200).json(status);
    } catch (error) {
        console.log('Verification code : error ', error);
        Helpers.errorLogging('Verification code : error ' + error);
    }
};

exports.resetLink = async (req, res) => {
    try {
        let status = 500;
        let inputs = req.body;
        await Users.resetLink(inputs)
            .then((response) => {
                status = response.status;
            })
            .catch((error) => {
                console.log('Reset link : error ', error);
                Helpers.errorLogging('Reset link : error ' + error);
            });
        return res.status(200).json(status);
    } catch (error) {
        console.log('Reset link : error ', error);
        Helpers.errorLogging('Reset link : error ' + error);
    }
};

exports.resetPassword = async (req, res) => {
    try {
        let status = 500;
        let inputs = req.body;
        await Users.resetPassword(inputs)
            .then((response) => {
                status = response.status;
            })
            .catch((error) => {
                console.log('Reset password : error ', error);
                Helpers.errorLogging('Reset password  : error ' + error);
            });
        return res.status(200).json(status);
    } catch (error) {
        console.log('Reset password : error ', error);
        Helpers.errorLogging('Reset password : error ' + error);
    }
};
