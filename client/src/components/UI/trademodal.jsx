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
  error = ''
}) => {
  const [shares, setShares] = useState(1);

  if (!isOpen) return null;

  const numShares = Math.max(1, parseInt(shares, 10) || 1);
  const price = Number(currentPrice || 0);
  const totalCost = (numShares * price).toFixed(2);

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
            <span>Shares Owned:</span>
            <span>{ownedShares} share(s)</span>
          </div>
        </div>

        <div className="trade-input-group">
          <label htmlFor="shares-input">Number of Shares</label>
          <input
            id="shares-input"
            className="trade-input"
            type="number"
            min="1"
            step="1"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="trade-total-card">
          <span>Estimated Total:</span>
          <span className="total-amount">${totalCost}</span>
        </div>

        {error && <div className="trade-error-msg">{error}</div>}

        <div className="modal-actions">
          <button
            type="button"
            className="btn-execute btn-buy"
            onClick={handleBuy}
            disabled={loading || numShares <= 0 || (userBalance !== null && userBalance < Number(totalCost))}
          >
            {loading ? 'Processing...' : `Buy ${ticker}`}
          </button>
          <button
            type="button"
            className="btn-execute btn-sell"
            onClick={handleSell}
            disabled={loading || numShares <= 0 || ownedShares < numShares}
          >
            {loading ? 'Processing...' : `Sell ${ticker}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeModal;