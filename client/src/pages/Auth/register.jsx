import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/api/auth/register', form);
      login(response.data);
      navigate('/');
    } catch (err) {
      const message =
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create Account</h2>
          <p>Get started with $100,000 in virtual paper-trading funds</p>
        </div>

        <div className="auth-disclaimer" role="note" aria-label="Paper Trading Disclaimer">
          <div className="auth-disclaimer-badge">Virtual Paper Trading • Practice Only</div>
          <p className="auth-disclaimer-text">
            <strong>Disclaimer:</strong> StocksMore is a virtual stock trading simulator built
            strictly for <strong>learning and practice</strong>. Your $100,000 starting balance is
            virtual play money with no real-money risk or real market execution.
          </p>
        </div>

        {error && <div className="auth-error">{error}</div>}
        {slowNotice && !error && (
          <div className="auth-coldstart-note">
            Connecting to server — free-tier hosting may take up to 30 seconds to wake up on the
            first request.
          </div>
        )}

        <form className="auth-form" onSubmit={handleRegister}>
          <div className="auth-field">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="auth-input"
              type="text"
              placeholder="e.g. trader_john"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="auth-input"
              type="password"
              placeholder="Minimum 6 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Start Paper Trading'}
          </button>
        </form>

        <div className="auth-footer">
          Already registered? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
