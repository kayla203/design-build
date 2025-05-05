
import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import TabBar from './components/TabBar';
import TreeView from './components/TreeView';
import Viewport3D from './components/Viewport3D';
import ColorPanel from './components/ColorPanel';

function App() {
  const [selectedElements, setSelectedElements] = useState([]);
  const [activeTab, setActiveTab] = useState('Advanced');

  return (
    <div className="App">
      <Header />
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="main-content">
        <TreeView 
          onSelectElements={setSelectedElements} 
          className="left-panel"
        />
        <Viewport3D 
          selectedElements={selectedElements}
          className="viewport"
        />
        <ColorPanel 
          selectedElements={selectedElements}
          className="right-panel"
        />
      </div>
    </div>
  );
}

export default App;
