import "./Planner.css";
import { BsChatDots } from "react-icons/bs";
import { useState } from "react";
import { classifyText } from "../utils/classifyText";


function Planner() {
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const visibleTasks =
    activeTab === "All"
      ? tasks
      : tasks.filter((t) => t.category === activeTab);
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
      <button className="add-btn" onClick={() => {
    if (!input.trim()) return;

    const newTask = {
      id: Date.now(),
      text: input,
      category: classifyText(input), // 👈 THIS IS WHERE IT’S USED
    };

    setTasks([newTask, ...tasks]);
    setInput("");
  }}
>Add</button>
      </div>

   <textarea
    className="paste-input"
    placeholder="Paste messages in Hindi, English, or Hinglish"
    value={input}
    onChange={(e) => setInput(e.target.value)}
   />
    
  </div>

  <div className="text1">Your Schedule</div>
      {/* Category Tabs */}
      <div className="tab-container">
  {["All", "Events", "Academic", "Exams", "Clubs"].map((tab) => (
    <div
      key={tab}
      className={`tab ${activeTab === tab ? "active" : ""}`}
      onClick={() => setActiveTab(tab)}
    >
      {tab}
    </div>
  ))}
</div>

      {/* Filter Pills */}
      <div className="filter-row">
        <div className="filter-pill active">Past</div>
        <div className="filter-pill">Upcoming</div>
        <div className="filter-pill">Today</div>
        <div className="filter-pill">Tomorrow</div>
      </div>

      {/* Sample Card */}
      {visibleTasks.map((task) => (
  <div className="task-card" key={task.id}>
    <h4 className="task-text">{task.text}</h4>
    <span className="tag">{task.category}</span>
  </div>
))}


    </div>
  );
}

export default Planner;

