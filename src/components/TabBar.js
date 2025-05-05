
import React from 'react';

const TabBar = ({ activeTab, onTabChange }) => {
  const tabs = ['Advanced'];
  
  return (
    <div className="tab-bar">
      {tabs.map(tab => (
        <button
          key={tab}
          className={`tab ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default TabBar;
