import "./App.css";
import { FiHome, FiCheckSquare, FiCalendar, FiSettings } from "react-icons/fi";

function App() {
  return (
    <div className="app">

      {/* Top Bar */}
      <header className="top-bar">
        <h1 className="logo">PLANLY</h1>
        <FiSettings className="settings-icon" />
      </header>

      {/* Main Screen */}
      <main className="content">
        {/* Future content goes here */}
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <NavItem icon={<FiHome />} label="Home" active />
        <NavItem icon={<FiCheckSquare />} label="Attendance" />
        <NavItem icon={<FiCalendar />} label="Planner" />
        <NavItem icon={<FiCalendar />} label="Timetable" />
      </nav>
    </div>
  );
}

function NavItem({ icon, label, active }) {
  return (
    <div className={`nav-item ${active ? "active" : ""}`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}

export default App;
