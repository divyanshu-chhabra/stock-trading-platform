const axios = require('axios');

exports.fetchStockQuote = async (ticker) => {
  // Replace with actual API logic (e.g., Finnhub, AlphaVantage)
  const apiKey = process.env.MARKET_API_KEY;
  // const response = await axios.get(`API_URL_HERE`);
  // return response.data;
  
  return { symbol: ticker, currentPrice: 150.00, high: 155.00, low: 149.00 }; // Mock response
};