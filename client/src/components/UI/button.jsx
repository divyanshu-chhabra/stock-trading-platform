import React from 'react';
import './button.css';

const Button = ({ text, onClick, className = 'button-primary' }) => {
  return (
    <button onClick={onClick} className={`button ${className}`}>
      {text}
    </button>
  );
};

export default Button;