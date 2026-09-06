const { Server } = require('socket.io');
const { getLivePrice } = require('./priceService');

/**
 * Initialize Socket.IO server and broadcast live price updates to all connected clients.
 * Uses a single interval to fetch prices for a set of tickers and emits to every client.
 */
exports.initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: '*' },
  });

  const watchedTickers = new Set(['AAPL', 'TSLA', 'AMZN', 'MSFT', 'GOOGL', 'NVDA']);
  const latestPrices = {};

  const fetchAndEmit = async (ticker, targetSocket = null) => {
    try {
      const fetchedPrice = await getLivePrice(ticker);
      const price = fetchedPrice ?? latestPrices[ticker] ?? 150.00;
      latestPrices[ticker] = price;
      const payload = {
        ticker,
        price,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };

      if (targetSocket) {
        targetSocket.emit('price_update', payload);
      } else {
        io.emit('price_update', payload);
      }
    } catch (err) {
      console.error(`[socketservice] Error fetching price for ${ticker}:`, err.message);
    }
  };

  // Immediate initialization of default tickers
  for (const ticker of watchedTickers) {
    fetchAndEmit(ticker);
  }

  // Regular broadcast interval (every 5 seconds for real-time responsiveness)
  const broadcastInterval = setInterval(async () => {
    for (const ticker of Array.from(watchedTickers)) {
      await fetchAndEmit(ticker);
    }
  }, 5000);

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Send latest prices on new connection
    for (const ticker of watchedTickers) {
      if (latestPrices[ticker] !== undefined) {
        socket.emit('price_update', {
          ticker,
          price: latestPrices[ticker],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });
      }
    }

    // Client dynamically subscribes to a specific ticker (e.g. from StockDetail)
    socket.on('subscribe', async (ticker) => {
      if (!ticker) return;
      const upperTicker = ticker.toUpperCase();
      watchedTickers.add(upperTicker);
      await fetchAndEmit(upperTicker, socket);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  // Clean up interval when process exits
  process.on('SIGINT', () => {
    clearInterval(broadcastInterval);
    process.exit();
  });
};