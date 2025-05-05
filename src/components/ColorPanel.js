
import React, { useState } from 'react';

const ColorPanel = ({ selectedElements, className }) => {
  const [color, setColor] = useState('#44aa88');

  const handleColorChange = (e) => {
    setColor(e.target.value);
    // TODO: Update selected element color in 3D viewport
  };

  return (
    <div className={className}>
      <h3>Color Settings</h3>
      <div className="color-picker">
        <label>Element Color:</label>
        <input 
          type="color" 
          value={color}
          onChange={handleColorChange}
        />
      </div>
    </div>
  );
};

export default ColorPanel;
