import { useState, useEffect } from "react";
import { FiClock, FiX, FiRotateCcw, FiEdit, FiMoreVertical } from "react-icons/fi";
import "./Timetable.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const START_HOUR = 8;
const END_HOUR = 18;

/* ---------------- HELPERS ---------------- */

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
  const totalMinutes = Math.round(hour * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const period = h >= 12 ? "PM" : "AM";
  const displayHour = h % 12 === 0 ? 12 : h % 12;
  const minutes = String(m).padStart(2, "0");
  return `${displayHour}:${minutes} ${period}`;
};

const getDateForDayName = (dayName) => {
  const today = new Date();
  const dayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };

  const targetIndex = dayMap[dayName];
  const currentIndex = today.getDay();
  let diff = targetIndex - currentIndex;
  if (diff < 0) diff += 7;

  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result.toISOString().slice(0, 10);
};

/* ---------------- COMPONENT ---------------- */

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
  const [dailyOverrides, setDailyOverrides] = useState(() => {
    const stored = sessionStorage.getItem("planly_timetableOverrides");
    return stored ? JSON.parse(stored) : {};
  });
  const [postponePicker, setPostponePicker] = useState(null);
  const [openMenuIndex, setOpenMenuIndex] = useState(null);

  /* -------- LOAD FROM STORAGE -------- */
  useEffect(() => {
    const storedWeek = localStorage.getItem("planly_savedWeek");
    const storedSlots = localStorage.getItem("planly_weekSlots");

    if (storedWeek) setSavedWeek(JSON.parse(storedWeek));
    if (storedSlots) setWeekSlots(JSON.parse(storedSlots));
  }, []);

  useEffect(() => {
    sessionStorage.setItem(
      "planly_timetableOverrides",
      JSON.stringify(dailyOverrides)
    );
  }, [dailyOverrides]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".tt-menu-container")) {
        setOpenMenuIndex(null);
      }
    };

    if (openMenuIndex !== null) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [openMenuIndex]);

  /* -------- HANDLERS -------- */

  const handleChange = (day, index, field, value) => {
    const updated = { ...weekSlots };
    updated[day][index][field] = value;
    setWeekSlots(updated);
  };
