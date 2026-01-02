import "./Planner.css";

function Planner() {
  return (
    <div className="planner-page">

      {/* Header */}
      <h2 className="planner-title">Planner</h2>

      {/* Input Box */}
      <div className="planner-input-box">
        <textarea
          placeholder="Paste messages in Hindi, English or Hinglish"
        />
        <button className="add-btn">Add</button>
      </div>

      {/* Category Tabs */}
      <div className="planner-tabs">
        <span className="tab active">All</span>
        <span className="tab">Events</span>
        <span className="tab">Academic</span>
        <span className="tab">Exams</span>
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

