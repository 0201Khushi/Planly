
import { useState } from "react";
import "./Timetable.css";

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
  const [slots, setSlots] = useState(generateSlots());
  const [savedClasses, setSavedClasses] = useState([]);
  const [editing, setEditing] = useState(false);

  const handleChange = (index, field, value) => {
    const updated = [...slots];
    updated[index][field] = value;
    setSlots(updated);
  };

  const saveTimetable = () => {
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

    setSavedClasses(merged);
    setEditing(false);
  };

  const editTimetable = () => {
    const freshSlots = generateSlots();

    savedClasses.forEach((cls) => {
      for (let i = cls.start; i < cls.end; i++) {
        const index = i - START_HOUR;
        freshSlots[index].subject = cls.subject;
        freshSlots[index].venue = cls.venue;
      }
    });

    setSlots(freshSlots);
    setEditing(true);
  };

  // EMPTY STATE
  if (savedClasses.length === 0 && !editing) {
    return (
      <div className="timetable-page">

      {/* Header */}
      <header className="top-bar">
      <h2 style={{
      fontFamily: "Jura, sans-serif",
      fontSize: "22px",
      fontWeight: "600",
      color: "#000",
      margin: 0,
    }}>Timetable</h2>
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

  // VIEW MODE
  if (!editing) {
    return (
      <div className="timetable-page">

      {/* Header */}
      <header className="top-bar">
      <h2 style={{
      fontFamily: "Jura, sans-serif",
      fontSize: "22px",
      fontWeight: "600",
      color: "#000",
      margin: 0,
    }}>Timetable</h2>
      </header>
      <div className="tt-container">
        <div className="tt-header">
          <h2>Today</h2>
          <button className="tt-secondary-btn" onClick={editTimetable}>
            Edit
          </button>
        </div>

        {savedClasses.map((cls, idx) => (
          <div className="tt-class-card" key={idx}>
            <h3>{cls.subject}</h3>
            <p>
              {formatTime(cls.start)} – {formatTime(cls.end)}
            </p>
            {cls.venue && <span>{cls.venue}</span>}
          </div>
        ))}
      </div>
      </div>
    );
  }

  // EDIT MODE
  return (
    <div className="tt-container">
      <h2>Edit Timetable</h2>

      <div className="tt-slot-grid">
        {slots.map((slot, index) => (
          <div className="tt-slot-card" key={index}>
            <div className="tt-time">
              {formatTime(slot.start)} – {formatTime(slot.end)}
            </div>

            <input
              type="text"
              placeholder="Subject"
              value={slot.subject}
              onChange={(e) =>
                handleChange(index, "subject", e.target.value)
              }
            />

            <input
              type="text"
              placeholder="Venue / Prof (optional)"
              value={slot.venue}
              onChange={(e) =>
                handleChange(index, "venue", e.target.value)
              }
            />
          </div>
        ))}
      </div>

      <button className="tt-primary-btn" onClick={saveTimetable}>
        Save Timetable
      </button>
    </div>
  );
}
