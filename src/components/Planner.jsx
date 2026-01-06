import "./Planner.css";
import { BsChatDots } from "react-icons/bs";
import { useState,useEffect} from "react";
import { classifyCategory } from "../utils/classifyCategory";


const PLANNER_KEY = "planly_planner_data";



function Planner() {
  
  const [input, setInput] = useState("");

// ✅ LOAD TASKS FROM STORAGE
const [tasks, setTasks] = useState([]);
const [loading, setLoading] = useState(true);
const [editingId, setEditingId] = useState(null);
const [editTask, setEditTask] = useState(null);

// ✅ activeTab stays simple
const [activeTab, setActiveTab] = useState("All");
useEffect(() => {
  const saved = localStorage.getItem(PLANNER_KEY);
  if (saved) {
    try {
      setTasks(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to parse planner data", e);
      setTasks([]);
    }
  }
  setLoading(false);
}, []);

useEffect(() => {
  if (!loading) {
    localStorage.setItem(PLANNER_KEY, JSON.stringify(tasks));
  }
}, [tasks, loading]);

if (loading) {
  return (
    <div className="planner-page">
      <header className="top-bar">
        <h2>Planner</h2>
      </header>
      <p style={{ padding: "16px", opacity: 0.6 }}>
        Loading your schedule…
      </p>
    </div>
  );
}

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
        const finalDate = isValidISODate(parsed.date)
  ? parsed.date
  : inferDateFromText(eventText) || "";

return {
  id: Date.now() + Math.random(),
  ...parsed,
  date: finalDate,
  category: classifyCategory(
    `${parsed.title || ""} ${parsed.notes || ""}`
  
          ),
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
function handleDelete(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }
 /* =========================
     EDIT TASK
     ========================= */
  function startEdit(task) {
  setEditingId(task.id);
  setEditTask({ ...task }); // clone entire task
}

  function saveEdit(id) {
  setTasks(prev =>
    prev.map(task =>
      task.id === id ? editTask : task
    )
  );
  setEditingId(null);
  setEditTask(null);
}
function formatDateWithDay(dateString) {
  const date = parseLocalDate(dateString);
  if (!date || isNaN(date)) return "";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
}
function inferDateFromText(text) {
  if (!text) return "";

  const lower = text.toLowerCase();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // today / tomorrow / yesterday
  if (lower.includes("today")) {
    return today.toISOString().split("T")[0];
  }
  if (lower.includes("tomorrow")) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }
  if (lower.includes("yesterday")) {
    const d = new Date(today);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split("T")[0];
  }

  // weekday logic
const inferredDate = inferDateFromText(eventText);

return {
  id: Date.now() + Math.random(),
  ...parsed,
  date: inferredDate, // NUMBER
  category: classifyCategory(
    `${parsed.title || ""} ${parsed.notes || ""}`
  ),
};

}
function isValidISODate(dateString) {
  if (!dateString) return false;
  const date = parseLocalDate(dateString);
  return date instanceof Date && !isNaN(date);
}
function getLocalMidnight(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}
function parseLocalDate(dateString) {
  if (!dateString) return null;
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // LOCAL date, no timezone shift
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
  <div className={`event-card ${(task.category || "events").trim().toLowerCase()}`} key={task.id}>
    <div className="event-header-row">
    <div className="event-type">
      {task.category?.toUpperCase() || "EVENT"}
    </div>
    <div className="action-icons">
    <button
    className="edit-btn"
    onClick={() => startEdit(task)}
  >✏️
  </button>
    <button
    className="delete-btn"
    onClick={() => handleDelete(task.id)}
  >🗑️
  </button>
  </div>
</div>

    {editingId === task.id ? (
  <div className="edit-card">

    {/* EVENT TYPE */}
    <select
      value={editTask.category || "Events"}
      onChange={(e) =>
        setEditTask(prev => ({ ...prev, category: e.target.value }))
      }
    >
      <option value="Events">Events</option>
      <option value="Academic">Academic</option>
      <option value="Exams">Exams</option>
      <option value="Clubs">Clubs</option>
    </select>

    {/* TITLE */}
    <input
      value={editTask.title || ""}
      onChange={(e) =>
        setEditTask(prev => ({ ...prev, title: e.target.value }))
      }
      placeholder="Event title"
      autoFocus
    />

    {/* DATE */}
    <input
  type="text"
  placeholder="Date"
  value={editTask.date || ""}
  onFocus={(e) => (e.target.type = "date")}
  onBlur={(e) => {
    if (!e.target.value) e.target.type = "text";
  }}
  onChange={(e) =>
    setEditTask(prev => ({ ...prev, date: e.target.value }))
  }
/>

    {/* TIME */}
    <input
  type="text"
  placeholder="Time"
  value={editTask.time || ""}
  onFocus={(e) => (e.target.type = "time")}
  onBlur={(e) => {
    if (!e.target.value) e.target.type = "text";
  }}
  onChange={(e) =>
    setEditTask(prev => ({ ...prev, time: e.target.value }))
  }
/>

    {/* VENUE */}
    <input
      value={editTask.venue || ""}
      onChange={(e) =>
        setEditTask(prev => ({ ...prev, venue: e.target.value }))
      }
      placeholder="Venue"
    />

    {/* NOTES */}
    <textarea
      value={editTask.notes || ""}
      onChange={(e) =>
        setEditTask(prev => ({ ...prev, notes: e.target.value }))
      }
      placeholder="Notes"
    />
    <div className="save-row">
    <button className="save" onClick={() => saveEdit(task.id)}>Save</button>
    </div>
  </div>
) : (
  <>
    <div className="event-title">{task.title}</div>
    {task.date && (
  <div className="event-date">
    {formatDateWithDay(task.date)}
  </div>
)}
    {task.time && <div className="event-time">{task.time}</div>}
    {task.venue && <div className="event-venue">{task.venue}</div>}
    {task.notes && <div className="event-notes">{task.notes}</div>}
  </>
)}
  </div>
))}
    </div>
    
  );
}

export default Planner;

