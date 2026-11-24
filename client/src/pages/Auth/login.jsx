import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [slowNotice, setSlowNotice] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      setSlowNotice(false);
      return;
    }
    const timer = setTimeout(() => setSlowNotice(true), 3000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/login', { email, password });
      login(response.data);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Login failed. Please check your credentials.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome Back</h2>
          <p>Login to your StocksMore paper trading portfolio</p>
        </div>

        <div className="auth-disclaimer" role="note" aria-label="Paper Trading Disclaimer">
          <div className="auth-disclaimer-badge">Virtual Paper Trading • Practice Only</div>
          <p className="auth-disclaimer-text">
            <strong>Disclaimer:</strong> StocksMore is a virtual stock trading platform designed
            strictly for <strong>learning and practice (paper trading)</strong>. All balances and
            orders use simulated virtual funds—no real money, live brokerage execution, or
            financial advice is involved.
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {slowNotice && !error && (
          <div className="auth-coldstart-note">
            Connecting to server — free-tier hosting may take up to 30 seconds to wake up on the
            first request.
          </div>
        )}

        <form className="auth-form" onSubmit={handleLogin}>
          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
