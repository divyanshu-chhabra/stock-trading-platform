// server/services/marketApiService.js

const axios = require('axios');

// Featured stock catalog with baseline fallback metrics (used when external APIs fail)
const FEATURED_STOCKS = [
  {
    ticker: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Technology',
    cap: '$3.40T',
    fallback: { currentPrice: 226.50, high: 228.40, low: 224.10, open: 225.00, previousClose: 224.80, change: 1.70 },
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft Corp.',
    sector: 'Technology',
    cap: '$3.12T',
    fallback: { currentPrice: 418.20, high: 421.00, low: 415.30, open: 416.50, previousClose: 415.00, change: 3.20 },
  },
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corp.',
    sector: 'Semiconductors',
    cap: '$3.25T',
    fallback: { currentPrice: 138.60, high: 141.20, low: 136.40, open: 137.10, previousClose: 135.80, change: 2.80 },
  },
  {
    ticker: 'GOOGL',
    name: 'Alphabet Inc.',
    sector: 'Technology',
    cap: '$2.15T',
    fallback: { currentPrice: 174.40, high: 176.00, low: 172.80, open: 173.50, previousClose: 173.10, change: 1.30 },
  },
  {
    ticker: 'AMZN',
    name: 'Amazon.com, Inc.',
    sector: 'E-Commerce',
    cap: '$2.08T',
    fallback: { currentPrice: 198.35, high: 200.10, low: 196.20, open: 197.40, previousClose: 197.10, change: 1.25 },
  },
  {
    ticker: 'META',
    name: 'Meta Platforms, Inc.',
    sector: 'Social & AI',
    cap: '$1.45T',
    fallback: { currentPrice: 572.80, high: 578.00, low: 568.50, open: 570.00, previousClose: 569.20, change: 3.60 },
  },
  {
    ticker: 'TSLA',
    name: 'Tesla, Inc.',
    sector: 'EV & Energy',
    cap: '$810B',
    fallback: { currentPrice: 254.50, high: 259.00, low: 251.20, open: 256.00, previousClose: 256.60, change: -2.10 },
  },
  {
    ticker: 'AMD',
    name: 'Advanced Micro Devices',
    sector: 'Semiconductors',
    cap: '$245B',
    fallback: { currentPrice: 152.40, high: 155.10, low: 150.20, open: 151.80, previousClose: 150.90, change: 1.50 },
  },
  {
    ticker: 'NFLX',
    name: 'Netflix, Inc.',
    sector: 'Streaming',
    cap: '$325B',
    fallback: { currentPrice: 758.20, high: 764.00, low: 751.00, open: 754.00, previousClose: 752.40, change: 5.80 },
  },
  {
    ticker: 'INTC',
    name: 'Intel Corp.',
    sector: 'Semiconductors',
    cap: '$105B',
    fallback: { currentPrice: 24.85, high: 25.30, low: 24.40, open: 25.05, previousClose: 25.15, change: -0.30 },
  },
  {
    ticker: 'JPM',
    name: 'JPMorgan Chase & Co.',
    sector: 'Finance',
    cap: '$620B',
    fallback: { currentPrice: 221.60, high: 223.40, low: 219.80, open: 220.50, previousClose: 220.10, change: 1.50 },
  },
  {
    ticker: 'V',
    name: 'Visa Inc.',
    sector: 'Payments',
    cap: '$560B',
    fallback: { currentPrice: 288.40, high: 290.10, low: 286.50, open: 287.20, previousClose: 286.90, change: 1.50 },
  },
  {
    ticker: 'DIS',
    name: 'Walt Disney Co.',
    sector: 'Entertainment',
    cap: '$185B',
    fallback: { currentPrice: 98.75, high: 100.10, low: 97.90, open: 99.10, previousClose: 99.40, change: -0.65 },
  },
  {
    ticker: 'UBER',
    name: 'Uber Technologies',
    sector: 'Mobility',
    cap: '$162B',
    fallback: { currentPrice: 76.40, high: 77.80, low: 75.10, open: 75.80, previousClose: 75.30, change: 1.10 },
  },
  {
    ticker: 'KO',
    name: 'The Coca-Cola Co.',
    sector: 'Consumer',
    cap: '$280B',
    fallback: { currentPrice: 66.20, high: 66.85, low: 65.70, open: 66.00, previousClose: 65.90, change: 0.30 },
  },
  {
    ticker: 'BA',
    name: 'The Boeing Company',
    sector: 'Aerospace',
    cap: '$115B',
    fallback: { currentPrice: 156.90, high: 159.40, low: 155.20, open: 158.00, previousClose: 158.30, change: -1.40 },
  },
];

const FEATURED_STOCK_MAP = new Map(FEATURED_STOCKS.map((s) => [s.ticker, s]));

const QUOTE_CACHE_TTL_MS = 20000;
const quoteCache = new Map();
const inFlightQuotes = new Map();

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

function buildFallbackQuote(sym) {
  const cached = quoteCache.get(sym);
  if (cached) {
    const jitter = (Math.random() - 0.5) * 0.3;
    const price = Number(Math.max(1, cached.data.currentPrice + jitter).toFixed(2));
    const prevClose = cached.data.previousClose || cached.data.open || price;
    const change = Number((price - prevClose).toFixed(2));
    const changePercent = prevClose > 0 ? Number(((change / prevClose) * 100).toFixed(2)) : 0;
    return {
      ...cached.data,
      currentPrice: price,
      change,
      changePercent,
      isSimulated: cached.data.isSimulated,
    };
  }

  const entry = FEATURED_STOCK_MAP.get(sym);
  const base = entry?.fallback || {
    currentPrice: 150.0,
    high: 155.0,
    low: 148.0,
    open: 149.5,
    previousClose: 149.5,
    change: 0.5,
  };
  const changePercent = base.previousClose > 0
    ? Number(((base.change / base.previousClose) * 100).toFixed(2))
    : 0;

  return {
    symbol: sym,
    ...base,
    changePercent,
    isSimulated: true,
  };
}

