import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';
import NewsFeed from '../../components/News/NewsFeed';
import './Market.css';

const initialStocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 172.25, change: '+1.50', cap: '$2.68T' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', price: 250.50, change: '-2.10', cap: '$795B' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', price: 135.36, change: '+0.80', cap: '$1.41T' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 330.10, change: '+3.20', cap: '$2.45T' },
];

const Market = () => {
  const socket = useContext(SocketContext);
  const [stocks, setStocks] = useState(initialStocks);

  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (data) => {
      if (!data || !data.ticker) return;
      setStocks((prev) =>
        prev.map((s) => {
          if (s.ticker === data.ticker) {
            const numPrice = Number(data.price);
            const prevPrice = typeof s.price === 'number' ? s.price : parseFloat(s.price);
            const diff = Number((numPrice - prevPrice).toFixed(2));
            const changeStr = diff >= 0 ? `+${diff.toFixed(2)}` : `${diff.toFixed(2)}`;
            return {
              ...s,
              price: numPrice,
              change: diff !== 0 ? changeStr : s.change,
            };
          }
          return s;
        })
      );
    };

    socket.on('price_update', handlePriceUpdate);
    return () => socket.off('price_update', handlePriceUpdate);
  }, [socket]);

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
          {stocks.map((stock) => (
            <li key={stock.ticker} className="stock-item">
              <Link to={`/stock/${stock.ticker}`} className="stock-link">
                <div className="stock-info">
                  <span className="stock-ticker">{stock.ticker}</span>
                  <span className="stock-name">{stock.name}</span>
                  <span className="stock-cap">Cap: {stock.cap}</span>
                </div>
                <div className="stock-price-info">
                  <span className="stock-price">
                    ${typeof stock.price === 'number' ? stock.price.toFixed(2) : stock.price}
                  </span>
                  <span className={`stock-change ${String(stock.change).startsWith('+') ? 'positive' : 'negative'}`}>
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