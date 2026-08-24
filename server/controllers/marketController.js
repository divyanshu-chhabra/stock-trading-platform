const { fetchStockQuote, fetchMarketNews } = require('../services/marketApiService');

exports.getQuote = async (req, res, next) => {
  try {
    const { ticker } = req.params;
    const data = await fetchStockQuote(ticker);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

exports.getNews = async (req, res, next) => {
  try {
    const { category } = req.query;
    const news = await fetchMarketNews(category || 'general');
    res.json(news);
  } catch (error) {
    next(error);
  }
};