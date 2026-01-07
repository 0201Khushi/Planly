import { useState } from "react";
import "./Timetable.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_HOUR = 8;
const END_HOUR = 18;

const generateSlots = () => {
  const slots = [];
  for (let i = START_HOUR; i < END_HOUR; i++) {
    slots.push({
      start: i,
      end: i + 1,
      subject: "",
      venue: "",
    });
  }
  return slots;
};

const formatTime = (hour) => {
  const period = hour >= 12 ? "PM" : "AM";
  const h = hour > 12 ? hour - 12 : hour;
  return `${h}:00 ${period}`;
};

export default function Timetable() {
  const [activeDay, setActiveDay] = useState("Mon");
  const [editing, setEditing] = useState(false);

  const [weekSlots, setWeekSlots] = useState(
    DAYS.reduce((acc, day) => {
      acc[day] = generateSlots();
      return acc;
    }, {})
  );

  const [savedWeek, setSavedWeek] = useState({});

  const handleChange = (day, index, field, value) => {
    const updated = { ...weekSlots };
    updated[day][index][field] = value;
    setWeekSlots(updated);
  };

  const saveTimetable = () => {
    const mergedWeek = {};

    DAYS.forEach((day) => {
      const slots = weekSlots[day];
      const merged = [];
      let i = 0;

      while (i < slots.length) {
        if (!slots[i].subject) {
          i++;
          continue;
        }

        let start = slots[i].start;
        let end = slots[i].end;
        let subject = slots[i].subject;
        let venue = slots[i].venue;

        let j = i + 1;
        while (
          j < slots.length &&
          slots[j].subject === subject &&
          slots[j].venue === venue
        ) {
          end = slots[j].end;
          j++;
        }

        merged.push({ start, end, subject, venue });
        i = j;
      }

      if (merged.length > 0) mergedWeek[day] = merged;
    });

    setSavedWeek(mergedWeek);
    setEditing(false);
  };

  const editTimetable = () => {
    const rebuilt = DAYS.reduce((acc, day) => {
      acc[day] = generateSlots();
      return acc;
    }, {});

    Object.entries(savedWeek).forEach(([day, classes]) => {
      classes.forEach((cls) => {
        for (let h = cls.start; h < cls.end; h++) {
          rebuilt[day][h - START_HOUR].subject = cls.subject;
          rebuilt[day][h - START_HOUR].venue = cls.venue;
        }
      });
    });

    setWeekSlots(rebuilt);
    setEditing(true);
  };

  const hasAnyTimetable = Object.keys(savedWeek).length > 0;

  // EMPTY STATE
  if (!hasAnyTimetable && !editing) {
    return (
      <div>
      <header className="top-bar">
      <h2 style={{
      fontFamily: "Jura, sans-serif",
      fontSize: "22px",
      fontWeight: "600",
      color: "#000",
      margin: 0,
    }}>Planner</h2>
      </header>
      <div className="tt-container">
        <p className="tt-empty-text">Your timetable is empty.</p>
        <button className="tt-primary-btn" onClick={() => setEditing(true)}>
          Add Timetable
        </button>
      </div>
      </div>
    );
  }

  return (
    <div>
      <header className="top-bar">
      <h2 style={{
      fontFamily: "Jura, sans-serif",
      fontSize: "22px",
      fontWeight: "600",
      color: "#000",
      margin: 0,
    }}>Planner</h2>
      </header>
    <div className="tt-container">
      {/* DAY TABS */}
      <div className="tt-days">
        {DAYS.map((day) => (
          <button
            key={day}
            className={`tt-day-btn ${
              activeDay === day ? "active" : ""
            }`}
            onClick={() => setActiveDay(day)}
          >
            {day}
          </button>
        ))}
      </div>
      </div>

      {/* VIEW MODE */}
      {!editing && (
        <><div>
      <header className="top-bar">
      <h2 style={{
      fontFamily: "Jura, sans-serif",
      fontSize: "22px",
      fontWeight: "600",
      color: "#000",
      margin: 0,
    }}>Planner</h2>
      </header>
          <div className="tt-header">
            <h2>{activeDay}</h2>
            <button className="tt-secondary-btn" onClick={editTimetable}>
              Edit
            </button>
          </div>

          {(savedWeek[activeDay] || []).map((cls, idx) => (
            <div className="tt-class-card" key={idx}>
              <h3>{cls.subject}</h3>
              <p>
                {formatTime(cls.start)} – {formatTime(cls.end)}
              </p>
              {cls.venue && <span>{cls.venue}</span>}
            </div>
          ))}

          {!savedWeek[activeDay] && (
            <p className="tt-empty-text">No classes scheduled.</p>
          )}
          </div>
        </>
      )}

      {/* EDIT MODE */}
      {editing && (
        <><div>
      <header className="top-bar">
      <h2 style={{
      fontFamily: "Jura, sans-serif",
      fontSize: "22px",
      fontWeight: "600",
      color: "#000",
      margin: 0,
    }}>Planner</h2>
      </header>
          <h2>Edit {activeDay}</h2>

          <div className="tt-slot-grid">
            {weekSlots[activeDay].map((slot, index) => (
              <div className="tt-slot-card" key={index}>
                <div className="tt-time">
                  {formatTime(slot.start)} – {formatTime(slot.end)}
                </div>

                <input
                  type="text"
                  placeholder="Subject"
                  value={slot.subject}
                  onChange={(e) =>
                    handleChange(activeDay, index, "subject", e.target.value)
                  }
                />

                <input
                  type="text"
                  placeholder="Venue / Prof (optional)"
                  value={slot.venue}
                  onChange={(e) =>
                    handleChange(activeDay, index, "venue", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
          </div>

          <button className="tt-primary-btn" onClick={saveTimetable}>
            Save Timetable
          </button>
        </>
      )}
    
    </div>
  );
}
