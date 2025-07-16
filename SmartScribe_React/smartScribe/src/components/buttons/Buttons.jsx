import React from 'react';
import { Link } from 'react-router-dom';
import './Buttons.css';

function Buttons({ btn }) {
  return (
    <Link to={btn.path} className="login-button">
      {btn.name}
    </Link>
  );
}

export default Buttons;
