import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav style={{ padding: '10px 20px', backgroundColor: '#2c3e50', color: 'white', display: 'flex', justifyContent: 'space-between' }}>
      <h2><Link to="/" style={{ color: 'white', textDecoration: 'none' }}>TradePro</Link></h2>
      <div>
        {user ? (
          <>
            <span style={{ marginRight: '15px' }}>Hello, {user.username}</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login" style={{ color: 'white' }}>Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;