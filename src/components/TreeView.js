
import React from 'react';

const TreeView = ({ onSelectElements, className }) => {
  const buildingComponents = [
    {
      id: 'walls',
      name: 'Walls',
      children: [
        { id: 'wall1', name: 'Wall 1' },
        { id: 'wall2', name: 'Wall 2' },
      ]
    },
    {
      id: 'roof',
      name: 'Roof',
      children: [
        { id: 'roof1', name: 'Roof Section 1' },
      ]
    }
  ];

  const handleSelect = (elementId) => {
    onSelectElements([elementId]);
  };

  const renderTreeItems = (items) => {
    return items.map(item => (
      <div key={item.id} className="tree-item">
        <div 
          className="tree-item-header"
          onClick={() => handleSelect(item.id)}
        >
          {item.name}
        </div>
        {item.children && (
          <div className="tree-item-children">
            {renderTreeItems(item.children)}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className={`tree-view ${className}`}>
      <h3>Building Components</h3>
      {renderTreeItems(buildingComponents)}
    </div>
  );
};

export default TreeView;
