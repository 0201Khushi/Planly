import './App.css';
import logo from './assets/logo.png';
import { FiSettings } from "react-icons/fi";
import { useState } from "react";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="app-root">
      {/* Desktop Message */}
      <div className="desktop-message" >
        <div className="container"> 
          <img src={logo} alt="logo" />

        </div>
        <p>This app is designed for <b>mobile devices</b></p>
        <p>Please open this link on your <b>phone</b>📱</p>
      </div>

      {/* Mobile App */}
      <div className="mobile-app">
        <div className="page-wrapper">
        {/* TOP BAR */}
        <header className="top-bar">
          <img src={logo} alt="Planly" className="logo" />
          {/* Settings icon */}
          <FiSettings className="settings-icon" />
        </header>

        {/* MAIN CONTENT */}
        <main className="app-content">
          <h2>Planly</h2>
          <p>Your smart planning companion.</p>
        </main>
      </div>
        <footer className="bottom-nav">
         <div
          className={`nav-item ${activeTab === "home" ? "active" : ""}`}
          onClick={() => setActiveTab("home")}
         >
          <span>🏠</span>
          <p>Home</p>
         </div>

         <div
          className={`nav-item ${activeTab === "attendance" ? "active" : ""}`}
          onClick={() => setActiveTab("attendance")}
         >
          <span>✔️</span>
          <p>Attendance</p>
         </div>

        <div className={`nav-item ${activeTab === "planner" ? "active" : ""}`} onClick={() => setActiveTab("planner")}>
         <span>📝</span>
         <p>Planner</p>
        </div>

        <div className={`nav-item ${activeTab === "timetable" ? "active" : ""}`} onClick={() => setActiveTab("timetable")}>
         <span>📅</span>
         <p>Timetable</p>
         </div>
       </footer>

    </div>
    </div>
  );
}

export default App;
