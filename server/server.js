const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const connectDB = require('./config/db');
const { initSocket } = require('./services/socketservice');
const { errorHandler } = require('./middleware/errorhandler');

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim()).filter(Boolean)
  : null;

app.use(
  cors({
    origin: allowedOrigins && allowedOrigins.length > 0 ? allowedOrigins : '*',
  })
);
app.use(express.json());

// Health check & root endpoints (useful for Render uptime checks)
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'StocksMore API' });
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));
app.use('/api/market', require('./routes/marketRoutes'));

// Global Error Handler
app.use(errorHandler);

// Initialize WebSockets
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));