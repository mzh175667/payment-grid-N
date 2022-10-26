const express = require('express');
const router = express.Router();

const { api } = require('../controllers/ApiController');

router.get('/', api);
router.get('/api', api);

module.exports = router;
