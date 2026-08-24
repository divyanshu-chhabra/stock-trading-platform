const express = require('express');
const router = express.Router();
const { getQuote, getNews } = require('../controllers/marketController');

router.get('/news', getNews);
router.get('/quote/:ticker', getQuote);

module.exports = router;