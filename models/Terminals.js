const setupTerminalTable = 'setup_terminal';
const moment = require('moment-timezone');
const Helpers = require('./Helpers');
let timeZone = process.env.TIME_ZONE;
const knex = require('../knex/knex.js');

function setupTerminal(inputs, user) {
    return new Promise(async function (resolve, reject) {
        let status = 500;
        let getUuid = '';
        let setup = {};
        let currentDateTime = moment()
            .tz(timeZone)
            .format('YYYY-MM-DD HH:mm:ss');

        await Helpers.getUuid().then((response) => {
            getUuid = response;
        });

        await knex(setupTerminalTable)
            .where('user_id', user.id)
            .then((response) => {
                setup = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Setup Terminal get error : ', error);
                Helpers.errorLogging('Setup Terminal get error : ' + error);
                status = 500;
            });

        if (setup) {
            let setupTerminalUpdate = {
                form_fields: JSON.stringify(inputs.formFields),
                payment_type: inputs.paymentType,
                payment_service_provider: inputs.paymentServiceProvider,
                updated_at: currentDateTime,
                payment_service_provider_list: JSON.stringify(
                    inputs.paymentServiceProviderList
                ),
            };
            await knex(setupTerminalTable)
                .where('user_id', user.id)
                .update(setupTerminalUpdate)
                .then((response) => {
                    status = 200;
                })
                .catch((error) => {
                    console.log('Setup Terminal update error : ', error);
                    Helpers.errorLogging(
                        'Setup Terminal update error : ' + error
                    );
                    status = 500;
                });
        } else {
            let setupTerminalInsert = {
                uuid: getUuid,
                user_id: user.id,
                form_fields: JSON.stringify(inputs.formFields),
                payment_type: inputs.paymentType,
                payment_service_provider: inputs.paymentServiceProvider,
                created_at: currentDateTime,
                payment_service_provider_list: JSON.stringify(
                    inputs.paymentServiceProviderList
                ),
            };
            await knex(setupTerminalTable)
                .insert(setupTerminalInsert)
                .then((response) => {
                    status = 200;
                })
                .catch((error) => {
                    console.log('Setup Terminal create error : ', error);
                    Helpers.errorLogging(
                        'Setup Terminal create error : ' + error
                    );
                    status = 500;
                });
        }

        resolve({
            status: status,
        });
    });
}

function getSetupTerminal(user) {
    return new Promise(async function (resolve, reject) {
        let status = 500;
        let setup = {};

        await knex(setupTerminalTable)
            .where('user_id', user.id)
            .then((response) => {
                setup = response[0];
                status = 200;
            })
            .catch((error) => {
                console.log('Setup Terminal get error : ', error);
                Helpers.errorLogging('Setup Terminal get error : ' + error);
                status = 500;
            });

        resolve({
            status,
            setup,
        });
    });
}

module.exports = {
    setupTerminal,
    getSetupTerminal,
};
