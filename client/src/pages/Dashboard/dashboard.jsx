import './dashboard.css';
import React from 'react';


const Dashboard = () => {
  return (
    <div className="dashboard-container">
       {<div className="dashboard-container">
  
  <div className="dashboard-header">
    <div>
      <div className="dashboard-greeting">Total Portfolio Value</div>
      <h1 className="portfolio-balance">$24,592.65</h1>
    </div>
    {/* You could add a 'Deposit Funds' button here */}
  </div>

  <div className="dashboard-grid">
    
    {/* Large Widget for your Candlestick Chart */}
    <div className="dashboard-widget widget-large">
      <h2 className="widget-title">Market Overview</h2>
      {/* <CandlestickChart data={chartData} /> goes here */}
    </div>

    {/* Small Widget for Watchlist or Recent Trades */}
    <div className="dashboard-widget widget-small">
      <h2 className="widget-title">Recent Activity</h2>
      <ul className="dashboard-list">
        <li className="dashboard-list-item">
          <span>Bought AAPL</span>
          <span className="trend-down">-$175.43</span>
        </li>
        <li className="dashboard-list-item">
          <span>Sold TSLA</span>
          <span className="trend-up">+$210.50</span>
        </li>
      </ul>
    </div>

  </div>
</div>}
       <h1>Dashboard</h1>
    </div>
  );
};

// THIS IS THE LINE YOU ARE MISSING:
export default Dashboard;