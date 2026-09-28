import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { getPortfolio } from '../../api/portfolioApi';
import { useAuth } from '../../hooks/useAuth';
import { SocketContext } from '../../context/SocketContext';
import CandlestickChart from '../../components/Charts/CandlestickChart';
import NewsFeed from '../../components/News/NewsFeed';
import './dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const socket = useContext(SocketContext);

  const [portfolioData, setPortfolioData] = useState({
    holdings: [],
    balance: 100000,
    totalPortfolioValue: 100000,
    totalHoldingsValue: 0,
    totalInvested: 0,
    totalPurchased: 0,
    totalSold: 0,
    totalRealizedProfit: 0,
    totalUnrealizedProfit: 0,
    totalAllTimeProfit: 0,
    lastTransactionAnalysis: null,
    transactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [txFilter, setTxFilter] = useState('ALL'); // 'ALL' | 'BUY' | 'SELL'
  const [showAllTxModal, setShowAllTxModal] = useState(false);

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
          totalPortfolioValue: data.totalPortfolioValue !== undefined ? data.totalPortfolioValue : data.balance,
          totalHoldingsValue: data.totalHoldingsValue || 0,
          totalInvested: data.totalInvested || 0,
          totalPurchased: data.totalPurchased || 0,
          totalSold: data.totalSold || 0,
          totalRealizedProfit: data.totalRealizedProfit || 0,
          totalUnrealizedProfit: data.totalUnrealizedProfit || 0,
          totalAllTimeProfit: data.totalAllTimeProfit || 0,
          lastTransactionAnalysis: data.lastTransactionAnalysis || null,
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

  // Live Socket price update handling
  useEffect(() => {
    if (!socket) return;

    const handlePriceUpdate = (data) => {
      if (!data || !data.ticker) return;

      setPortfolioData((prev) => {
        let holdingUpdated = false;
        const newHoldings = (prev.holdings || []).map((h) => {
          if (h.ticker.toUpperCase() === data.ticker.toUpperCase()) {
            holdingUpdated = true;
            const currentPrice = Number(data.price);
            const totalCost = Number((h.shares * h.averagePrice).toFixed(2));
            const currentValue = Number((h.shares * currentPrice).toFixed(2));
            const unrealizedProfit = Number((currentValue - totalCost).toFixed(2));
            const unrealizedProfitPercent = totalCost > 0
              ? Number(((unrealizedProfit / totalCost) * 100).toFixed(2))
              : 0;

            return {
              ...h,
              currentPrice,
              totalCost,
              currentValue,
              unrealizedProfit,
              unrealizedProfitPercent,
            };
          }
          return h;
        });

        if (!holdingUpdated) return prev;

        const newHoldingsValue = Number(
          newHoldings.reduce((sum, h) => sum + (h.currentValue || 0), 0).toFixed(2)
        );
        const newInvested = Number(
          newHoldings.reduce((sum, h) => sum + (h.totalCost || 0), 0).toFixed(2)
        );
        const newUnrealized = Number((newHoldingsValue - newInvested).toFixed(2));
        const newPortfolioValue = Number((prev.balance + newHoldingsValue).toFixed(2));
        const newAllTimeProfit = Number(((prev.totalRealizedProfit || 0) + newUnrealized).toFixed(2));

        return {
          ...prev,
          holdings: newHoldings,
          totalHoldingsValue: newHoldingsValue,
          totalInvested: newInvested,
          totalUnrealizedProfit: newUnrealized,
          totalPortfolioValue: newPortfolioValue,
          totalAllTimeProfit: newAllTimeProfit,
        };
      });
    };

    socket.on('price_update', handlePriceUpdate);
    return () => socket.off('price_update', handlePriceUpdate);
  }, [socket]);

  const {
    holdings,
    balance,
    totalPortfolioValue,
    totalHoldingsValue,
    totalInvested,
    totalPurchased,
    totalSold,
    totalRealizedProfit,
    totalUnrealizedProfit,
    totalAllTimeProfit,
    lastTransactionAnalysis,
    transactions,
  } = portfolioData;

  const filteredTransactions = transactions.filter((tx) => {
    if (txFilter === 'BUY') return tx.type === 'BUY';
    if (txFilter === 'SELL') return tx.type === 'SELL';
    return true;
  });

  const chartData = [
    { time: '09:30', price: Number((totalPortfolioValue * 0.995).toFixed(2)) },
    { time: '11:00', price: Number((totalPortfolioValue * 0.998).toFixed(2)) },
    { time: '12:30', price: Number((totalPortfolioValue * 1.002).toFixed(2)) },
    { time: '14:00', price: Number((totalPortfolioValue * 1.001).toFixed(2)) },
    { time: '15:30', price: Number(totalPortfolioValue.toFixed(2)) },
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
      {/* Dashboard Top Header */}
      <div className="dashboard-header">
        <div>
          <div className="dashboard-greeting">Total Portfolio Value (Live)</div>
          <div className="portfolio-balance-wrap">
            <h1 className="portfolio-balance">
              ${Number(totalPortfolioValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h1>
            <span className={`portfolio-profit-badge ${totalAllTimeProfit > 0 ? 'positive' : totalAllTimeProfit < 0 ? 'negative' : 'neutral'}`}>
              {totalAllTimeProfit >= 0 ? '▲ +' : '▼ -'}${Math.abs(totalAllTimeProfit).toFixed(2)} All-Time P&L
            </span>
          </div>
        </div>
        <Link to="/market" className="btn-explore">+ Explore Market</Link>
      </div>

      {/* 6 Key Stat Cards: Balance, Assets Value, Cost Basis, Unrealized, Purchased, Sold */}
      <div className="dashboard-stats-row">
        <div className="stat-card">
          <div className="stat-label">Available Cash</div>
          <div className="stat-value cash">
            ${Number(balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">Unallocated Capital</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Holdings Market Value</div>
          <div className="stat-value stocks">
            ${Number(totalHoldingsValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">{holdings.length} Active Position(s)</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Invested Cost Basis</div>
          <div className="stat-value">
            ${Number(totalInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">Capital Deployed</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Unrealized P&L</div>
          <div className="stat-value" style={{ color: totalUnrealizedProfit >= 0 ? '#00e607' : '#ff6b6b' }}>
            {totalUnrealizedProfit >= 0 ? '+' : ''}${Number(totalUnrealizedProfit || 0).toFixed(2)}
          </div>
          <div className={`stat-subtext ${totalUnrealizedProfit >= 0 ? 'positive' : 'negative'}`}>
            Open Positions Gain
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Purchased</div>
          <div className="stat-value">
            ${Number(totalPurchased || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-subtext">All-time Buy Volume</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Sold & Profit</div>
          <div className="stat-value">
            ${Number(totalSold || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className={`stat-subtext ${totalRealizedProfit >= 0 ? 'positive' : 'negative'}`}>
            Realized: {totalRealizedProfit >= 0 ? '+' : ''}${Number(totalRealizedProfit || 0).toFixed(2)}
          </div>
        </div>
      </div>

      {error && <div className="trade-error-msg" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Feature: Dedicated Last Transaction Breakdown & Judgment Card */}
      {lastTransactionAnalysis && (
        <div className={`last-tx-card ${lastTransactionAnalysis.verdictType}`}>
          <div className="last-tx-header">
            <div className="last-tx-title-wrap">
              <span className="last-tx-title">🎯 Last Transaction Analysis & Judgment</span>
              <span className={`tx-type-tag ${lastTransactionAnalysis.type ? lastTransactionAnalysis.type.toLowerCase() : 'buy'}`}>
                {lastTransactionAnalysis.type} {lastTransactionAnalysis.ticker}
              </span>
            </div>
            <div className="last-tx-title-wrap">
              <span className={`verdict-pill ${lastTransactionAnalysis.verdictType}`}>
                {lastTransactionAnalysis.verdictBadge || lastTransactionAnalysis.verdict}
              </span>
              <span className="tx-date" style={{ color: '#888' }}>
                {new Date(lastTransactionAnalysis.createdAt || Date.now()).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          <div className="last-tx-grid">
            <div className="last-tx-col">
              <span className="last-tx-label">Purchase Price</span>
              <span className="last-tx-val">
                ${Number(lastTransactionAnalysis.buyPrice || 0).toFixed(2)}
              </span>
              <span className="last-tx-detail">
                Cost Basis: ${Number(lastTransactionAnalysis.totalCostBasis || 0).toFixed(2)}
              </span>
            </div>

            <div className="last-tx-col">
              <span className="last-tx-label">
                {lastTransactionAnalysis.type === 'SELL' ? 'Sold Price' : 'Current Market Price'}
              </span>
              <span className="last-tx-val">
                ${Number(lastTransactionAnalysis.type === 'SELL' ? lastTransactionAnalysis.sellPrice : lastTransactionAnalysis.currentMarketPrice).toFixed(2)}
              </span>
              <span className="last-tx-detail">
                {lastTransactionAnalysis.type === 'SELL'
                  ? `Proceeds: $${Number(lastTransactionAnalysis.totalAmount || 0).toFixed(2)}`
                  : `Current Value: $${Number(lastTransactionAnalysis.currentValue || 0).toFixed(2)}`}
              </span>
            </div>

            <div className="last-tx-col">
              <span className="last-tx-label">
                {lastTransactionAnalysis.type === 'SELL' ? 'Realized Profit/Loss' : 'Unrealized Gain/Loss'}
              </span>
              {(() => {
                const isSell = lastTransactionAnalysis.type === 'SELL';
                const p = isSell ? lastTransactionAnalysis.profit : lastTransactionAnalysis.unrealizedProfit;
                const pct = isSell ? lastTransactionAnalysis.profitPercentage : lastTransactionAnalysis.unrealizedProfitPercent;
                const isPositive = Number(p || 0) >= 0;
                return (
                  <>
                    <span className="last-tx-val" style={{ color: isPositive ? '#00e607' : '#ff6b6b' }}>
                      {isPositive ? '+' : ''}${Number(p || 0).toFixed(2)}
                    </span>
                    <span className="last-tx-detail" style={{ color: isPositive ? '#00e607' : '#ff6b6b' }}>
                      Return: {isPositive ? '+' : ''}{Number(pct || 0).toFixed(2)}%
                    </span>
                  </>
                );
              })()}
            </div>

            <div className="last-tx-col">
              <span className="last-tx-label">Trade Volume</span>
              <span className="last-tx-val">
                {lastTransactionAnalysis.shares} Shares
              </span>
              <span className="last-tx-detail">
                Symbol: {lastTransactionAnalysis.ticker}
              </span>
            </div>
          </div>

          <div className={`last-tx-commentary ${lastTransactionAnalysis.verdictType}`}>
            <span>💡</span>
            <div>
              <strong>Trade Verdict: </strong>
              {lastTransactionAnalysis.commentary}
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Chart and Recent Transactions */}
      <div className="dashboard-grid">
        <div className="dashboard-widget widget-large">
          <h2 className="widget-title">Portfolio Performance</h2>
          <CandlestickChart data={chartData} />
        </div>

        <div className="dashboard-widget widget-small">
          <div className="widget-title">
            <span>Transaction History</span>
            <div className="tx-filter-bar">
              <button
                type="button"
                className={`tx-filter-btn ${txFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setTxFilter('ALL')}
              >
                All
              </button>
              <button
                type="button"
                className={`tx-filter-btn ${txFilter === 'BUY' ? 'active' : ''}`}
                onClick={() => setTxFilter('BUY')}
              >
                Buys
              </button>
              <button
                type="button"
                className={`tx-filter-btn ${txFilter === 'SELL' ? 'active' : ''}`}
                onClick={() => setTxFilter('SELL')}
              >
                Sells
              </button>
            </div>
          </div>

          {loading ? (
            <p style={{ color: '#888', padding: '1rem 0' }}>Loading transactions...</p>
          ) : filteredTransactions.length === 0 ? (
            <div className="empty-state">
              <p>No transactions found for current filter.</p>
              <Link to="/market" className="btn-explore">Make First Trade</Link>
            </div>
          ) : (
            <>
              <ul className="dashboard-list">
                {filteredTransactions.slice(0, 5).map((tx) => {
                  const isSell = tx.type === 'SELL';
                  const profitVal = Number(tx.profit || 0);
                  const profitPct = Number(tx.profitPercentage || 0);
                  const isPos = profitVal >= 0;

                  return (
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

                      {/* Explicitly show purchase price and sale price for every transaction */}
                      <div className="tx-middle">
                        {isSell ? (
                          <>
                            <span>Sold @ ${Number(tx.sellPrice || tx.price).toFixed(2)}</span>
                            <span style={{ color: '#888' }}>Bought @ ${Number(tx.buyPrice || tx.price).toFixed(2)}</span>
                          </>
                        ) : (
                          <>
                            <span>Bought @ ${Number(tx.buyPrice || tx.price).toFixed(2)}</span>
                            <span style={{ color: '#888' }}>{tx.shares} shares</span>
                          </>
                        )}
                      </div>

                      <div className="tx-right">
                        <span className={`tx-amount ${isSell ? 'sell' : 'buy'}`}>
                          {isSell ? '+' : '-'}${Number(tx.totalAmount).toFixed(2)}
                        </span>
                        {isSell ? (
                          <span className={`tx-profit-tag ${isPos ? 'positive' : 'negative'}`}>
                            {isPos ? '+' : ''}${profitVal.toFixed(2)} ({isPos ? '+' : ''}{profitPct.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="tx-shares-price">
                            Cost: ${Number(tx.totalAmount).toFixed(2)}
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {filteredTransactions.length > 5 && (
                <button
                  type="button"
                  className="btn-view-all-tx"
                  onClick={() => setShowAllTxModal(true)}
                >
                  View All Transactions ({filteredTransactions.length}) →
                </button>
              )}
            </>
          )}
        </div>

        {/* Holdings Table with Purchase Price, Current Market Price, and Profit */}
        <div className="dashboard-widget widget-large">
          <h2 className="widget-title">
            <span>Your Active Holdings</span>
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
                    <th>Shares</th>
                    <th>Avg Purchase Price</th>
                    <th>Current Market Price</th>
                    <th>Total Cost Basis</th>
                    <th>Current Value</th>
                    <th>Unrealized Profit</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h) => {
                    const avgPrice = Number(h.averagePrice || 0);
                    const curPrice = Number(h.currentPrice || avgPrice);
                    const costBasis = Number((h.shares * avgPrice).toFixed(2));
                    const curValue = Number((h.shares * curPrice).toFixed(2));
                    const profit = Number((curValue - costBasis).toFixed(2));
                    const profitPct = costBasis > 0 ? Number(((profit / costBasis) * 100).toFixed(2)) : 0;
                    const isProfit = profit >= 0;

                    return (
                      <tr key={h._id || h.ticker}>
                        <td>
                          <Link to={`/stock/${h.ticker}`} className="ticker-badge">
                            {h.ticker}
                          </Link>
                        </td>
                        <td><strong>{h.shares}</strong></td>
                        <td>${avgPrice.toFixed(2)}</td>
                        <td style={{ fontWeight: 600, color: '#ffffff' }}>${curPrice.toFixed(2)}</td>
                        <td>${costBasis.toFixed(2)}</td>
                        <td style={{ color: '#00d084', fontWeight: 600 }}>
                          ${curValue.toFixed(2)}
                        </td>
                        <td>
                          <span style={{ color: isProfit ? '#00e607' : '#ff6b6b', fontWeight: 700 }}>
                            {isProfit ? '+' : ''}${profit.toFixed(2)} ({isProfit ? '+' : ''}{profitPct}%)
                          </span>
                        </td>
                        <td>
                          <Link to={`/stock/${h.ticker}`} className="btn-table-action">
                            Trade
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
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

      {/* Modal: Full Audit Log of All Transactions */}
      {showAllTxModal && (
        <div className="modal-overlay" onClick={() => setShowAllTxModal(false)}>
          <div className="all-tx-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="all-tx-dialog-header">
              <h3 style={{ margin: 0, fontSize: '1.3rem' }}>Complete Transaction Audit Log</h3>
              <button
                type="button"
                className="close-button"
                onClick={() => setShowAllTxModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="all-tx-dialog-body">
              <div style={{ overflowX: 'auto' }}>
                <table className="holdings-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Symbol</th>
                      <th>Shares</th>
                      <th>Purchase Price</th>
                      <th>Sale / Exec Price</th>
                      <th>Total Purchased</th>
                      <th>Total Sold</th>
                      <th>Realized Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => {
                      const isSell = tx.type === 'SELL';
                      const p = Number(tx.profit || 0);
                      const pPct = Number(tx.profitPercentage || 0);
                      const isPos = p >= 0;
                      return (
                        <tr key={tx._id || tx.createdAt}>
                          <td style={{ fontSize: '0.8rem', color: '#888' }}>
                            {new Date(tx.createdAt || tx.date).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td>
                            <span className={`tx-type-tag ${tx.type ? tx.type.toLowerCase() : 'buy'}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td>
                            <Link to={`/stock/${tx.ticker}`} className="ticker-badge">
                              {tx.ticker}
                            </Link>
                          </td>
                          <td><strong>{tx.shares}</strong></td>
                          <td>${Number(tx.buyPrice || tx.price).toFixed(2)}</td>
                          <td>${Number(isSell ? (tx.sellPrice || tx.price) : tx.price).toFixed(2)}</td>
                          <td>
                            ${Number(tx.totalCostBasis || (tx.shares * (tx.buyPrice || tx.price))).toFixed(2)}
                          </td>
                          <td>
                            {isSell ? `$${Number(tx.totalAmount).toFixed(2)}` : '—'}
                          </td>
                          <td>
                            {isSell ? (
                              <span style={{ color: isPos ? '#00e607' : '#ff6b6b', fontWeight: 700 }}>
                                {isPos ? '+' : ''}${p.toFixed(2)} ({isPos ? '+' : ''}{pPct.toFixed(1)}%)
                              </span>
                            ) : (
                              <span style={{ color: '#888' }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;