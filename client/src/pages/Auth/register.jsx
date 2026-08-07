import React, { useState } from 'react';
import api from '../../api/axiosConfig';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/auth/register', form);
      login(response.data);
      navigate('/');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Registration failed. Please try again.';
      alert(message);
      console.error('Registration error:', error.response || error);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>
      <input type="text" placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} required />
      <input type="email" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />
      <input type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} required />
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;