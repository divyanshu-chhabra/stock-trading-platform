const express = require('express');
const router = express.Router();
const { getStocks, getQuote, getNews } = require('../controllers/marketController');

router.get('/stocks', getStocks);
router.get('/news', getNews);
router.get('/quote/:ticker', getQuote);

module.exports = router;
