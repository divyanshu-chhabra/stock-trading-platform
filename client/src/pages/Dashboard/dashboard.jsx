import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency } from '../../utils/formatters';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return <p>Please login to view your dashboard.</p>;

  return (
    <div>
      <h1>Portfolio Dashboard</h1>
      <h2>Available Balance: {formatCurrency(user.balance || 100000)}</h2>
      <p>Your open positions will appear here.</p>
    </div>
  );
};

export default Dashboard;