async function fetchExternalQuote(sym) {
  const finnhubKey = process.env.FINNHUB_API_KEY;
  if (finnhubKey) {
    try {
      const response = await axios.get('https://finnhub.io/api/v1/quote', {
        params: { symbol: sym, token: finnhubKey },
        timeout: 4500,
      });
      const data = response.data;
      if (data && data.c && data.c > 0) {
        const currentPrice = Number(parseFloat(data.c).toFixed(2));
        const previousClose = Number(parseFloat(data.pc || data.o || data.c).toFixed(2));
        const change = Number((currentPrice - previousClose).toFixed(2));
        const changePercent = previousClose > 0
          ? Number(((change / previousClose) * 100).toFixed(2))
          : 0;

        return {
          symbol: sym,
          currentPrice,
          high: Number(parseFloat(data.h || currentPrice).toFixed(2)),
          low: Number(parseFloat(data.l || currentPrice).toFixed(2)),
          open: Number(parseFloat(data.o || currentPrice).toFixed(2)),
          previousClose,
          change,
          changePercent,
          isSimulated: false,
        };
      }
    } catch (err) {
      console.warn(`Finnhub quote API fetch failed for ${sym}:`, err.message);
    }
  }

  const alphaKey = process.env.MARKET_API_KEY;
  const alphaUrl = process.env.MARKET_API_URL || 'https://www.alphavantage.co/query';
  if (alphaKey) {
    try {
      const response = await axios.get(alphaUrl, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: sym,
          apikey: alphaKey,
        },
        timeout: 4500,
      });
      const quote = response.data?.['Global Quote'];
      const priceStr = quote?.['05. price'];
      if (priceStr && !isNaN(parseFloat(priceStr))) {
        const currentPrice = Number(parseFloat(priceStr).toFixed(2));
        const previousClose = Number(parseFloat(quote['08. previous close'] || currentPrice).toFixed(2));
        const change = Number((currentPrice - previousClose).toFixed(2));
        const changePercent = previousClose > 0
          ? Number(((change / previousClose) * 100).toFixed(2))
          : 0;

        return {
          symbol: sym,
          currentPrice,
          high: Number(parseFloat(quote['03. high'] || currentPrice).toFixed(2)),
          low: Number(parseFloat(quote['04. low'] || currentPrice).toFixed(2)),
          open: Number(parseFloat(quote['02. open'] || currentPrice).toFixed(2)),
          previousClose,
          change,
          changePercent,
          isSimulated: false,
        };
      }
    } catch (err) {
      console.warn(`Alpha Vantage quote API fetch failed for ${sym}:`, err.message);
    }
  }

  return null;
}

/**
 * Fetch real-time stock quote from Finnhub / Alpha Vantage with 20s caching.
 * Falls back to cached/baseline prices if external APIs are unavailable or rate-limited.
 */
exports.fetchStockQuote = async (ticker, options = {}) => {
  const sym = ticker ? ticker.trim().toUpperCase() : 'AAPL';
  const forceRefresh = Boolean(options.forceRefresh);
  const cached = quoteCache.get(sym);

  if (!forceRefresh && cached && Date.now() - cached.fetchedAt < QUOTE_CACHE_TTL_MS) {
    return cached.data;
  }

  if (inFlightQuotes.has(sym)) {
    return inFlightQuotes.get(sym);
  }

  const promise = (async () => {
    try {
      const liveQuote = await fetchExternalQuote(sym);
      if (liveQuote) {
        quoteCache.set(sym, { data: liveQuote, fetchedAt: Date.now() });
        return liveQuote;
      }

      const fallback = buildFallbackQuote(sym);
      quoteCache.set(sym, { data: fallback, fetchedAt: Date.now() });
      return fallback;
    } finally {
      inFlightQuotes.delete(sym);
    }
  })();

  inFlightQuotes.set(sym, promise);
  return promise;
};

/**
 * Fetch the curated catalog of featured stocks enriched with live quotes.
 */
exports.fetchFeaturedStocks = async () => {
  const results = await Promise.all(
    FEATURED_STOCKS.map(async (stock) => {
      const quote = await exports.fetchStockQuote(stock.ticker);
      return {
        ticker: stock.ticker,
        name: stock.name,
        sector: stock.sector,
        cap: stock.cap,
        price: quote.currentPrice,
        change: quote.change,
        changePercent: quote.changePercent,
        high: quote.high,
        low: quote.low,
        open: quote.open,
        previousClose: quote.previousClose,
        isSimulated: Boolean(quote.isSimulated),
      };
    })
  );
  return results;
};

/**
 * Check whether a cached quote is stale (older than QUOTE_CACHE_TTL_MS).
 */
exports.isQuoteStale = (ticker) => {
  const sym = ticker ? ticker.trim().toUpperCase() : '';
  const cached = quoteCache.get(sym);
  return !cached || Date.now() - cached.fetchedAt >= QUOTE_CACHE_TTL_MS;
};

exports.FEATURED_STOCKS = FEATURED_STOCKS;

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

  if (category && category !== 'general' && category !== 'all') {
    const filtered = fallbackNews.filter((n) => n.category.toLowerCase() === category.toLowerCase());
    if (filtered.length > 0) return filtered;
  }
  return fallbackNews;
};
