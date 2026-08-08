import React from 'react';
import { Link } from 'react-router-dom';
import './Market.css';

const Market = () => {
  // In a real app, this would come from an API
  const topStocks = [
    { ticker: 'AAPL', name: 'Apple Inc.', price: '172.25', change: '+1.50' },
    { ticker: 'TSLA', name: 'Tesla, Inc.', price: '250.50', change: '-2.10' },
    { ticker: 'AMZN', name: 'Amazon.com, Inc.', price: '135.36', change: '+0.80' },
    { ticker: 'MSFT', name: 'Microsoft Corp.', price: '330.10', change: '+3.20' },
  ];

  return (
    <div className="market-container">
      <h1 className="market-title">Market Overview</h1>
      <ul className="stock-list">
        {topStocks.map(stock => (
          <li key={stock.ticker} className="stock-item">
            <Link to={`/stock/${stock.ticker}`} className="stock-link">
              <div className="stock-info">
                <span className="stock-ticker">{stock.ticker}</span>
                <span className="stock-name">{stock.name}</span>
              </div>
              <div className="stock-price-info">
                <span className="stock-price">${stock.price}</span>
                <span className={`stock-change ${stock.change.startsWith('+') ? 'positive' : 'negative'}`}>
                  {stock.change}
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Market;