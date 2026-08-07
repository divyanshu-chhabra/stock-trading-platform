const express = require('express');
const router = express.Router();
const { buyStock, sellStock, getPortfolio } = require('../controllers/portController');
const { protect } = require('../middleware/authmiddleware');

router.use(protect); // Secure all routes below
router.get('/', getPortfolio);
router.post('/buy', buyStock);
router.post('/sell', sellStock);

module.exports = router;