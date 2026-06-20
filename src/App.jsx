import './App.css';
import mixpanel from "./utils/analytics";
import logo from './assets/logo.png';
import { useState, useEffect } from "react";
import Home from "./components/Home";
import Attendance from "./components/Attendance";
import Planner from "./components/Planner";
import Timetable from "./components/Timetable";
import { MdHome, MdEventNote, MdAccessTime, MdChecklist, MdDarkMode, MdLightMode } from "react-icons/md";
import { FiEdit, FiTrash2 } from "react-icons/fi";
function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("planly_theme") === "dark");

  useEffect(() => {
    mixpanel.track("app_opened");
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark-mode");
      localStorage.setItem("planly_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark-mode");
      localStorage.setItem("planly_theme", "light");
    }
  }, [darkMode]);

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
          {activeTab === "home" && (
            <header className="top-bar">
              <img src={logo} alt="Planly" className="logo" />
              <button 
                className="theme-toggle-btn" 
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Toggle theme"
              >
                {darkMode ? <MdLightMode size={22} /> : <MdDarkMode size={22} />}
              </button>
            </header>)}

          {/* MAIN CONTENT */}
          <main className="app-content">
            {activeTab === "home" && <Home />}
            {activeTab === "attendance" && <Attendance />}
            {activeTab === "planner" && <Planner />}
            {activeTab === "timetable" && <Timetable />}
          </main>
        </div>
        <footer className="bottom-nav">
          <div
            className={`nav-item ${activeTab === "home" ? "active" : ""}`}
            onClick={() => setActiveTab("home")}
          >
            <MdHome size={20} />
            <p>Home</p>
          </div>

          <div
            className={`nav-item ${activeTab === "attendance" ? "active" : ""}`}
            onClick={() => setActiveTab("attendance")}
          >
            <MdChecklist size={20} />
            <p>Attendance</p>
          </div>

          <div className={`nav-item ${activeTab === "planner" ? "active" : ""}`} onClick={() => setActiveTab("planner")}>
            <MdEventNote size={20} />
            <p>Planner</p>
          </div>

          <div className={`nav-item ${activeTab === "timetable" ? "active" : ""}`} onClick={() => setActiveTab("timetable")}>
            <MdAccessTime size={20} />
            <p>Timetable</p>
          </div>
        </footer>

      </div>
    </div>
  );
}

export default App;
