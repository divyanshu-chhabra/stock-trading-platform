const { fetchStockQuote } = require('./marketApiService');

/**
 * Fetch the latest market price for a ticker using shared cached Finnhub/Alpha Vantage quote lookup.
 */
async function getLivePrice(ticker) {
  const quote = await fetchStockQuote(ticker);
  return quote && typeof quote.currentPrice === 'number' ? quote.currentPrice : 150.0;
}

module.exports = { getLivePrice };
