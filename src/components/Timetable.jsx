import { useState, useEffect } from "react";
import "./Timetable.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_HOUR = 8;
const END_HOUR = 18;

const getTodayDay = () => {
  const todayIndex = new Date().getDay();
  const map = {
    0: "Sun",
    1: "Mon",
    2: "Tue",
    3: "Wed",
    4: "Thu",
    5: "Fri",
    6: "Sat",
  };
  return map[todayIndex];
};

const getClassStatus = (start, end, isToday) => {
  if (!isToday) return "neutral";

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  if (currentHour >= end) return "past";
  if (currentHour >= start && currentHour < end) return "ongoing";
  return "upcoming";
};

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
  const [activeDay, setActiveDay] = useState(getTodayDay());
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
    if (storedSlots) setWeekSlots(JSON.parse(storedSlots));
  }, []);

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

    localStorage.setItem("planly_savedWeek", JSON.stringify(mergedWeek));
    localStorage.setItem("planly_weekSlots", JSON.stringify(weekSlots));

    setSavedWeek(mergedWeek);
    setEditing(false);
  };

  const resetTimetable = () => {
    if (!window.confirm("Reset entire timetable?")) return;

    localStorage.removeItem("planly_savedWeek");
    localStorage.removeItem("planly_weekSlots");

    setSavedWeek({});
    setWeekSlots(
      DAYS.reduce((acc, day) => {
        acc[day] = generateSlots();
        return acc;
      }, {})
    );
    setEditing(false);
    setActiveDay(getTodayDay());
  };

  const hasAnyTimetable = Object.keys(savedWeek).length > 0;

  return (
    <div className="timetable-page">
      {/* TOP BAR */}
      <header className="top-bar">
        <h2>Planner</h2>
      </header>

      {/* SCROLL AREA */}
      <div className="tt-scroll">
        {/* EMPTY STATE */}
        {!hasAnyTimetable && !editing && (
          <div className="tt-container">
            <p className="tt-empty-text">Your timetable is empty.</p>
            <button
              className="tt-primary-btn"
              onClick={() => setEditing(true)}
            >
              Add Timetable
            </button>
          </div>
        )}

        {hasAnyTimetable && (
          <>
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

            {/* VIEW MODE */}
            {!editing && (
              <>
                <div className="tt-header">
                  <button
                    className="tt-danger-btn"
                    onClick={resetTimetable}
                  >
                    Reset
                  </button>
                  <button
                    className="tt-secondary-btn"
                    onClick={() => setEditing(true)}
                  >
                    Edit
                  </button>
                </div>

                {(savedWeek[activeDay] || []).map((cls, idx) => (
                  <div
                    key={idx}
                    className={`tt-class-card ${getClassStatus(
                      cls.start,
                      cls.end,
                      activeDay === getTodayDay()
                    )}`}
                  >
                    <h3>{cls.subject}</h3>
                    <p>
                      {formatTime(cls.start)} – {formatTime(cls.end)}
                    </p>
                    {cls.venue && <span>{cls.venue}</span>}
                  </div>
                ))}
              </>
            )}

            {/* EDIT MODE */}
            {editing && (
              <>
                <div className="top-section">
                  <h2>Edit {activeDay}</h2>
                  <button
                    className="tt-primary-btn"
                    onClick={saveTimetable}
                  >
                    Save Timetable
                  </button>
                </div>

                <div className="tt-slot-grid">
                  {weekSlots[activeDay]?.map((slot, index) => (
                    <div className="tt-slot-card" key={index}>
                      <div className="tt-time">
                        {formatTime(slot.start)} –{" "}
                        {formatTime(slot.end)}
                      </div>

                      <input
                        placeholder="Subject"
                        value={slot.subject}
                        onChange={(e) =>
                          handleChange(
                            activeDay,
                            index,
                            "subject",
                            e.target.value
                          )
                        }
                      />

                      <input
                        placeholder="Venue / Prof"
                        value={slot.venue}
                        onChange={(e) =>
                          handleChange(
                            activeDay,
                            index,
                            "venue",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
