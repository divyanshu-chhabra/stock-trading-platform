import React from 'react';

const Button = ({ text, onClick, style }) => {
  return (
    <button onClick={onClick} style={{ padding: '8px 16px', cursor: 'pointer', ...style }}>
      {text}
    </button>
  );
};

export default Button;