const { Server } = require('socket.io');

exports.initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  const tickers = ['AAPL', 'TSLA', 'AMZN', 'MSFT'];
  const basePrices = { AAPL: 172.25, TSLA: 250.50, AMZN: 135.36, MSFT: 330.10 };

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Emit live price updates every 3 seconds
    const interval = setInterval(() => {
      tickers.forEach((ticker) => {
        const delta = (Math.random() * 2 - 1) * 0.5; // slight fluctuation
        const currentBase = basePrices[ticker] || 150;
        const newPrice = Math.max(1, Number((currentBase + delta).toFixed(2)));
        basePrices[ticker] = newPrice;

        socket.emit('price_update', {
          ticker,
          price: newPrice,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      });
    }, 3000);

    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('Client disconnected:', socket.id);
    });
  });
};