import { useEffect, useState } from "react";
import "./Home.css";

/* ------------------ CONSTANTS ------------------ */
const PLANNER_KEY = "planly_planner_data";
const ATTENDANCE_KEY = "planly_attendance";
const TIMETABLE_KEY = "planly_savedWeek";
const TARGET_ATTENDANCE = 75;

const QUOTES = [
  "Discipline beats motivation every single day.",
  "Clarity comes before speed.",
  "Small actions, done daily, change everything.",
  "Focus on execution, not perfection.",
  "You are exactly where your habits placed you.",
];

/* ------------------ HELPERS ------------------ */
const todayMidnight = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
})();

const tomorrowMidnight = todayMidnight + 86400000;

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const getTodayDay = () => {
  return ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];
};

/* ------------------ COMPONENT ------------------ */
export default function Home() {
  const [quote, setQuote] = useState("");

  const [todayClasses, setTodayClasses] = useState([]);
  const [todayDeadlines, setTodayDeadlines] = useState([]);
  const [tomorrowDeadlines, setTomorrowDeadlines] = useState([]);
  const [mustAttend, setMustAttend] = useState([]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    /* ---------- LOAD DATA ---------- */
    const planner =
      JSON.parse(localStorage.getItem(PLANNER_KEY)) || [];
    const attendance =
      JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};
    const timetable =
      JSON.parse(localStorage.getItem(TIMETABLE_KEY)) || {};

    /* ---------- DEADLINES ---------- */
    const todayD = planner.filter(
      t => t.date >= todayMidnight && t.date < tomorrowMidnight
    );

    const tomorrowD = planner.filter(
      t =>
        t.date >= tomorrowMidnight &&
        t.date < tomorrowMidnight + 86400000
    );

    setTodayDeadlines(todayD);
    setTomorrowDeadlines(tomorrowD);

    /* ---------- TODAY CLASSES ---------- */
    const day = getTodayDay();
    const classes = timetable[day] || [];
    setTodayClasses(classes);

    /* ---------- MUST ATTEND LOGIC ---------- */
    const must = classes.filter(cls => {
      const record = attendance[cls.subject];
      if (!record || record.total === 0) return true;

      const currentPct =
        (record.attended / record.total) * 100;

      const pctIfAbsent =
        (record.attended / (record.total + 1)) * 100;

      return (
        currentPct < TARGET_ATTENDANCE ||
        pctIfAbsent < TARGET_ATTENDANCE
      );
    });

    setMustAttend(must);
  }, []);

  return (
    <div className="home-page">

      {/* Greeting */}
      <h1 className="greeting">
        {getGreeting()}, Khushi
      </h1>

      {/* Quote */}
      <p className="quote">“{quote}”</p>

      {/* Today Classes */}
      <div className="home-card">
        <h3>📚 Today’s Classes</h3>
        <p>
          Total classes scheduled:{" "}
          <strong>{todayClasses.length}</strong>
        </p>
      </div>

      {/* Deadlines */}
      <div className="home-card">
        <h3>⏰ Deadlines & Events</h3>

        <div className="deadline-block">
          <h4>Today</h4>
          {todayDeadlines.length ? (
            todayDeadlines.map(t => (
              <li key={t.id}>{t.title}</li>
            ))
          ) : (
            <p className="muted">No deadlines today</p>
          )}
        </div>

        <div className="deadline-block">
          <h4>Tomorrow</h4>
          {tomorrowDeadlines.length ? (
            tomorrowDeadlines.map(t => (
              <li key={t.id}>{t.title}</li>
            ))
          ) : (
            <p className="muted">No deadlines tomorrow</p>
          )}
        </div>
      </div>

      {/* Must Attend */}
      <div className="home-card danger">
        <h3>⚠️ Classes You MUST Attend Today</h3>

        {mustAttend.length ? (
          mustAttend.map((cls, i) => (
            <div key={i} className="must-attend-row">
              <span>{cls.subject}</span>
              <span className="badge">Critical</span>
            </div>
          ))
        ) : (
          <p className="muted">No attendance risk today 🎉</p>
        )}
      </div>

    </div>
  );
}
