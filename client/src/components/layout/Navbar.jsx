import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Button from '../UI/button';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <h2 className="navbar-brand">
        <Link to="/">Stocks<span>More</span></Link>
      </h2>
      <div className="navbar-links">
        {user ? (
          <>
            <span>Hello, {user.username}</span>
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