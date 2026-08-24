import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import Dashboard from './pages/Dashboard/dashboard';
import Login from './pages/Auth/login';
import Register from './pages/Auth/register';
import Market from './pages/Market/Market';
import StockDetail from './pages/stockdetail/StockDetail';
import NewsPage from './pages/News/NewsPage';

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
              <Route path="/news" element={<NewsPage />} />
              <Route path="/stock/:ticker" element={<StockDetail />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;