import "./Planner.css";
import { BsChatDots } from "react-icons/bs";

function Planner() {
  return (
    <div className="planner-page">

      {/* Header */}
      <header className="top-bar">
      <h2 style={{
      fontFamily: "Jura, sans-serif",
      fontSize: "22px",
      fontWeight: "600",
      color: "#000",
      margin: 0,
    }}>Planner</h2>
      </header>

      {/* Input Box */}
      <div className="paste-box">
      <div className="paste-header">
      <span className="paste-title">< BsChatDots style={{ marginRight: "8px" }} />Paste messages</span>
      <button className="add-btn">Add</button>
      </div>

   <textarea
    className="paste-input"
    placeholder="Paste messages in Hindi, English, or Hinglish"
   />
  </div>

  <div className="text1">Your Schedule</div>
      {/* Category Tabs */}
      <div className="filter-tabs">
  {[
    "All",
    "Events",
    "Academic Deadlines",
    "Exams/Quizzes",
    "Classes",
    "Clubs/Committees"
  ].map((item, index) => (
    <button
      key={index}
      className={`tab-btn ${activeTab === item ? "active" : ""}`}
      onClick={() => setActiveTab(item)}
    >
      {item}
    </button>
  ))}
</div>

      {/* Filter Pills */}
      <div className="filter-row">
        <span className="filter active">Past</span>
        <span className="filter">Upcoming</span>
        <span className="filter">Today</span>
      </div>

      {/* Sample Card */}
      <div className="task-card">
        <h4>Energy Conversion Technology Lab</h4>
        <p>Friday, Nov 7 • 1:00 PM</p>
        <span className="tag">Exam</span>
      </div>

    </div>
  );
}

export default Planner;

