
import React from 'react';

const TreeView = ({ onSelectElements, className }) => {
  const buildingComponents = [
    {
      id: 'walls',
      name: 'Walls',
      children: [
        { id: 'wall_front', name: 'Wall Front' },
        { id: 'wall_back', name: 'Wall Back' },
        { id: 'wall_left', name: 'Wall Left' },
        { id: 'wall_right', name: 'Wall Right' },
      ]
    },
    {
      id: 'roof',
      name: 'Roof',
      children: [
        { id: 'roof_left', name: 'Roof Left' },
        { id: 'roof_right', name: 'Roof Right' },
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
