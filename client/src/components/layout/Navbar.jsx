import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../UI/button';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-brand-wrapper">
        <Link to="/" className="navbar-brand">
          Stocks<span>More</span>
        </Link>
        <span className="navbar-tagline">a stock-trading-platform</span>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <span className="user-greeting">Hello, {user.username}</span>
            <Button text="Logout" onClick={logout} className="button-secondary" />
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;