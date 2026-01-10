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
const [timeFilter, setTimeFilter] = useState("All");
const todayMidnight = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();

const tomorrowMidnight = todayMidnight + 24 * 60 * 60 * 1000;
const dayAfterTomorrow = tomorrowMidnight + 24 * 60 * 60 * 1000;

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

let timeFilteredTasks = [];

if (timeFilter === "All") {
  // 🔥 Includes EVERYTHING, including tasks with no date
  timeFilteredTasks = tasks;
}

if (timeFilter === "Past") {
  timeFilteredTasks = tasks.filter(
    (t) => t.date && t.date < todayMidnight
  );
}

if (timeFilter === "Today") {
  timeFilteredTasks = tasks.filter(
    (t) =>
      t.date &&
      t.date >= todayMidnight &&
      t.date < tomorrowMidnight
  );
}

if (timeFilter === "Tomorrow") {
  timeFilteredTasks = tasks.filter(
    (t) =>
      t.date &&
      t.date >= tomorrowMidnight &&
      t.date < dayAfterTomorrow
  );
}

if (timeFilter === "Upcoming") {
  timeFilteredTasks = tasks.filter(
    (t) => t.date && t.date >= todayMidnight
  );
}
if (timeFilter === "All") {
  timeFilteredTasks = [...timeFilteredTasks].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;   // no-date tasks go last
    if (!b.date) return -1;
    return a.date - b.date;
  });
}

const visibleTasks =
  activeTab === "All"
    ? timeFilteredTasks
    : timeFilteredTasks.filter(
        (t) => t.category === activeTab
      );

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
        const finalDate =
         inferOrdinalDate(eventText) ||
         inferDateFromText(eventText) ||
         null;

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

function inferDateFromText(text) {
  if (!text) return null;

  const lower = text.toLowerCase();

  const today = new Date();
  const base = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ); // LOCAL midnight

  const weekdays = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  if (lower.includes("today")) {
    return toLocalMidnightTimestamp(base);
  }

  if (lower.includes("tomorrow")) {
    base.setDate(base.getDate() + 1);
    return toLocalMidnightTimestamp(base);
  }

  if (lower.includes("yesterday")) {
    base.setDate(base.getDate() - 1);
    return toLocalMidnightTimestamp(base);
  }

  for (let i = 0; i < weekdays.length; i++) {
    if (lower.includes(weekdays[i])) {
      let diff = i - base.getDay();
      if (diff <= 0) diff += 7;
      if (lower.includes("next")) diff += 7;

      base.setDate(base.getDate() + diff);
      return toLocalMidnightTimestamp(base);
    }
  }

  return null;
}

// convert Date → local timestamp (no timezone bugs)
function toLocalMidnightTimestamp(date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  ).getTime();
}

// infer ordinal dates like "3rd December"
function inferOrdinalDate(text) {
  if (!text) return null;

  const match = text.match(
    /\b(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i
  );

  if (!match) return null;

  const day = parseInt(match[1], 10);
  const monthName = match[3].toLowerCase();

  const monthIndex = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december"
  ].indexOf(monthName);

  const now = new Date();
  let year = now.getFullYear();

  // if date already passed → assume next year
  const candidate = new Date(year, monthIndex, day);
  if (candidate < now) year += 1;

  return toLocalMidnightTimestamp(
    new Date(year, monthIndex, day)
  );
}
function formatDateWithDay(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

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
  {["Past",,"All","Upcoming", "Today", "Tomorrow"].map((f) => (
    <div
      key={f}
      className={`filter-pill ${timeFilter === f ? "active" : ""}`}
      onClick={() => setTimeFilter(f)}
    >
      {f}
    </div>
    
  ))}
</div>


      {/* Sample Card */}

      {visibleTasks.map((task) => {
  const isPast = task.date && task.date < todayMidnight;

  return (
    <div
      key={task.id}
      className={`event-card ${(task.category || "events")
        .trim()
        .toLowerCase()} ${isPast ? "past-event" : ""}`}
    >
      <div className="event-header-row">
        <div className="event-type">
          {task.category?.toUpperCase() || "EVENT"}
        </div>
        <div className="action-icons">
          <button
            className="edit-btn"
            onClick={() => startEdit(task)}
          >
            ✏️
          </button>
          <button
            className="delete-btn"
            onClick={() => handleDelete(task.id)}
          >
            🗑️
          </button>
        </div>
      </div>

      {editingId === task.id ? (
        <div className="edit-card">
          <select
            value={editTask.category || "Events"}
            onChange={(e) =>
              setEditTask((prev) => ({
                ...prev,
                category: e.target.value,
              }))
            }
          >
            <option value="Events">Events</option>
            <option value="Academic">Academic</option>
            <option value="Exams">Exams</option>
            <option value="Clubs">Clubs</option>
          </select>

          <input
            value={editTask.title || ""}
            onChange={(e) =>
              setEditTask((prev) => ({
                ...prev,
                title: e.target.value,
              }))
            }
            placeholder="Event title"
            autoFocus
          />

          <div className="save-row">
            <button
              className="save"
              onClick={() => saveEdit(task.id)}
            >
              Save
            </button>
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

          {task.time && (
            <div className="event-time">{task.time}</div>
          )}

          {task.venue && (
            <div className="event-venue">{task.venue}</div>
          )}

          {task.notes && (
            <div className="event-notes">{task.notes}</div>
          )}
        </>
      )}
    </div>
  );
})}

    </div>
    
  );
}

export default Planner;

