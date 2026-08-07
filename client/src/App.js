import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar.jsx';
import Dashboard from './pages/Dashboard/dashboard.jsx';
import Login from './pages/Auth/login.jsx';
import Register from './pages/Auth/register.jsx';
import Market from './pages/Market/Market.jsx';
import StockDetail from './pages/stockdetail/StockDetail.jsx';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Sidebar />
          <div className="page-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/market" element={<Market />} />
              <Route path="/stock/:ticker" element={<StockDetail />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;