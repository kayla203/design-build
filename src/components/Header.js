
import React from 'react';
import { saveDXF } from '../utils/exportUtils';

const Header = () => {
  const handleExport = () => {
    saveDXF();
  };

  return (
    <header className="header">
      <h1>3D Building Constructor</h1>
      <button onClick={handleExport} className="export-btn">
        Export DXF
      </button>
    </header>
  );
};

export default Header;
