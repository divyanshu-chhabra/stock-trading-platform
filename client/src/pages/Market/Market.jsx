import React from 'react';
import { Link } from 'react-router-dom';
import NewsFeed from '../../components/News/NewsFeed';
import './Market.css';

const Market = () => {
  const topStocks = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: '172.25', change: '+1.50', cap: '$2.68T' },
    { ticker: 'TSLA', name: 'Tesla, Inc.', price: '250.50', change: '-2.10', cap: '$795B' },
    { ticker: 'AMZN', name: 'Amazon.com, Inc.', price: '135.36', change: '+0.80', cap: '$1.41T' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', price: '330.10', change: '+3.20', cap: '$2.45T' },
  ];

  return (
    <div className="market-container">
      <div className="market-header">
        <div>
          <h1 className="market-title">Market Overview</h1>
          <p className="market-subtitle">Real-time market quotes, benchmark assets, and latest financial news.</p>
        </div>
      </div>

      <div className="market-section">
        <h2 className="section-heading">Featured Assets</h2>
        <ul className="stock-list">
          {topStocks.map((stock) => (
            <li key={stock.ticker} className="stock-item">
              <Link to={`/stock/${stock.ticker}`} className="stock-link">
                <div className="stock-info">
                  <span className="stock-ticker">{stock.ticker}</span>
                  <span className="stock-name">{stock.name}</span>
                  <span className="stock-cap">Cap: {stock.cap}</span>
                </div>
                <div className="stock-price-info">
                  <span className="stock-price">${stock.price}</span>
                  <span className={`stock-change ${stock.change.startsWith('+') ? 'positive' : 'negative'}`}>
                    {stock.change}
                  </span>
                  <span className="stock-action-hint">Trade →</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="market-section news-section-wrap">
        <NewsFeed limit={9} compact={false} showCategoryFilter={true} title="Live Financial & Market News" />
      </div>
    </div>
  );
};

export default Market;