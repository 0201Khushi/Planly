import { useState,useEffect } from "react";
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
const normalizeSubject = (name) =>
  name.trim().toLowerCase();

const syncSubjectsFromTimetable = (mergedWeek) => {
  // existing subjects (manual + auto)
  const existingSubjects =
    JSON.parse(localStorage.getItem("planly_subjects")) || [];

  const normalizedExisting = existingSubjects.map(normalizeSubject);
  const updatedSubjects = [...existingSubjects];

  // extract subjects from timetable
  Object.values(mergedWeek).forEach((dayClasses) => {
    dayClasses.forEach((cls) => {
      const subject = cls.subject.trim();
      if (!subject) return;

      const norm = normalizeSubject(subject);
      if (!normalizedExisting.includes(norm)) {
        updatedSubjects.push(subject);
        normalizedExisting.push(norm);
      }
    });
  });

  // save subjects
  localStorage.setItem(
    "planly_subjects",
    JSON.stringify(updatedSubjects)
  );

  // init attendance safely (do NOT reset)
  const attendance =
    JSON.parse(localStorage.getItem("planly_attendance")) || {};

  updatedSubjects.forEach((subj) => {
    if (!attendance[subj]) {
      attendance[subj] = { attended: 0, total: 0 };
    }
  });

  localStorage.setItem(
    "planly_attendance",
    JSON.stringify(attendance)
  );
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
  useEffect(() => {
    const storedWeek = localStorage.getItem("planly_savedWeek");
    const storedSlots = localStorage.getItem("planly_weekSlots");

    if (storedWeek) setSavedWeek(JSON.parse(storedWeek));

    if (storedSlots) {
      setWeekSlots(JSON.parse(storedSlots));
    } else {
      const fresh = DAYS.reduce((acc, day) => {
        acc[day] = generateSlots();
        return acc;
      }, {});
      setWeekSlots(fresh);
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("planly_savedWeek", JSON.stringify(savedWeek));
  }, [savedWeek]);

  useEffect(() => {
    localStorage.setItem("planly_weekSlots", JSON.stringify(weekSlots));
  }, [weekSlots]);

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
    syncSubjectsFromTimetable(mergedWeek);
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
         <div className="top-section">
          <h2  style={{color: "#000",}}>Edit {activeDay}</h2>
          <button className="tt-primary-btn" onClick={saveTimetable}>
            Save Timetable
          </button>
          </div>

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

          
        </>
      )}
    
    </div>
  );
}
