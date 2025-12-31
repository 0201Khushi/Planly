import React, { useState } from 'react';
import './App.css';

// Using simple icons for demo - replace with Lucide or FontAwesome
const App = () => {
  const [activeTab, setActiveTab] = useState('Home');

  const tabs = [
    { name: 'Home', icon: '⌂' },
    { name: 'Attendance', icon: '✓' },
    { name: 'Planner', icon: '≡' },
    { name: 'Timetable', icon: '📅' }
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          PLAN<span className="logo-suffix">LY</span>
        </div>
        <div className="header-icons">
          <span className="settings-icon">⚙</span>
          <div className="profile-circle">👤</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="content">
        {/* Page content goes here */}
      </main>

      {/* Floating Bottom Nav */}
      <nav className="nav-wrapper">
        <div className="nav-bar">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`nav-item ${activeTab === tab.name ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.name)}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-text">{tab.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default App;