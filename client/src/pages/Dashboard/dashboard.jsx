import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPortfolio } from '../../api/portfolioApi';
import { useAuth } from '../../hooks/useAuth';
import CandlestickChart from '../../components/Charts/CandlestickChart';
import NewsFeed from '../../components/News/NewsFeed';
import './dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [portfolioData, setPortfolioData] = useState({
    holdings: [],
    balance: 100000,
    transactions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getPortfolio();
        setPortfolioData({
          holdings: data.holdings || [],
          balance: data.balance !== undefined ? data.balance : 100000,
          transactions: data.transactions || [],
        });
      } catch (err) {
        console.error('Failed to load portfolio:', err);
        setError('Failed to fetch portfolio data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [user]);

  const { holdings, balance, transactions } = portfolioData;

  const totalHoldingsValue = holdings.reduce(
    (sum, item) => sum + item.shares * item.averagePrice,
    0
  );

  const totalPortfolioValue = balance + totalHoldingsValue;

  const chartData = [
    { time: '09:30', price: totalPortfolioValue * 0.995 },
    { time: '11:00', price: totalPortfolioValue * 0.998 },
    { time: '12:30', price: totalPortfolioValue * 1.002 },
    { time: '14:00', price: totalPortfolioValue * 1.001 },
    { time: '15:30', price: totalPortfolioValue },
  ];

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="auth-guest-banner">
          <h2>Welcome to StocksMore</h2>
          <p>Sign in to manage your paper trading portfolio with $100,000 in virtual funds.</p>
          <div className="auth-cta-buttons">
            <Link to="/login" className="btn-explore">Login</Link>
            <Link to="/register" className="btn-explore" style={{ background: 'transparent', border: '1px solid #007bff' }}>Register</Link>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-widget widget-large">
            <h2 className="widget-title">Market Benchmark</h2>
            <CandlestickChart data={[
              { time: '09:30', price: 15000 },
              { time: '11:00', price: 15080 },
              { time: '13:00', price: 15120 },
              { time: '15:30', price: 15190 }
            ]} />
          </div>
          <div className="dashboard-widget widget-small">
            <NewsFeed limit={4} compact={true} showCategoryFilter={false} title="Breaking Headlines" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <div className="dashboard-greeting">Total Portfolio Value</div>
          <h1 className="portfolio-balance">${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
        </div>
        <Link to="/market" className="btn-explore">+ Explore Market</Link>
      </div>

      <div className="dashboard-stats-row">
        <div className="stat-card">
          <div className="stat-label">Cash Balance</div>
          <div className="stat-value cash">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Invested Assets</div>
          <div className="stat-value stocks">${totalHoldingsValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Holdings</div>
          <div className="stat-value">{holdings.length}</div>
        </div>
      </div>

      {error && <div className="trade-error-msg" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div className="dashboard-grid">
        <div className="dashboard-widget widget-large">
          <h2 className="widget-title">Portfolio Performance</h2>
          <CandlestickChart data={chartData} />
        </div>

        <div className="dashboard-widget widget-small">
          <h2 className="widget-title">Recent Transactions</h2>
          {loading ? (
            <p style={{ color: '#888', padding: '1rem 0' }}>Loading transactions...</p>
          ) : transactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions yet.</p>
              <Link to="/market" className="btn-explore">Make First Trade</Link>
            </div>
          ) : (
            <ul className="dashboard-list">
              {transactions.slice(0, 5).map((tx) => (
                <li key={tx._id || tx.createdAt} className="dashboard-list-item">
                  <div className="tx-left">
                    <span className={`tx-type-tag ${tx.type ? tx.type.toLowerCase() : 'buy'}`}>
                      {tx.type}
                    </span>
                    <div className="tx-details">
                      <span className="tx-ticker">{tx.ticker}</span>
                      <span className="tx-date">
                        {new Date(tx.createdAt || tx.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="tx-right">
                    <span className={`tx-amount ${tx.type ? tx.type.toLowerCase() : 'buy'}`}>
                      {tx.type === 'BUY' ? '-' : '+'}${Number(tx.totalAmount).toFixed(2)}
                    </span>
                    <span className="tx-shares-price">
                      {tx.shares} shares @ ${Number(tx.price).toFixed(2)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-widget widget-large">
          <h2 className="widget-title">
            <span>Your Holdings</span>
            <span style={{ fontSize: '0.9rem', color: '#888', fontWeight: 'normal' }}>
              {holdings.length} Position(s)
            </span>
          </h2>

          {loading ? (
            <p style={{ color: '#888', padding: '1rem 0' }}>Loading holdings...</p>
          ) : holdings.length === 0 ? (
            <div className="empty-state">
              <p>You do not currently own any shares.</p>
              <Link to="/market" className="btn-explore">Browse Market</Link>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="holdings-table">
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Shares Owned</th>
                    <th>Average Buy Price</th>
                    <th>Current Value</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => (
                    <tr key={h._id || h.ticker}>
                      <td>
                        <Link to={`/stock/${h.ticker}`} className="ticker-badge">
                          {h.ticker}
                        </Link>
                      </td>
                      <td><strong>{h.shares}</strong></td>
                      <td>${Number(h.averagePrice).toFixed(2)}</td>
                      <td style={{ color: '#00d084', fontWeight: 600 }}>
                        ${(h.shares * h.averagePrice).toFixed(2)}
                      </td>
                      <td>
                        <Link to={`/stock/${h.ticker}`} className="btn-table-action">
                          Trade
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-widget widget-small">
          <NewsFeed
            limit={4}
            compact={true}
            showCategoryFilter={false}
            title="Market News"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;