const syncSubjectsToAttendance = (weekSlots) => {
  const SUBJECTS_KEY = "planly_subjects";
  const ATTENDANCE_KEY = "planly_attendance";

  // collect subjects from timetable
  const timetableSubjects = new Set();

  Object.values(weekSlots).forEach((daySlots) => {
    daySlots.forEach((slot) => {
      if (slot.subject?.trim()) {
        timetableSubjects.add(slot.subject.trim());
      }
    });
  });

  if (timetableSubjects.size === 0) return;

  // load existing attendance data
  const existingSubjects =
    JSON.parse(localStorage.getItem(SUBJECTS_KEY)) || [];

  const attendance =
    JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};

  const normalizedExisting = existingSubjects.map((s) =>
    s.trim().toLowerCase()
  );

  let changed = false;

  timetableSubjects.forEach((subject) => {
    const normalized = subject.toLowerCase();

    if (!normalizedExisting.includes(normalized)) {
      // add new subject
      existingSubjects.push(subject);
      attendance[subject] = { attended: 0, total: 0 };
      changed = true;
    }
  });

  if (changed) {
    localStorage.setItem(
      SUBJECTS_KEY,
      JSON.stringify(existingSubjects)
    );
    localStorage.setItem(
      ATTENDANCE_KEY,
      JSON.stringify(attendance)
    );
  }
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
    syncSubjectsToAttendance(weekSlots);
    setSavedWeek(mergedWeek);
    setEditing(false);
  };

  const resetTimetable = () => {
    if (!window.confirm("This will erase your entire timetable.")) return;

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

  const today = new Date();
  const todayDateText = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
  const todayDay = getTodayDay();
  const todayDateKey = getDateForDayName(todayDay);
  const todayOverrides = dailyOverrides[todayDateKey] || {
    cancelled: [],
    postponed: {},
  };

  const todayDisplayClasses = (savedWeek[todayDay] || [])
    .map((cls, idx) => {
      if (todayOverrides.cancelled.includes(idx)) return null;
      const postponed = todayOverrides.postponed[idx];
      return postponed ? { ...cls, ...postponed } : cls;
    })
    .filter(Boolean);

  const todaySlots = weekSlots[todayDay] || [];
  const classesToday = todayDisplayClasses.length;
  const hoursScheduledToday = todayDisplayClasses.reduce(
    (sum, slot) => (slot.subject?.trim() ? sum + (slot.end - slot.start) : sum),
    0
  );

  const activeDateKey = getDateForDayName(activeDay);
  const activeOverrides = dailyOverrides[activeDateKey] || {
    cancelled: [],
    postponed: {},
  };

  const displayClasses = (savedWeek[activeDay] || [])
    .map((cls, idx) => ({ ...cls, originalIndex: idx }))
    .map((cls) => {
      if (activeOverrides.cancelled.includes(cls.originalIndex)) return null;
      const postponed = activeOverrides.postponed[cls.originalIndex];
      return postponed ? { ...cls, ...postponed } : cls;
    })
    .filter(Boolean);

  const openPostponePanel = (index) => {
    const cls = (savedWeek[activeDay] || [])[index];
    if (!cls) return;
    const durationMinutes = (cls.end - cls.start) * 60;
    setPostponePicker({
      index,
      durationMinutes,
      selectedStartMinutes: cls.start * 60,
      selectedEndMinutes: cls.end * 60,
      minStartMinutes: START_HOUR * 60,
      maxStartMinutes: END_HOUR * 60 - durationMinutes,
    });
  };

  const confirmPostpone = () => {
    if (!postponePicker) return;
    const { index, durationMinutes, selectedStartMinutes } = postponePicker;
    setDailyOverrides((prev) => {
      const current = prev[activeDateKey] || {
        cancelled: [],
        postponed: {},
      };
      return {
        ...prev,
        [activeDateKey]: {
          ...current,
          postponed: {
            ...current.postponed,
            [index]: {
              start: selectedStartMinutes / 60,
              end: (selectedStartMinutes + durationMinutes) / 60,
            },
          },
        },
      };
    });
    setPostponePicker(null);
  };

  const cancelPostpone = () => {
    setPostponePicker(null);
  };

  const cancelClass = (index) => {
    setDailyOverrides((prev) => {
      const current = prev[activeDateKey] || {
        cancelled: [],
        postponed: {},
      };
      return {
        ...prev,
        [activeDateKey]: {
          ...current,
          cancelled: Array.from(new Set([...current.cancelled, index])),
        },
      };
    });
  };

  /* ---------------- RENDER ---------------- */

  return (
    <div className="timetable-page">
      {/* TOP BAR */}
      <header className="top-bar">
      <h2 style={{
      fontSize: "22px",
      fontWeight: "200",
      color: "#000",
      margin: 0,
    }}>Timetable</h2>
    </header>

      {/* SCROLL AREA */}
      <div className="tt-scroll">
        <div className="timetable-summary-card">
          <div className="summary-text">
            <p className="summary-label">Today's Schedule</p>
            <p className="summary-date">{todayDateText}</p>
            <div className="summary-metrics">
              <div>
                <span>{classesToday}</span>
                <small>Classes today</small>
              </div>
              <div>
                <span>{hoursScheduledToday}</span>
                <small>Hours scheduled</small>
              </div>
            </div>
          </div>
          <svg
            className="summary-clock-graphic"
            width="84"
            height="84"
            viewBox="0 0 84 84"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="42" cy="42" r="32" fill="white" opacity="0.15" />
            <circle cx="42" cy="42" r="20" fill="white" opacity="0.22" />
            <path d="M42 30V42L50 46" stroke="white" strokeWidth="4" strokeLinecap="round" />
            <circle cx="42" cy="42" r="2" fill="white" />
          </svg>
        </div>
        {/* DAY TABS (always visible) */}
        <div className="tt-days-card">
          <div className="tt-days">
            {DAYS.map((day) => (
              <button
                key={day}
                className={`tt-day-btn ${activeDay === day ? "active" : ""}`}
                onClick={() => setActiveDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

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

        {/* VIEW MODE */}
        {hasAnyTimetable && !editing && (
          <>
            <div className="tt-header">
              <button className="tt-danger-btn" onClick={resetTimetable}>
                <FiRotateCcw size={16} className="tt-reset-icon" />
                Reset
              </button>
              <button
                className="tt-secondary-btn"
                onClick={() => setEditing(true)}
              >
                <FiEdit size={16} className="tt-edit-icon" />
                Edit
              </button>
            </div>

            {displayClasses.map((cls) => (
              <div
                key={cls.originalIndex}
                className={`tt-class-card ${getClassStatus(
                  cls.start,
                  cls.end,
                  activeDay === getTodayDay()
                )}`}
              >
                <div>
                  <h3 style={{
      fontWeight: "600",fontFamily:"Inter"
       }} >{cls.subject}</h3>
                  <p>
                    {formatTime(cls.start)} – {formatTime(cls.end)}
                  </p>
                  {cls.venue && <span>{cls.venue}</span>}
                </div>
                <div className="tt-class-actions">
                  <div className="tt-menu-container">
                    <button 
                      className="tt-menu-btn"
                      onClick={() => setOpenMenuIndex(openMenuIndex === cls.originalIndex ? null : cls.originalIndex)}
                    >
                      <FiMoreVertical size={16} />
                    </button>
                    {openMenuIndex === cls.originalIndex && (
                      <div className="tt-dropdown-menu">
                        <button 
                          className="tt-menu-item"
                          onClick={() => {
                            openPostponePanel(cls.originalIndex);
                            setOpenMenuIndex(null);
                          }}
                        >
                          <FiClock size={14} />
                          Postpone
                        </button>
                        <button 
                          className="tt-menu-item cancel"
                          onClick={() => {
                            cancelClass(cls.originalIndex);
                            setOpenMenuIndex(null);
                          }}
                        >
                          <FiX size={14} />
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {postponePicker?.index === cls.originalIndex && (
                  <div className="tt-postpone-panel">
                    <label>
                      Start time:
                      <input
                        type="time"
                        value={`${String(Math.floor(postponePicker.selectedStartMinutes / 60)).padStart(2, "0")}:${String(postponePicker.selectedStartMinutes % 60).padStart(2, "0")}`}
                        min={`${String(Math.floor(postponePicker.minStartMinutes / 60)).padStart(2, "0")}:${String(postponePicker.minStartMinutes % 60).padStart(2, "0")}`}
                        max={`${String(Math.floor(postponePicker.maxStartMinutes / 60)).padStart(2, "0")}:${String(postponePicker.maxStartMinutes % 60).padStart(2, "0")}`}
                        step="60"
                        onChange={(e) => {
                          const [h, m] = e.target.value.split(":");
                          const total = Number(h) * 60 + Number(m);
                          setPostponePicker((prev) => ({
                            ...prev,
                            selectedStartMinutes: total,
                          }));
                        }}
                      />
                    </label>
                    <div className="tt-postpone-actions">
                      <button className="tt-postpone-confirm" onClick={confirmPostpone}>
                        Save
                      </button>
                      <button className="tt-postpone-cancel" onClick={cancelPostpone}>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {!savedWeek[activeDay] && (
              <p className="tt-empty-text">No classes scheduled.</p>
            )}
          </>
        )}

        {/* EDIT MODE (ALWAYS RENDERS WHEN editing=true) */}
        {editing && (
          <>
            <div className="top-section">
              <h2 style={{
      fontSize: "22px",
      color: "#000",
      
    }}>Edit {activeDay}</h2>
              <button className="tt-primary-btn" onClick={saveTimetable}>
                Save Timetable
              </button>
            </div>

            <div className="tt-slot-grid">
              {weekSlots[activeDay]?.map((slot, index) => (
                <div className="tt-slot-card" key={index}>
                  <div className="tt-time">
                    {formatTime(slot.start)} – {formatTime(slot.end)}
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
                    placeholder="Venue / Prof (optional)"
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
      </div>
    </div>
  );
}
