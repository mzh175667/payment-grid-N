const Helpers = require('../models/Helpers');

exports.api = (req, res) => {
    try {
        return res.json({
            message: 'Welcome To Payment Grid Backend API',
        });
    } catch (error) {
        console.log('Default Api error : ' + error);
        Helpers.errorLogging('Default Api error : ' + error);
    }
};
