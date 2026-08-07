import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getStockQuote } from '../../api/stockApi';
import { buyStock, sellStock } from '../../api/portfolioApi';
import CandlestickChart from '../../components/Charts/CandlestickChart';
import TradeModal from '../../components/UI/trademodal';
import { useMarketData } from '../../hooks/useMarketData'; // The path will depend on your folder structure

const StockDetail = () => {
  const { ticker } = useParams();
  const [quote, setQuote] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const livePrice = useMarketData(ticker);

  useEffect(() => {
    const fetchQuote = async () => {
      const data = await getStockQuote(ticker);
      setQuote(data);
    };
    fetchQuote();
  }, [ticker]);

  const handleTrade = (shares, type) => {
    console.log(`${type} ${shares} of ${ticker}`);
    setModalOpen(false);
  };

  const chartData = [
    { time: '10:00', price: 149 }, { time: '10:05', price: 151 }, { time: '10:10', price: 150 }
  ];

  return (
    <div>
      <h1>{ticker} Details</h1>
      <h2>Live Price: ${livePrice || (quote && quote.currentPrice) || 'Loading...'}</h2>
      <button onClick={() => setModalOpen(true)}>Trade {ticker}</button>
      
      <div style={{ marginTop: '20px' }}>
        <CandlestickChart data={chartData} />
      </div>

      <TradeModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        ticker={ticker} 
        currentPrice={livePrice || (quote && quote.currentPrice)} 
        onTrade={handleTrade} 
      />
    </div>
  );
};

export default StockDetail;