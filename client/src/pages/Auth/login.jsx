import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/login', { email, password });
      login(response.data);
      navigate('/');
    } catch (error) {
      // Check for a specific error message from the server, otherwise show a generic one.
      const message =
        error.response?.data?.message ||
        'Login failed. Please check your credentials and try again.';
      alert(message);
      console.error('Login error:', error.response || error);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;