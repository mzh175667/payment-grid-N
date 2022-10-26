let userTable = 'users';
const knex = require('../knex/knex.js');
const Helpers = require('../models/Helpers');

exports.checkEmail = async (req, res) => {
    try {
        const email = req.body.email;
        let emailFound = false;
        await knex(userTable)
            .where('email', email)
            .then((response) => {
                if (response && response.length > 0) {
                    emailFound = true;
                }
            })
            .catch((err) => {
                emailFound = false;
            });

        return res.status(200).json({ data: emailFound });
    } catch (error) {
        console.log('Email check error : ' + error);
        Helpers.errorLogging('Email check error : ' + error);
    }
};
