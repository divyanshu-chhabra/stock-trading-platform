import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <aside style={{ width: '200px', backgroundColor: '#ecf0f1', padding: '20px' }}>
      <ul style={{ listStyle: 'none', lineHeight: '2' }}>
        <li><Link to="/">Dashboard</Link></li>
        <li><Link to="/market">Market Data</Link></li>
      </ul>
    </aside>
  );
};

export default Sidebar;