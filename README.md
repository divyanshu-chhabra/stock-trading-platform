<div align="center">

# 📈 StocksMore

### Modern Real-Time Full-Stack MERN Stock Trading & Portfolio Platform

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Socket.io](https://img.shields.io/badge/Socket.IO-Real--Time-010101?logo=socket.io&logoColor=white)](https://socket.io)
[![Recharts](https://img.shields.io/badge/Recharts-Data%20Viz-22b5bf)](https://recharts.org)

**Real-time market tickers, instant simulated trading, interactive technical charts, live financial news, and dynamic portfolio tracking powered by WebSockets.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Getting Started](#-getting-started) • [Environment Setup](#-environment-variables) • [API Reference](#-api-reference) • [WebSocket Events](#-websocket-events) • [Roadmap](#-roadmap) • [Contributing](#-contributing)

---

</div>

## ✨ Features

### ⚡ Real-Time Market Streaming (WebSocket)
- **Live Price Broadcasting** — Instant price streaming via Socket.IO for major tickers (`AAPL`, `TSLA`, `AMZN`, `MSFT`, `GOOGL`, `NVDA`).
- **Dynamic Subscriptions** — Clients can dynamically subscribe to any specific stock symbol to receive real-time updates.
- **Fail-Safe Fallbacks** — Built-in resilient caching and fallback simulation ensuring zero UI downtime even during external market API rate limits.

### 💼 Portfolio & Trading Execution
- **Instant Buy & Sell** — Execute virtual stock buy and sell orders with immediate cash and holdings reconciliation.
- **Dynamic Portfolio Tracker** — Real-time computation of total asset valuation, cash balance, invested capital, and overall profit/loss (P&L).
- **Comprehensive Transaction History** — Detailed audit log tracking timestamps, ticker symbols, trade types, quantities, and executed share prices.

### 📊 Interactive Technical Charts & Analytics
- **Responsive Visualizations** — Clean, responsive charts rendered with Recharts showcasing price movements and trend trajectories.
- **Detailed Asset Metrics** — High, Low, Open, Previous Close, and net percentage changes on stock deep-dive pages.

### 📰 Financial News & Market Intelligence
- **Live Market News Feed** — Integrated Finnhub financial news feed categorized by general, business, and tech sectors.
- **Smart Editorial Cards** — Headline, source publisher, publication timestamps, and direct links to full market coverage.

### 🔐 Enterprise-Grade Authentication & Security
- **JWT Authentication** — Stateless token-based security protecting user accounts and private financial transactions.
- **Password Encryption** — Industry-standard salted password hashing with `bcryptjs`.
- **Protected API Middleware** — Robust route guards ensuring user data isolation across all portfolio operations.

### 🎨 Modern FinTech User Interface
- **Sleek FinTech Design** — Glassmorphic surfaces, curated color palettes, and micro-interactions designed for high-density trading data.
- **Responsive Navigation** — Collapsible sidebar, persistent status indicators, and clean mobile-friendly layouts.

---

## 🛠 Tech Stack

<div align="center">

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **React 18** | High-performance component-based client architecture |
| **Routing** | **React Router DOM v6** | Client-side routing and deep-linking |
| **Charts & Visualization** | **Recharts** | Interactive SVG financial charts and performance curves |
| **Client Networking** | **Axios & Socket.io-Client** | RESTful HTTP requests and real-time bi-directional streaming |
| **Styling** | **Custom FinTech CSS** | Responsive glassmorphism, responsive grids, and design tokens |
| **Backend Runtime** | **Node.js & Express 4** | High-throughput async REST API and WebSocket host |
| **Real-Time Engine** | **Socket.IO** | Bi-directional event-driven market price feeds |
| **Database & ODM** | **MongoDB Atlas + Mongoose 7** | Scalable NoSQL persistence for users, portfolios, and trades |
| **Market Data Providers** | **Finnhub & Alpha Vantage** | Real-time quote APIs, ticker metadata, and financial news |
| **Security & Auth** | **JWT & BCrypt.js** | Stateless token authorization and cryptographic password hashing |

</div>

---

## 🏗 Architecture

```
stock-trading-platform/
├── client/                              # React Single Page Application
│   ├── public/                          # Static assets and index.html
│   └── src/
│       ├── api/                         # Axios client instances & API endpoints
│       ├── assets/                      # Icons, logos, and illustration assets
│       ├── components/                  # Modular UI components
│       │   ├── Charts/                  # Stock price charts (Recharts)
│       │   ├── layout/                  # Navbar, Sidebar, and Footer
│       │   ├── News/                    # News cards and headlines
│       │   └── UI/                      # Buttons, badges, modals, and metric cards
│       ├── context/                     # React Context providers (Auth, Socket)
│       ├── hooks/                       # Custom React hooks for socket subscriptions
│       ├── pages/                       # Application Views
│       │   ├── Auth/                    # Login and Register pages
│       │   ├── Dashboard/               # Portfolio summary & live watchlist
│       │   ├── Market/                  # Full market overview & ticker explorer
│       │   ├── News/                    # Filterable financial news feed
│       │   └── stockdetail/             # In-depth ticker statistics & trade execution
│       ├── App.js                       # Route configuration & app layout wrapper
│       └── index.js                     # React DOM entrypoint
│
└── server/                              # Node.js / Express Backend
    ├── config/                          # MongoDB connection & configuration
    ├── controllers/                     # Request controllers (Auth, Market, Portfolio)
    ├── middleware/                      # JWT auth protection middleware
    ├── models/                          # Mongoose Schemas (User, Portfolio, Transaction)
    ├── routes/                          # Express REST API routes
    ├── services/                        # Business logic & 3rd-party integrations
    │   ├── marketApiService.js          # Finnhub & Alpha Vantage quote/news adapters
    │   ├── priceService.js              # Real-time price aggregation & simulator
    │   └── socketservice.js             # Socket.IO broadcasting & rooms
    ├── utils/                           # Helper utilities
    └── server.js                        # HTTP + WebSocket server initialization
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed on your machine:
- **Node.js** (v18.x or higher) — [Download Node.js](https://nodejs.org/)
- **npm** (v9.x or higher) or **yarn**
- **MongoDB** — Cloud instance ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas)) or local MongoDB service

---

### 1. Clone the Repository

```bash
git clone https://github.com/divyanshu-chhabra/stock-trading-platform.git
cd stock-trading-platform
```

### 2. Configure Environment Variables

Create a `.env` file inside the `server/` directory:

```bash
cd server
cp .env.example .env   # Or create .env manually
```

Populate the required credentials in `server/.env`:

```env
PORT=5005
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
FINNHUB_API_KEY=your_finnhub_api_key
MARKET_API_KEY=your_alpha_vantage_api_key
MARKET_API_URL=https://www.alphavantage.co/query
```

> 💡 **Tip:** You can obtain free API keys from [Finnhub.io](https://finnhub.io/) and [Alpha Vantage](https://www.alphavantage.co/).

### 3. Install Dependencies & Start the Backend

```bash
# In the server/ directory
npm install
npm run dev     # Starts server with nodemon on port 5005 (or 'npm start')
```

### 4. Install Dependencies & Start the Frontend

Open a new terminal window:

```bash
cd stock-trading-platform/client
npm install
npm start
```

### 5. Access the Platform

Open your browser and visit **http://localhost:3000** to explore the platform, create your account, and trade!

---

## 📡 API Reference

### 🔐 Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user and obtain JWT token | ❌ No |

### 📈 Market Data (`/api/market`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/market/quote/:ticker` | Fetch quote details (Price, High, Low, Change) | ❌ No |
| `GET` | `/api/market/news?category=...` | Fetch curated financial news articles | ❌ No |

### 💼 Portfolio & Orders (`/api/portfolio`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/portfolio` | Retrieve current user's portfolio and cash balance | 🔒 Bearer Token |
| `GET` | `/api/portfolio/transactions` | Retrieve user's complete trade audit log | 🔒 Bearer Token |
| `POST` | `/api/portfolio/buy` | Execute stock purchase order | 🔒 Bearer Token |
| `POST` | `/api/portfolio/sell` | Execute stock sell order | 🔒 Bearer Token |

---

## ⚡ WebSocket Events

StocksMore utilizes **Socket.IO** for low-latency live streaming:

| Direction | Event Name | Payload | Description |
|---|---|---|---|
| **Server ➔ Client** | `price_update` | `{ ticker: "AAPL", price: 172.50, time: "10:30:15" }` | Emitted every 5 seconds for watched stocks |
| **Client ➔ Server** | `subscribe` | `"NVDA"` | Dynamically adds a ticker to the live broadcast pool |
| **Connection** | `connection` | Socket Handshake | Instantly delivers current snapshot prices |

---

## 🗺️ Roadmap

- [x] Real-time price stream with Socket.IO
- [x] Finnhub live market quote and financial news integration
- [x] Dynamic portfolio calculation with buy/sell trade execution
- [x] Interactive stock charts using Recharts
- [ ] Candlestick & Volume chart intervals (1D, 1W, 1M, 1Y)
- [ ] Stop-loss & Limit order automation
- [ ] Watchlist alert notifications (email/push price targets)
- [ ] AI-driven portfolio diversification scoring & sentiment analysis
- [ ] Paper trading leaderboard & social trading community

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`)
4. **Push** to the branch (`git push origin feature/AmazingFeature`)
5. **Open** a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">

**Built with ❤️ by [Divyanshu Chhabra](https://github.com/divyanshu-chhabra)**

⭐ Star this repository if you find it helpful!

</div>
