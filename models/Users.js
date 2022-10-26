const userTable = 'users';
const registerationCodeTable = 'registeration_codes';
const invoiceNumberTrackTable = 'invoice_number_track';
const resetTokenTable = 'reset_token';
const moment = require('moment-timezone');
const Helpers = require('./Helpers');
let timeZone = process.env.TIME_ZONE;
const knex = require('../knex/knex.js');
const EmailNotification = require('../helpers/EmailNotification');

function checkEmail(email) {
    return new Promise(async function (resolve, reject) {
        await knex(userTable)
            .where('email', email)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function getUserData(id) {
    return new Promise(function (resolve, reject) {
        knex(userTable)
            .where('id', id)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
}
function getUserDataByUUID(uuid) {
    return new Promise(function (resolve, reject) {
        knex(userTable)
            .where('uuid', uuid)
            .then((response) => {
                resolve(response);
            })
            .catch((error) => {
                reject(error);
            });
    });
}

function createUser(inputs) {
    return new Promise(async function (resolve, reject) {
        let email = inputs.email;
        let first_name = inputs.first_name;
        let last_name = inputs.last_name;
        let full_name = inputs.first_name + ' ' + inputs.last_name;
        let password = inputs.password;
        let country = inputs.country;
        let street1 = inputs.street1;
        let street2 = inputs.street2;
        let city = inputs.city;
        let state = inputs.state;
        let zip = inputs.zip;
        let phone = inputs.phone;
        let gender = inputs.gender;
        let company_name = inputs.company_name;

        let status = 500;
        let code = '';
        let hashPassword = '';
        let emailFound = 0;
        let getUuid = '';

        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        await Helpers.getUuid().then((response) => {
            getUuid = response;
        });

        await Helpers.encryptPassword(password).then((response) => {
            hashPassword = response;
        });

        code = Helpers.getRandomNumber(6);

        // Random avatar color
        const avatarColor = Math.floor(Math.random() * 6);

        await checkEmail(email).then((response) => {
            if (response.length > 0) {
                emailFound = 1;
                resolve({
                    status: 500,
                    email: email,
                    isEmailAlreadyInUse: true,
                    fullName: full_name,
                    uuid: getUuid,
                });
            }
        });

        let userInsert = {
            first_name,
            last_name,
            full_name,
            password,
            email,
            country,
            gender,
            city,
            state,
            zip,
            company_name,
            street_1: street1,
            street_2: street2,
            phone,
            created_at: currentDateTime,
            password: hashPassword,
            role_id: 0,
            avatar: '',
            uuid: getUuid,
            verify_user: 0,
            avatar_color: avatarColor,
        };

        let user_id = '';
        if (emailFound == 0) {
            await knex(userTable)
                .insert(userInsert)
                .then((response) => {
                    user_id = response[0];
                    status = 200;
                })
                .catch((error) => {
                    console.log('User create error : ', error);
                    status = 500;
                });

            let codeInsert = {
                user_id,
                code,
                created_at: currentDateTime,
            };

            await knex(registerationCodeTable)
                .insert(codeInsert)
                .then((response) => {
                    status = 200;
                })
                .catch((error) => {
                    console.log('Code insert error : ', error);
                    status = 500;
                });

            let invoiceInsert = {
                user_id,
                count: 0,
                created_at: currentDateTime,
            };

            await knex(invoiceNumberTrackTable)
                .insert(invoiceInsert)
                .then((response) => {
                    status = 200;
                })
                .catch((error) => {
                    console.log('Invoice  number insert error : ', error);
                    Helpers.errorLogging(
                        'Invoice  number insert: error ' + error
                    );
                    status = 500;
                });

            let data = {
                name: full_name,
                email: email,
                code: code,
            };

            EmailNotification.newAccountRegisterationCode(data);

            resolve({
                status: status,
                email: email,
                fullName: full_name,
                uuid: getUuid,
            });
        }
    });
}

function loginUser(inputs) {
    return new Promise(async function (resolve, reject) {
        let email = inputs.email;
        let password = inputs.password;
        let status = 200;
        let hashPassword = '';
        let matched = 300;
        let user = false;

        await knex(userTable)
            .where('email', email)
            .select('*')
            .then((res) => {
                status = 200;
                user = res[0];
            })
            .catch((err) => {
                Helpers.errorLogging(
                    'Error getting user with email: error ' + err
                );
            });

        if (status == 200 && user) {
            await Helpers.decryptPassword(password, user.password).then(
                (response) => {
                    matched = response;
                }
            );
        }

        if (matched == 200) {
            resolve({
                status: status,
                email: user.email,
                fullName: user.full_name,
                uuid: user.uuid,
                user: user,
            });
        } else if (matched == 300) {
            resolve({
                status: 500,
            });
        } else {
            resolve({
                status: 500,
            });
        }
    });
}

function verifyEmail(inputs) {
    return new Promise(async function (resolve, reject) {
        let userId = inputs.user.id;
        let code = inputs.data.code;
        let user = {};
        let status = 500;
        let matched = 0;
        let updatedData = {};
        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        await knex(userTable)
            .where('uuid', userId)
            .select('*')
            .then((res) => {
                status = 200;
                user = res[0];
            });

        if (status == 200) {
            await knex(registerationCodeTable)
                .where('code', code)
                .where('user_id', user.id)
                .select('*')
                .then((data) => {
                    if (data[0].code) {
                        matched = 1;
                    }
                })
                .catch((err) => {
                    matched = 0;
                    status = 500;
                });

            if (matched == 1) {
                await knex(userTable)
                    .where('uuid', userId)
                    .update({
                        updated_at: currentDateTime,
                        verify_user: 1,
                    })
                    .then((response) => {
                        status = 200;
                    })
                    .catch((error) => {
                        console.log('Code update error : ', error);
                        Helpers.errorLogging(
                            'Code update error : error ' + err
                        );
                        status = 500;
                    });

                await knex(userTable)
                    .where('uuid', userId)
                    .select('*')
                    .then((res) => {
                        status = 200;
                        updatedData = res[0];
                    });
            }
        }
        let sendUser = {
            id: updatedData.uuid,
            fullName: updatedData.full_name,
            first_name: updatedData.first_name,
            last_name: updatedData.last_name,
            avatar: updatedData.avatar,
            email: updatedData.email,
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
            verifyUser: updatedData.verify_user,
        };
        resolve({
            status: status,
            uuid: userId,
            updatedData: sendUser,
        });
    });
}

function newVerificationCode(inputs) {
    return new Promise(async function (resolve, reject) {
        let status = 500;
        let code = Helpers.getRandomNumber(6);
        let user_uuid = inputs.user.id;
        let userData = {};
        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        await getUserDataByUUID(user_uuid)
            .then((data) => {
                userData = data[0];
            })
            .catch((err) => {
                console.log(err);
            });

        let codeInsert = {
            code,
            updated_at: currentDateTime,
        };

        await knex(registerationCodeTable)
            .where('user_id', userData.id)
            .update(codeInsert)
            .then((response) => {
                status = 200;
            })
            .catch((error) => {
                console.log('Code insert error : ', error);
                status = 500;
            });

        let data = {
            name: userData.full_name,
            email: userData.email,
            code: code,
        };
        EmailNotification.newAccountRegisterationCode(data);

        resolve({
            status: status,
        });
    });
}

function resetLink(inputs) {
    return new Promise(async function (resolve, reject) {
        let status = 500;
        let reset_token = Helpers.getRandomNumber(6);
        let email = inputs.data.email;
        let userData = {};

        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        await checkEmail(email)
            .then((data) => {
                userData = data[0];
            })
            .catch((err) => {
                status = 500;
            });

        if (userData && userData.email) {
            let codeInsert = {
                user_id: userData.id,
                reset_token,
                email: email,
                created_at: currentDateTime,
            };

            await knex(resetTokenTable)
                .insert(codeInsert)
                .then((response) => {
                    status = 200;
                })
                .catch((error) => {
                    console.log('Code insert error : ', error);
                    status = 500;
                });
            let data = {
                name: userData.full_name,
                email: userData.email,
                reset_token: reset_token,
            };
            EmailNotification.sendEmailResetLink(data);
        }

        resolve({
            status: status,
        });
    });
}

function resetPassword(inputs) {
    return new Promise(async function (resolve, reject) {
        let status = 500;
        let reset_token = inputs.token;
        let email = inputs.email;
        let password = inputs.data.password;
        let hashPassword = '';
        let resetData = {};
        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        await Helpers.encryptPassword(password).then((response) => {
            hashPassword = response;
        });

        await knex(resetTokenTable)
            .where('reset_token', reset_token)
            .where('email', email)
            .then((data) => {
                resetData = data[0];
            })
            .catch((err) => {
                status = 500;
            });

        if (resetData && resetData.reset_token) {
            await knex(userTable)
                .where('email', email)
                .update({
                    password: hashPassword,
                    updated_at: currentDateTime,
                })
                .then((data) => {
                    status = 200;
                })
                .catch((err) => {
                    status = 500;
                });

            if (status == 200) {
                await knex(resetTokenTable)
                    .where('email', email)
                    .where('reset_token', reset_token)
                    .del()
                    .then((data) => {
                        status = 200;
                    })
                    .catch((err) => {
                        console.log(err);
                        status = 500;
                    });
            }
        }

        resolve({
            status: status,
        });
    });
}

module.exports = {
    createUser,
    loginUser,
    getUserData,
    checkEmail,
    getUserDataByUUID,
    verifyEmail,
    newVerificationCode,
    resetLink,
    resetPassword,
};
