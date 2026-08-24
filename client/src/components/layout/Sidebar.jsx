import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  const getButtonClass = (path) => {
    return location.pathname === path
      ? 'sidebar-button active'
      : 'sidebar-button';
  };

  return (
    <aside className="sidebar">
      <Link to="/" className={getButtonClass('/')}>
        <span>📊</span> Dashboard
      </Link>
      <Link to="/market" className={getButtonClass('/market')}>
        <span>📈</span> Market Data
      </Link>
      <Link to="/news" className={getButtonClass('/news')}>
        <span>📰</span> Market News
      </Link>
    </aside>
  );
};

export default Sidebar;