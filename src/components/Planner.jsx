import "./Planner.css";
import { BsChatDots } from "react-icons/bs";
import { useState, useEffect } from "react";
import { classifyCategory } from "../utils/classifyCategory";

const PLANNER_KEY = "planly_planner_data";

function Planner() {
  const [input, setInput] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [timeFilter, setTimeFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("All");

  const todayMidnight = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  })();

  const tomorrowMidnight = todayMidnight + 86400000;
  const dayAfterTomorrow = tomorrowMidnight + 86400000;

  /* LOAD */
  useEffect(() => {
    const saved = localStorage.getItem(PLANNER_KEY);
    if (saved) {
      try {
        setTasks(JSON.parse(saved));
      } catch {
        setTasks([]);
      }
    }
    setLoading(false);
  }, []);

  /* SAVE */
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(PLANNER_KEY, JSON.stringify(tasks));
    }
  }, [tasks, loading]);

  if (loading) {
    return <p style={{ padding: 16 }}>Loading…</p>;
  }

  /* FILTER BY TIME */
  let timeFilteredTasks = [];

  if (timeFilter === "All") timeFilteredTasks = tasks;

  if (timeFilter === "Past")
    timeFilteredTasks = tasks.filter(
      (t) => t.date && t.date < todayMidnight
    );

  if (timeFilter === "Today")
    timeFilteredTasks = tasks.filter(
      (t) => t.date >= todayMidnight && t.date < tomorrowMidnight
    );

  if (timeFilter === "Tomorrow")
    timeFilteredTasks = tasks.filter(
      (t) => t.date >= tomorrowMidnight && t.date < dayAfterTomorrow
    );

  if (timeFilter === "Upcoming")
    timeFilteredTasks = tasks.filter(
      (t) => t.date && t.date >= todayMidnight
    );

  if (timeFilter === "All") {
    timeFilteredTasks = [...timeFilteredTasks].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
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

  /* ADD TASK */
  async function handleAdd() {
    if (!input.trim()) return;

    try {
      const splitRes = await fetch("/api/split", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      const eventTexts = await splitRes.json();

      const parsedEvents = await Promise.all(
        eventTexts.map(async (eventText) => {
          const res = await fetch("/api/parse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

      setTasks((prev) => [...parsedEvents, ...prev]);
      setInput("");
    } catch (err) {
      console.error(err);
    }
  }

  function handleDelete(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function startEdit(task) {
    setEditingId(task.id);
    setEditTask({ ...task });
  }

  function saveEdit(id) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? editTask : t))
    );
    setEditingId(null);
    setEditTask(null);
  }

  /* DATE HELPERS */
  function inferDateFromText(text) {
    if (!text) return null;
    const lower = text.toLowerCase();
    const base = new Date();
    base.setHours(0, 0, 0, 0);

    if (lower.includes("today")) return base.getTime();
    if (lower.includes("tomorrow")) {
      base.setDate(base.getDate() + 1);
      return base.getTime();
    }
    return null;
  }

  function inferOrdinalDate(text) {
    const match = text.match(
      /\b(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\b/i
    );
    if (!match) return null;

    const day = parseInt(match[1], 10);
    const month = [
      "january","february","march","april","may","june",
      "july","august","september","october","november","december"
    ].indexOf(match[3].toLowerCase());

    const now = new Date();
    let year = now.getFullYear();
    const d = new Date(year, month, day);
    if (d < now) year += 1;

    return new Date(year, month, day).getTime();
  }

  function formatDateWithDay(ts) {
    if (!ts) return "";
    return new Date(ts).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "short",
    });
  }

  return (
    <div className="planner-page">
      <header className="top-bar">
        <h2>Planner</h2>
      </header>

      <div className="paste-box">
        <div className="paste-header">
          <span className="paste-title">
            <BsChatDots /> Paste messages
          </span>
          <button className="add-btn" onClick={handleAdd}>
            Add
          </button>
        </div>

        <textarea
          className="paste-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste messages…"
        />
      </div>

      <div className="text1">Your Schedule</div>

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

      <div className="filter-row">
        {["Past", "All", "Upcoming", "Today", "Tomorrow"].map((f) => (
          <div
            key={f}
            className={`filter-pill ${timeFilter === f ? "active" : ""}`}
            onClick={() => setTimeFilter(f)}
          >
            {f}
          </div>
        ))}
      </div>

      {visibleTasks.map((task) => {
        const isPast = task.date && task.date < todayMidnight;

        return (
          <div
            key={task.id}
            className={`event-card ${
              (task.category || "events").toLowerCase()
            } ${isPast ? "past-event" : ""}`}
          >
            <div className="event-header-row">
              <div className="event-type">
                {task.category?.toUpperCase()}
              </div>
              <div className="action-icons">
                <button onClick={() => startEdit(task)}>✏️</button>
                <button onClick={() => handleDelete(task.id)}>🗑️</button>
              </div>
            </div>

            {editingId === task.id ? (
              <div className="edit-card">
                <input
                  value={editTask.title || ""}
                  onChange={(e) =>
                    setEditTask((p) => ({ ...p, title: e.target.value }))
                  }
                />
                <button className="save" onClick={() => saveEdit(task.id)}>
                  Save
                </button>
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
        );
      })}
    </div>
  );
}

export default Planner;
