const { Server } = require('socket.io');

exports.initSocket = (server) => {
  const io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    
    // Emit mock price updates every 5 seconds
    setInterval(() => {
      socket.emit('price_update', { ticker: 'AAPL', price: (150 + Math.random() * 5).toFixed(2) });
    }, 5000);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};