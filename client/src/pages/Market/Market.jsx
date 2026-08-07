import React from 'react';
import { Link } from 'react-router-dom';

const Market = () => {
  const topStocks = ['AAPL', 'TSLA', 'AMZN', 'MSFT'];

  return (
    <div>
      <h1>Market Overview</h1>
      <ul>
        {topStocks.map(ticker => (
          <li key={ticker}>
            <Link to={`/stock/${ticker}`}>{ticker}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Market;