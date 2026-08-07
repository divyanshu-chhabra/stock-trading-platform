import React, { useState } from 'react';

const TradeModal = ({ isOpen, onClose, ticker, currentPrice, onTrade }) => {
  const [shares, setShares] = useState(1);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%, 0)', backgroundColor: 'white', padding: '20px', border: '1px solid black' }}>
      <h3>Trade {ticker}</h3>
      <p>Current Price: ${currentPrice}</p>
      <input type="number" min="1" value={shares} onChange={(e) => setShares(e.target.value)} />
      <button onClick={() => onTrade(shares, 'BUY')}>Buy</button>
      <button onClick={() => onTrade(shares, 'SELL')}>Sell</button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default TradeModal;