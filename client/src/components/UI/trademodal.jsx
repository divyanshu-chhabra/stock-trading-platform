import React, { useState } from 'react';
import './trademodal.css';
import Button from './button';

const TradeModal = ({ isOpen, onClose, ticker, currentPrice, onTrade }) => {
  const [shares, setShares] = useState(1);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trade-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Trade {ticker}</h3>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>
        <p>Current Price: ${currentPrice}</p>
        <div className="trade-input-group">
          <label htmlFor="shares-input">Shares</label>
          <input
            id="shares-input"
            className="trade-input"
            type="number"
            min="1"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
          />
        </div>
        <div className="modal-actions">
          <Button text="Buy" onClick={() => onTrade(shares, 'BUY')} className="button-primary" />
          <Button text="Sell" onClick={() => onTrade(shares, 'SELL')} className="button-danger" />
        </div>
      </div>
    </div>
  );
};

export default TradeModal;