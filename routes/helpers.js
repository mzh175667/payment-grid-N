const express = require('express');
const router = express.Router();

const { checkEmail } = require('../controllers/HelperController');

router.post('/checkEmail', checkEmail);

module.exports = router;
