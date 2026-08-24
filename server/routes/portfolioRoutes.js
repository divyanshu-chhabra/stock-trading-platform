const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getPortfolio, getTransactions } = require('../controllers/portController');
const { protect } = require('../middleware/authmiddleware');

router.use(protect); // Secure all routes below
router.get('/', getPortfolio);
router.get('/transactions', getTransactions);
router.post('/buy', buyStock);
router.post('/sell', sellStock);

module.exports = router;