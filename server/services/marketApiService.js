// server/services/marketApiService.js

const axios = require('axios');

// ---------- Fallback data (used when external APIs fail) ----------
const fallbackPrices = {
  AAPL: { currentPrice: 172.25, high: 175.5, low: 171.0, open: 171.8, change: 1.5 },
  TSLA: { currentPrice: 250.5, high: 255.0, low: 247.2, open: 252.0, change: -2.1 },
  AMZN: { currentPrice: 135.36, high: 137.0, low: 134.1, open: 134.5, change: 0.8 },
  MSFT: { currentPrice: 330.1, high: 334.0, low: 328.5, open: 327.9, change: 3.2 },
};

const fallbackNews = [
  {
    id: 101,
    headline: "Federal Reserve Signals Cautious Stance on Future Interest Rate Adjustments",
    source: "Bloomberg",
    category: "general",
    datetime: Math.floor(Date.now() / 1000) - 1800,
    summary: "Central bank policymakers emphasize reliance on incoming labor and inflation data before deciding on subsequent monetary policy shifts.",
    url: "https://www.bloomberg.com/markets",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: 102,
    headline: "Tech Giants Boost AI Infrastructure Spending Amid Enterprise Surge",
    source: "Reuters",
    category: "technology",
    datetime: Math.floor(Date.now() / 1000) - 3600,
    summary: "Major cloud providers report accelerated capital expenditure as enterprise demand for generative AI models and silicon clusters surges.",
    url: "https://www.reuters.com/technology",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: 103,
    headline: "S&P 500 and Nasdaq Hold Steady as Quarterly Earnings Beat Expectations",
    source: "Wall Street Journal",
    category: "general",
    datetime: Math.floor(Date.now() / 1000) - 7200,
    summary: "Wall Street benchmarks maintained upward momentum following resilient corporate earnings across retail, tech, and financial sectors.",
    url: "https://www.wsj.com/market-data",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: 104,
    headline: "Electric Vehicle Market Heats Up With Aggressive Pricing and Next-Gen Batteries",
    source: "CNBC",
    category: "business",
    datetime: Math.floor(Date.now() / 1000) - 10800,
    summary: "Automakers navigate fierce competition with localized production strategies, solid-state battery R&D, and cost optimization initiatives.",
    url: "https://www.cnbc.com/business",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: 105,
    headline: "Global Semiconductor Demand Surges as High-Bandwidth Memory Supply Tightens",
    source: "Financial Times",
    category: "technology",
    datetime: Math.floor(Date.now() / 1000) - 14400,
    summary: "Memory manufacturers report robust order books for next-generation AI accelerators, driving semiconductor sector rally.",
    url: "https://www.ft.com",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=60",
  },
  {
    id: 106,
    headline: "Treasury Yields Stabilize Following Strong Demand at Government Debt Auctions",
    source: "MarketWatch",
    category: "general",
    datetime: Math.floor(Date.now() / 1000) - 18000,
    summary: "Benchmark 10-year US Treasury note yields settled near recent ranges as investors absorbed fresh sovereign supply.",
    url: "https://www.marketwatch.com",
    image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=60",
  },
];

/**
 * Fetch real‑time stock quote from Finnhub.
 * Falls back to static `fallbackPrices` if the API call fails or the key is missing.
 */
exports.fetchStockQuote = async (ticker) => {
  const sym = ticker ? ticker.toUpperCase() : 'AAPL';
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (finnhubKey) {
    try {
      const response = await axios.get('https://finnhub.io/api/v1/quote', {
        params: { symbol: sym, token: finnhubKey },
        timeout: 4000,
      });
      const data = response.data;
      if (data && data.c && data.c > 0) {
        return {
          symbol: sym,
          currentPrice: data.c,
          high: data.h,
          low: data.l,
          open: data.o,
          previousClose: data.pc,
          change: Number((data.c - data.pc).toFixed(2)),
        };
      }
    } catch (err) {
      console.warn(`Finnhub quote API fetch failed for ${sym}:`, err.message);
    }
  }

  // ----- Fallback price -----
  const fallback = fallbackPrices[sym] || {
    currentPrice: 150.0,
    high: 155.0,
    low: 148.0,
    open: 149.5,
    change: 0.5,
  };
  return { symbol: sym, ...fallback };
};

/**
 * Fetch market news from Finnhub.
 * Uses FINNHUB_API_KEY (the same key used for quotes).
 * If the request fails, returns the static `fallbackNews` array, optionally filtered by category.
 */
exports.fetchMarketNews = async (category = 'general') => {
  const finnhubKey = process.env.FINNHUB_API_KEY;

  if (finnhubKey) {
    try {
      const response = await axios.get('https://finnhub.io/api/v1/news', {
        params: { category: category || 'general', token: finnhubKey },
        timeout: 5000,
      });
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data.slice(0, 20).map((item) => ({
          id: item.id,
          headline: item.headline,
          source: item.source || 'Market News',
          category: item.category || category,
          datetime: item.datetime,
          summary: item.summary,
          url: item.url,
          image: item.image || 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=60',
        }));
      }
    } catch (err) {
      console.warn('Finnhub news API fetch failed:', err.message);
    }
  }

  // ----- Fallback news -----
  if (category && category !== 'general' && category !== 'all') {
    const filtered = fallbackNews.filter((n) => n.category.toLowerCase() === category.toLowerCase());
    if (filtered.length > 0) return filtered;
  }
  return fallbackNews;
};
