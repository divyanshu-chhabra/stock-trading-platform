const express = require('express');
const router = express.Router();
const { getQuote } = require('../controllers/marketController');

router.get('/quote/:ticker', getQuote);

module.exports = router;