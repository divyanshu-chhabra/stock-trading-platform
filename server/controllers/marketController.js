const { fetchStockQuote } = require('../services/marketApiService');

exports.getQuote = async (req, res, next) => {
  try {
    const { ticker } = req.params;
    const data = await fetchStockQuote(ticker);
    res.json(data);
  } catch (error) {
    next(error);
  }
};