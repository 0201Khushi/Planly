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
  const [quote, setQuote] = useState();
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

    // If attendance record exists
    if (r && r.total > 0) {
      const currentPct = (r.attended / r.total) * 100;
      const pctIfAbsent =
        (r.attended / (r.total + 1)) * 100;

      return (
        currentPct < TARGET_ATTENDANCE ||
        pctIfAbsent < TARGET_ATTENDANCE
      );
    }

    // If no record exists yet → assume first class must be attended
    return true;
  })
);

  }, []);
  const attendanceState =
  mustAttend.length === 0 ? "confirmation" : "critical";

  return (
    <div className="home">

      {/* HEADER */}
      <div className="header">
        <p className="greeting">{getGreeting()}</p>
        <p className="quote">{quote}</p>
      </div>

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-title">Today’s Classes</p>
          <p className="stat-number" style={{
      fontSize: "36px",
      color: "#000",
    }}>{todayClasses.length}</p>
        </div>

        <div className="stat-card">
          <p className="stat-title">Deadlines Today</p>
          <p className="stat-number" style={{
      fontSize: "36px",
      color: "#000",
    }}>{todayDeadlines.length}</p>
        </div>
      </div>

      {/* UPCOMING DEADLINES */}
      <div className="card">
        <p className="Upcoming">Upcoming Deadlines</p>

        <div className="two-col">
          <div>
            <p className="label">Today</p>
            {todayDeadlines.length ? (
              todayDeadlines.map(t => (
                <p key={t.id} className="item">{t.title}</p>
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
      <div className={`card ${attendanceState}`}>
        <p className="must">Must-Attend Classes</p>
        

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
          <p className="muted">Attendance is currently within safe limits
</p>
        )}
      </div>
      {/* HELP & FEEDBACK */}
<div className="card feedback-card">
  <p className="feedback-title">Help & Feedback</p>

  <div className="feedback-options">
    <a
    href="https://forms.gle/f9yKWS2sLUn3qejn7"
    target="_blank"
    rel="noopener noreferrer"
    className="feedback-link"
  >
   <p className="feedback-btn">
  Feedback
  
</p>
</a>
    <a
    href="mailto:planly.team@gmail.com"
    className="feedback-link"
  >
  <p className="feedback-btn">
  Contact us
</p>
</a>

  </div>
</div>


    </div>
  );
}
