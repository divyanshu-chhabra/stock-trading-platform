import React, { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SocketContext } from '../../context/SocketContext';
import { getFeaturedStocks } from '../../api/stockApi';
import NewsFeed from '../../components/News/NewsFeed';
import './Market.css';

const initialStocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 226.50, change: 1.70, changePercent: 0.76, cap: '$3.40T' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', price: 418.20, change: 3.20, changePercent: 0.77, cap: '$3.12T' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semiconductors', price: 138.60, change: 2.80, changePercent: 2.06, cap: '$3.25T' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', price: 174.40, change: 1.30, changePercent: 0.75, cap: '$2.15T' },
  { ticker: 'AMZN', name: 'Amazon.com, Inc.', sector: 'E-Commerce', price: 198.35, change: 1.25, changePercent: 0.63, cap: '$2.08T' },
  { ticker: 'META', name: 'Meta Platforms, Inc.', sector: 'Social & AI', price: 572.80, change: 3.60, changePercent: 0.63, cap: '$1.45T' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', sector: 'EV & Energy', price: 254.50, change: -2.10, changePercent: -0.82, cap: '$810B' },
  { ticker: 'AMD', name: 'Advanced Micro Devices', sector: 'Semiconductors', price: 152.40, change: 1.50, changePercent: 0.99, cap: '$245B' },
  { ticker: 'NFLX', name: 'Netflix, Inc.', sector: 'Streaming', price: 758.20, change: 5.80, changePercent: 0.77, cap: '$325B' },
  { ticker: 'INTC', name: 'Intel Corp.', sector: 'Semiconductors', price: 24.85, change: -0.30, changePercent: -1.19, cap: '$105B' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance', price: 221.60, change: 1.50, changePercent: 0.68, cap: '$620B' },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Payments', price: 288.40, change: 1.50, changePercent: 0.52, cap: '$560B' },
  { ticker: 'DIS', name: 'Walt Disney Co.', sector: 'Entertainment', price: 98.75, change: -0.65, changePercent: -0.65, cap: '$185B' },
  { ticker: 'UBER', name: 'Uber Technologies', sector: 'Mobility', price: 76.40, change: 1.10, changePercent: 1.46, cap: '$162B' },
  { ticker: 'KO', name: 'The Coca-Cola Co.', sector: 'Consumer', price: 66.20, change: 0.30, changePercent: 0.46, cap: '$280B' },
  { ticker: 'BA', name: 'The Boeing Company', sector: 'Aerospace', price: 156.90, change: -1.40, changePercent: -0.88, cap: '$115B' },
];

