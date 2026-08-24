import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getStockQuote } from '../../api/stockApi';
import { buyStock, sellStock, getPortfolio } from '../../api/portfolioApi';
import CandlestickChart from '../../components/Charts/CandlestickChart';
import TradeModal from '../../components/UI/trademodal';
import { useMarketData } from '../../hooks/useMarketData';
import { useAuth } from '../../hooks/useAuth';
import './StockDetail.css';

const StockDetail = () => {
  const { ticker } = useParams();
  const upperTicker = ticker ? ticker.toUpperCase() : 'AAPL';
  const { user } = useAuth();

  const [quote, setQuote] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [userHolding, setUserHolding] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [tradeError, setTradeError] = useState('');
  const [feedbackBanner, setFeedbackBanner] = useState(null);

  const livePriceStream = useMarketData(upperTicker);

  const fetchHoldingAndBalance = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getPortfolio();
      setUserBalance(data.balance);
      const holding = (data.holdings || []).find(
        (h) => h.ticker.toUpperCase() === upperTicker
      );
      setUserHolding(holding || null);
    } catch (err) {
      console.warn('Could not fetch portfolio holdings:', err.message);
    }
  }, [user, upperTicker]);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const data = await getStockQuote(upperTicker);
        setQuote(data);
      } catch (err) {
        console.error('Error fetching stock quote:', err);
      }
    };

    fetchQuote();
    fetchHoldingAndBalance();
  }, [upperTicker, fetchHoldingAndBalance]);

  const currentPrice = Number(
    livePriceStream || (quote && quote.currentPrice) || 150.00
  );

  const handleTrade = async (shares, type) => {
    setTradeLoading(true);
    setTradeError('');
    setFeedbackBanner(null);

    try {
      const tradePayload = {
        ticker: upperTicker,
        shares: Number(shares),
        price: currentPrice,
      };

      let result;
      if (type === 'BUY') {
        result = await buyStock(tradePayload);
      } else {
        result = await sellStock(tradePayload);
      }

      setFeedbackBanner({
        type: 'success',
        message: result.message || `Trade executed: ${type} ${shares} ${upperTicker}`
      });

      // Update local state immediately
      if (result.balance !== undefined) {
        setUserBalance(result.balance);
      }
      if (result.portfolio) {
        setUserHolding(result.portfolio);
      } else if (type === 'SELL' && (!result.portfolio || result.portfolio.shares === 0)) {
        setUserHolding(null);
      }

      // Re-fetch entire portfolio to ensure synchronization
      await fetchHoldingAndBalance();
      setModalOpen(false);
    } catch (error) {
      const errMsg =
        error.response?.data?.message || error.message || 'Trade execution failed';
      setTradeError(errMsg);
      setFeedbackBanner({
        type: 'error',
        message: errMsg
      });
    } finally {
      setTradeLoading(false);
    }
  };

  const generateChartData = (base) => [
    { time: '09:30', price: Number((base * 0.985).toFixed(2)) },
    { time: '10:30', price: Number((base * 0.992).toFixed(2)) },
    { time: '11:30', price: Number((base * 1.005).toFixed(2)) },
    { time: '12:30', price: Number((base * 0.998).toFixed(2)) },
    { time: '13:30', price: Number((base * 1.012).toFixed(2)) },
    { time: '14:30', price: Number((base * 1.008).toFixed(2)) },
    { time: '15:30', price: Number(base.toFixed(2)) },
  ];

  const priceChange = quote ? (quote.change || 0) : 0;
  const isPositive = priceChange >= 0;

  return (
    <div className="stock-detail-container">
      {feedbackBanner && (
        <div className={`trade-alert-banner ${feedbackBanner.type}`}>
          <span>{feedbackBanner.message}</span>
          <button
            onClick={() => setFeedbackBanner(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            &times;
          </button>
        </div>
      )}

      <div className="stock-detail-header">
        <div className="stock-title-section">
          <h1>{upperTicker}</h1>
          <span className="stock-badge">Real-Time Market Asset</span>
        </div>

        <div className="stock-price-section">
          <div className="stock-live-price">${currentPrice.toFixed(2)}</div>
          <div className={`stock-price-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? `+${priceChange}` : priceChange} USD
          </div>
        </div>
      </div>

      <div className="stock-action-bar">
        {user ? (
          <button className="btn-open-trade" onClick={() => { setTradeError(''); setModalOpen(true); }}>
            Trade {upperTicker}
          </button>
        ) : (
          <Link to="/login" className="btn-open-trade" style={{ textDecoration: 'none', display: 'inline-block' }}>
            Login to Trade {upperTicker}
          </Link>
        )}
      </div>

      <div className="stock-grid">
        <div className="stock-chart-card">
          <h2 className="card-title">Intraday Performance</h2>
          <CandlestickChart data={generateChartData(currentPrice)} />
        </div>

        <div>
          <div className="stock-position-card" style={{ marginBottom: '1.5rem' }}>
            <h2 className="card-title">Your Position</h2>
            <div className="stock-stats-list">
              <div className="stock-stat-item">
                <span>Shares Owned:</span>
                <strong>{userHolding ? userHolding.shares : 0}</strong>
              </div>
              <div className="stock-stat-item">
                <span>Average Cost:</span>
                <strong>${userHolding ? Number(userHolding.averagePrice).toFixed(2) : '0.00'}</strong>
              </div>
              <div className="stock-stat-item">
                <span>Total Market Value:</span>
                <strong style={{ color: '#00d084' }}>
                  ${userHolding ? (userHolding.shares * currentPrice).toFixed(2) : '0.00'}
                </strong>
              </div>
              {userBalance !== null && (
                <div className="stock-stat-item">
                  <span>Available Cash:</span>
                  <strong>${Number(userBalance).toFixed(2)}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="stock-stats-card">
            <h2 className="card-title">Market Statistics</h2>
            <div className="stock-stats-list">
              <div className="stock-stat-item">
                <span>Day High:</span>
                <strong>${quote?.high ? Number(quote.high).toFixed(2) : (currentPrice * 1.02).toFixed(2)}</strong>
              </div>
              <div className="stock-stat-item">
                <span>Day Low:</span>
                <strong>${quote?.low ? Number(quote.low).toFixed(2) : (currentPrice * 0.98).toFixed(2)}</strong>
              </div>
              <div className="stock-stat-item">
                <span>Open Price:</span>
                <strong>${quote?.open ? Number(quote.open).toFixed(2) : currentPrice.toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <TradeModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        ticker={upperTicker}
        currentPrice={currentPrice}
        onTrade={handleTrade}
        loading={tradeLoading}
        userBalance={userBalance}
        ownedShares={userHolding ? userHolding.shares : 0}
        error={tradeError}
      />
    </div>
  );
};

export default StockDetail;