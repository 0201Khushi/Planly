import { useEffect, useState } from "react";
import "./Home.css";

const PLANNER_KEY = "planly_planner_data";
const ATTENDANCE_KEY = "planly_attendance";
const TIMETABLE_KEY = "planly_savedWeek";
const TARGET_ATTENDANCE = 75;

const QUOTES = [
  "Precision is the soul of discipline.",
  "Clarity creates momentum.",
  "Consistency compounds quietly.",
  "Focus is a competitive advantage.",
];

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

const getTodayDay = () =>
  ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];

export default function Home() {
  const [quote, setQuote] = useState("");
  const [todayClasses, setTodayClasses] = useState([]);
  const [todayDeadlines, setTodayDeadlines] = useState([]);
  const [tomorrowDeadlines, setTomorrowDeadlines] = useState([]);
  const [mustAttend, setMustAttend] = useState([]);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    const planner =
      JSON.parse(localStorage.getItem(PLANNER_KEY)) || [];
    const attendance =
      JSON.parse(localStorage.getItem(ATTENDANCE_KEY)) || {};
    const timetable =
      JSON.parse(localStorage.getItem(TIMETABLE_KEY)) || {};

    setTodayDeadlines(
      planner.filter(
        t => t.date >= todayMidnight && t.date < tomorrowMidnight
      )
    );

    setTomorrowDeadlines(
      planner.filter(
        t =>
          t.date >= tomorrowMidnight &&
          t.date < tomorrowMidnight + 86400000
      )
    );

    const classes = timetable[getTodayDay()] || [];
    setTodayClasses(classes);

    setMustAttend(
      classes.filter(cls => {
        const r = attendance[cls.subject];
        if (!r || r.total === 0) return true;
        const pct = (r.attended / r.total) * 100;
        const pctIfAbsent =
          (r.attended / (r.total + 1)) * 100;
        return pct < TARGET_ATTENDANCE || pctIfAbsent < TARGET_ATTENDANCE;
      })
    );
  }, []);

  return (
    <div className="home">

      {/* HEADER */}
      <div className="header">
        <h1 className="greeting">{getGreeting()}</h1>
        <p className="quote">“{quote}”</p>
      </div>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-title">Today’s Classes</p>
          <p className="stat-number">{todayClasses.length}</p>
          <p className="stat-sub">Scheduled</p>
        </div>

        <div className="stat-card">
          <p className="stat-title">Deadlines Today</p>
          <p className="stat-number">{todayDeadlines.length}</p>
          <p className="stat-sub">Pending</p>
        </div>
      </div>

      {/* UPCOMING DEADLINES */}
      <div className="card">
        <h3>Upcoming Deadlines</h3>

        <div className="two-col">
          <div>
            <p className="label">Today</p>
            {todayDeadlines.length ? (
              todayDeadlines.map(t => (
                <p key={t.id} className="item">• {t.title}</p>
              ))
            ) : (
              <p className="muted">Nothing due</p>
            )}
          </div>

          <div>
            <p className="label">Tomorrow</p>
            {tomorrowDeadlines.length ? (
              tomorrowDeadlines.map(t => (
                <p key={t.id} className="item">• {t.title}</p>
              ))
            ) : (
              <p className="muted">Nothing else due</p>
            )}
          </div>
        </div>
      </div>

      {/* MUST ATTEND */}
      <div className="card danger">
        <h3>Must-Attend Classes</h3>
        <p className="subtext">
          These sessions are required to maintain your 75% threshold.
        </p>

        {mustAttend.length ? (
          mustAttend.map((cls, i) => (
            <div key={i} className="must-row">
              <div>
                <p className="subject">{cls.subject}</p>
                <p className="time">
                  {cls.start}:00 – {cls.end}:00
                </p>
              </div>
              <span className="critical">Critical</span>
            </div>
          ))
        ) : (
          <p className="muted">Attendance is safe today 🎉</p>
        )}
      </div>

    </div>
  );
}