const Market = () => {
  const socket = useContext(SocketContext);
  const navigate = useNavigate();
  const [stocks, setStocks] = useState(initialStocks);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('ALL');
  const [loadingLive, setLoadingLive] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadStocks = async () => {
      try {
        const liveStocks = await getFeaturedStocks();
        if (isMounted && Array.isArray(liveStocks) && liveStocks.length > 0) {
          setStocks(liveStocks);
        }
      } catch (err) {
        console.warn('Could not fetch featured stocks:', err.message);
      } finally {
        if (isMounted) setLoadingLive(false);
      }
    };
    loadStocks();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (data) => {
      if (!data || !data.ticker) return;
      const upperTicker = data.ticker.toUpperCase();
      setStocks((prev) =>
        prev.map((s) => {
          if (s.ticker !== upperTicker) return s;
          const numPrice = Number(data.price);
          const hasServerChange = typeof data.change === 'number' && !isNaN(data.change);
          const nextChange = hasServerChange
            ? data.change
            : Number((numPrice - Number(s.price || numPrice)).toFixed(2));
          const nextChangePct = typeof data.changePercent === 'number' && !isNaN(data.changePercent)
            ? data.changePercent
            : s.changePercent;

          return {
            ...s,
            price: numPrice,
            change: nextChange,
            changePercent: nextChangePct,
          };
        })
      );
    };

    socket.on('price_update', handlePriceUpdate);
    return () => socket.off('price_update', handlePriceUpdate);
  }, [socket]);

  const sectors = useMemo(() => {
    const unique = Array.from(new Set(stocks.map((s) => s.sector).filter(Boolean)));
    return ['ALL', ...unique];
  }, [stocks]);

  const filteredStocks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return stocks.filter((stock) => {
      const matchesSector = selectedSector === 'ALL' || stock.sector === selectedSector;
      const matchesQuery =
        !q ||
        stock.ticker.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        (stock.sector && stock.sector.toLowerCase().includes(q));
      return matchesSector && matchesQuery;
    });
  }, [stocks, searchQuery, selectedSector]);

  const customTickerCandidate = searchQuery.trim().toUpperCase().replace(/[^A-Z.]/g, '');
  const showCustomLookup =
    customTickerCandidate.length >= 1 &&
    customTickerCandidate.length <= 6 &&
    !stocks.some((s) => s.ticker === customTickerCandidate);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (showCustomLookup) {
      navigate(`/stock/${customTickerCandidate}`);
    } else if (filteredStocks.length === 1) {
      navigate(`/stock/${filteredStocks[0].ticker}`);
    }
  };

  return (
    <div className="market-container">
      <div className="market-header">
        <div>
          <h1 className="market-title">Market Overview</h1>
          <p className="market-subtitle">
            Real-time market quotes, {stocks.length} featured assets, and latest financial news.
          </p>
        </div>
        <div className={`market-live-pill ${loadingLive ? 'syncing' : 'live'}`}>
          <span className="live-dot" />
          {loadingLive ? 'Syncing Live Quotes...' : 'Real-Time Stream Active'}
        </div>
      </div>

      <div className="market-controls">
        <form className="market-search-form" onSubmit={handleSearchSubmit}>
          <input
            type="text"
            className="market-search-input"
            placeholder="Search ticker or company (e.g. NVDA, NFLX, or any US symbol like PYPL)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {showCustomLookup && (
            <button type="submit" className="market-lookup-btn">
              Trade {customTickerCandidate} →
            </button>
          )}
        </form>

        <div className="market-sector-filters">
          {sectors.map((sector) => (
            <button
              key={sector}
              type="button"
              className={`sector-pill ${selectedSector === sector ? 'active' : ''}`}
              onClick={() => setSelectedSector(sector)}
            >
              {sector === 'ALL' ? 'All Sectors' : sector}
            </button>
          ))}
        </div>
      </div>

      <div className="market-section">
        <h2 className="section-heading">
          Featured Assets ({filteredStocks.length})
        </h2>
        {filteredStocks.length === 0 ? (
          <div className="market-empty-state">
            <p>No featured stocks matched "{searchQuery}".</p>
            {showCustomLookup && (
              <Link to={`/stock/${customTickerCandidate}`} className="market-lookup-link">
                Look up live quote & trade {customTickerCandidate} →
              </Link>
            )}
          </div>
        ) : (
          <ul className="stock-list">
            {filteredStocks.map((stock) => {
              const numericChange = Number(stock.change || 0);
              const isPositive = numericChange >= 0;
              const changeLabel = `${isPositive ? '+' : ''}${numericChange.toFixed(2)}`;
              const pctLabel =
                typeof stock.changePercent === 'number' && !isNaN(stock.changePercent)
                  ? ` (${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%)`
                  : '';

              return (
                <li key={stock.ticker} className="stock-item">
                  <Link to={`/stock/${stock.ticker}`} className="stock-link">
                    <div className="stock-info">
                      <div className="stock-ticker-row">
                        <span className="stock-ticker">{stock.ticker}</span>
                        {stock.sector && <span className="stock-sector-tag">{stock.sector}</span>}
                      </div>
                      <span className="stock-name">{stock.name}</span>
                      <span className="stock-cap">Cap: {stock.cap}</span>
                    </div>
                    <div className="stock-price-info">
                      <span className="stock-price">
                        ${typeof stock.price === 'number' ? stock.price.toFixed(2) : Number(stock.price).toFixed(2)}
                      </span>
                      <span className={`stock-change ${isPositive ? 'positive' : 'negative'}`}>
                        {changeLabel}{pctLabel}
                      </span>
                      <span className="stock-action-hint">Trade →</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="market-section news-section-wrap">
        <NewsFeed limit={9} compact={false} showCategoryFilter={true} title="Live Financial & Market News" />
      </div>
    </div>
  );
};

export default Market;
