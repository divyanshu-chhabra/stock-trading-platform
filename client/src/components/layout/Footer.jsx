import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-brand">
          Stocks<span>More</span> &copy; {currentYear} &bull; Virtual Paper Trading Simulator (Practice Only)
        </div>
        <div className="footer-creator">
          Created by <strong>Divyanshu Chhabra</strong>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
