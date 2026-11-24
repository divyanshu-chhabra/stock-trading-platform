const { Server } = require('socket.io');
const { FEATURED_STOCKS, fetchStockQuote, isQuoteStale } = require('./marketApiService');

/**
 * Initialize Socket.IO server and broadcast live price updates to connected clients.
 * Pauses external polling when no clients are connected to stay well within free API rate limits.
 */
exports.initSocket = (server) => {
  const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
    : null;

  const io = new Server(server, {
    cors: {
      origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : '*',
    },
  });

  const defaultTickers = FEATURED_STOCKS.map((s) => s.ticker);
  // Track extra per-socket ticker subscriptions so they clean up on disconnect
  const dynamicSubscribers = new Map(); // ticker -> Set<socket.id>
  const latestQuotes = new Map();
  let rotationIndex = 0;

  const getActiveTickers = () => {
    const all = new Set(defaultTickers);
    for (const ticker of dynamicSubscribers.keys()) {
      all.add(ticker);
    }
    return Array.from(all);
  };

  const buildPayload = (ticker, quote) => ({
    ticker,
    price: quote.currentPrice,
    change: quote.change,
    changePercent: quote.changePercent,
    previousClose: quote.previousClose,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  });

  const fetchAndEmit = async (ticker, targetSocket = null) => {
    try {
      const quote = await fetchStockQuote(ticker);
      latestQuotes.set(ticker, quote);
      const payload = buildPayload(ticker, quote);

      if (targetSocket) {
        targetSocket.emit('price_update', payload);
      } else {
        io.emit('price_update', payload);
      }
    } catch (err) {
      console.error(`[socketservice] Error fetching price for ${ticker}:`, err.message);
    }
  };

  // Staggered refresh every 4 seconds ONLY when at least 1 client is connected
  // Refreshes up to 4 stale tickers per tick to stay safely under Finnhub's 60 calls/min free tier
  const broadcastInterval = setInterval(async () => {
    if (io.engine.clientsCount === 0) return;

    const tickers = getActiveTickers();
    if (tickers.length === 0) return;

    const batchSize = Math.min(4, tickers.length);
    const batch = [];
    for (let i = 0; i < batchSize; i++) {
      const idx = (rotationIndex + i) % tickers.length;
      batch.push(tickers[idx]);
    }
    rotationIndex = (rotationIndex + batchSize) % tickers.length;

    await Promise.all(
      batch.map((ticker) => (isQuoteStale(ticker) ? fetchAndEmit(ticker) : Promise.resolve()))
    );
  }, 4000);

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Send cached snapshot immediately on connect
    for (const ticker of getActiveTickers()) {
      const cached = latestQuotes.get(ticker);
      if (cached) {
        socket.emit('price_update', buildPayload(ticker, cached));
      }
    }

    // Client dynamically subscribes to a specific ticker (e.g. from StockDetail)
    socket.on('subscribe', async (ticker) => {
      if (!ticker || typeof ticker !== 'string') return;
      const upperTicker = ticker.trim().toUpperCase();
      if (!upperTicker) return;

      if (!defaultTickers.includes(upperTicker)) {
        if (!dynamicSubscribers.has(upperTicker)) {
          dynamicSubscribers.set(upperTicker, new Set());
        }
        dynamicSubscribers.get(upperTicker).add(socket.id);
      }

      await fetchAndEmit(upperTicker, socket);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      for (const [ticker, subscribers] of dynamicSubscribers.entries()) {
        subscribers.delete(socket.id);
        if (subscribers.size === 0) {
          dynamicSubscribers.delete(ticker);
        }
      }
    });
  });

  process.on('SIGINT', () => {
    clearInterval(broadcastInterval);
    process.exit();
  });
};
