import React, { useState } from 'react';
import './trademodal.css';

const TradeModal = ({
  isOpen,
  onClose,
  ticker,
  currentPrice,
  onTrade,
  loading = false,
  userBalance = null,
  ownedShares = 0,
  averageBuyPrice = 0,
  error = ''
}) => {
  const [shares, setShares] = useState(1);
  const [activeTab, setActiveTab] = useState('BUY');

  if (!isOpen) return null;

  const numShares = Math.max(1, parseInt(shares, 10) || 1);
  const price = Number(currentPrice || 0);
  const totalCost = (numShares * price).toFixed(2);

  // Profit/Loss calculation if selling
  const costBasis = (numShares * Number(averageBuyPrice || 0)).toFixed(2);
  const estProfit = (Number(totalCost) - Number(costBasis)).toFixed(2);
  const estProfitPct = Number(averageBuyPrice) > 0
    ? (((price - Number(averageBuyPrice)) / Number(averageBuyPrice)) * 100).toFixed(2)
    : 0;

  const handleBuy = () => {
    onTrade(numShares, 'BUY');
  };

  const handleSell = () => {
    onTrade(numShares, 'SELL');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Trade {ticker}</h3>
          <button className="close-button" onClick={onClose} disabled={loading}>
            &times;
          </button>
        </div>

        {/* Tab switch between Buy and Sell */}
        <div className="trade-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
          <button
            type="button"
            className={`trade-tab-btn ${activeTab === 'BUY' ? 'active-buy' : ''}`}
            onClick={() => setActiveTab('BUY')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: activeTab === 'BUY' ? '1px solid #00c805' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'BUY' ? 'rgba(0,200,5,0.15)' : '#1a1a1a',
              color: activeTab === 'BUY' ? '#00e607' : '#888',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Buy {ticker}
          </button>
          <button
            type="button"
            className={`trade-tab-btn ${activeTab === 'SELL' ? 'active-sell' : ''}`}
            onClick={() => setActiveTab('SELL')}
            style={{
              flex: 1,
              padding: '0.6rem',
              borderRadius: '8px',
              border: activeTab === 'SELL' ? '1px solid #ff5000' : '1px solid rgba(255,255,255,0.1)',
              background: activeTab === 'SELL' ? 'rgba(255,80,0,0.15)' : '#1a1a1a',
              color: activeTab === 'SELL' ? '#ff6b6b' : '#888',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Sell {ticker} ({ownedShares} Owned)
          </button>
        </div>

        <div className="trade-info-panel">
          <div className="trade-info-row">
            <span>Market Price:</span>
            <strong>${price.toFixed(2)}</strong>
          </div>
          {userBalance !== null && (
            <div className="trade-info-row">
              <span>Cash Balance:</span>
              <span className="info-highlight">${Number(userBalance).toFixed(2)}</span>
            </div>
          )}
          <div className="trade-info-row">
            <span>Position Owned:</span>
            <span>{ownedShares} share(s)</span>
          </div>
          {ownedShares > 0 && Number(averageBuyPrice) > 0 && (
            <div className="trade-info-row">
              <span>Your Avg Buy Price:</span>
              <strong style={{ color: '#007bff' }}>${Number(averageBuyPrice).toFixed(2)}</strong>
            </div>
          )}
        </div>

        <div className="trade-input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label htmlFor="shares-input">Number of Shares</label>
            {activeTab === 'SELL' && ownedShares > 0 && (
              <button
                type="button"
                onClick={() => setShares(ownedShares)}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '0.8rem' }}
              >
                Max ({ownedShares})
              </button>
            )}
          </div>
          <input
            id="shares-input"
            className="trade-input"
            type="number"
            min="1"
            max={activeTab === 'SELL' ? ownedShares : undefined}
            step="1"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Sell Profit/Loss calculation preview */}
        {activeTab === 'SELL' && ownedShares > 0 && Number(averageBuyPrice) > 0 && (
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '8px',
            padding: '0.8rem 1rem',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#888' }}>
              <span>Original Purchase Cost:</span>
              <span>${costBasis} (${Number(averageBuyPrice).toFixed(2)}/sh)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem', color: '#888' }}>
              <span>Total Sale Value:</span>
              <span>${totalCost} (${price.toFixed(2)}/sh)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontWeight: 600 }}>Estimated Profit/Loss:</span>
              <strong style={{ color: Number(estProfit) >= 0 ? '#00e607' : '#ff6b6b' }}>
                {Number(estProfit) >= 0 ? '+' : ''}${estProfit} ({Number(estProfit) >= 0 ? '+' : ''}{estProfitPct}%)
              </strong>
            </div>
          </div>
        )}

        <div className="trade-total-card">
          <span>{activeTab === 'BUY' ? 'Total Cost' : 'Total Proceeds'}:</span>
          <span className="total-amount">${totalCost}</span>
        </div>

        {error && <div className="trade-error-msg">{error}</div>}

        <div className="modal-actions">
          {activeTab === 'BUY' ? (
            <button
              type="button"
              className="btn-execute btn-buy"
              onClick={handleBuy}
              disabled={loading || numShares <= 0 || (userBalance !== null && userBalance < Number(totalCost))}
            >
              {loading ? 'Processing...' : `Buy ${numShares} ${ticker} ($${totalCost})`}
            </button>
          ) : (
            <button
              type="button"
              className="btn-execute btn-sell"
              onClick={handleSell}
              disabled={loading || numShares <= 0 || ownedShares < numShares}
            >
              {loading ? 'Processing...' : `Sell ${numShares} ${ticker} (+$${totalCost})`}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeModal;