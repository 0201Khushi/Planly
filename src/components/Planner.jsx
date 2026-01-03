import "./Planner.css";
import { BsChatDots } from "react-icons/bs";
import { useState } from "react";


function Planner() {
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const visibleTasks =
    activeTab === "All"
      ? tasks
      : tasks.filter((t) => t.category === activeTab);
async function handleAdd() {
  if (!input.trim()) return;

  try {
    // 1️⃣ Ask backend to split message into event texts
    const splitRes = await fetch("/api/split", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: input }),
    });

    const eventTexts = await splitRes.json(); // array of strings

    // 2️⃣ Parse EACH event separately
    const parsedEvents = await Promise.all(
      eventTexts.map(async (eventText) => {
        const res = await fetch("/api/parse", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: eventText }),
        });

        const parsed = await res.json();

        return {
          id: Date.now() + Math.random(), // unique id
          ...parsed,
        };
      })
    );

    // 3️⃣ Add all parsed events to tasks
    setTasks((prev) => [...parsedEvents, ...prev]);

    // 4️⃣ Clear input
    setInput("");
  } catch (err) {
    console.error("Add failed:", err);
  }
}

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
      <button className="add-btn" onClick= {handleAdd}>
      Add</button>
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
  <div className="event-card" key={task.id}>
    <div className="event-type">
      {task.category?.toUpperCase() || "EVENT"}
    </div>

    <div className="event-title">
      {task.title}
    </div>

    {task.date && (
      <div className="event-date">
        {task.date}
      </div>
    )}

    {task.time && (
      <div className="event-time">
        {task.time}
      </div>
    )}

    {task.venue && (
      <div className="event-venue">
        {task.venue}
      </div>
    )}
    {task.notes && (
      <div className="event-notes">
        {task.notes}
      </div>
    )}
  </div>
))}


    </div>
  );
}

export default Planner;

