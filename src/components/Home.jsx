import { useEffect, useState } from "react";
import "./Home.css";

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
  ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date().getDay()];

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
      <section className="hero">
        <h1>{getGreeting()}, Khushi</h1>
        <p className="quote">“{quote}”</p>
      </section>

      {/* TODAY OVERVIEW */}
      <section className="grid">
        <div className="card stat">
          <h3>Today’s Classes</h3>
          <p className="big">{todayClasses.length}</p>
        </div>

        <div className="card stat">
          <h3>Deadlines Today</h3>
          <p className="big">{todayDeadlines.length}</p>
        </div>
      </section>

      {/* DEADLINES */}
      <section className="card">
        <h3>Deadlines & Events</h3>

        <div className="two-col">
          <div>
            <span className="label">Today</span>
            {todayDeadlines.length ? (
              todayDeadlines.map(t => (
                <p key={t.id} className="item">{t.title}</p>
              ))
            ) : (
              <p className="muted">Nothing due today</p>
            )}
          </div>

          <div>
            <span className="label">Tomorrow</span>
            {tomorrowDeadlines.length ? (
              tomorrowDeadlines.map(t => (
                <p key={t.id} className="item">{t.title}</p>
              ))
            ) : (
              <p className="muted">No deadlines tomorrow</p>
            )}
          </div>
        </div>
      </section>

      {/* MUST ATTEND */}
      <section className="card danger">
        <h3>Must-Attend Classes</h3>

        {mustAttend.length ? (
          mustAttend.map((cls, i) => (
            <div key={i} className="risk-row">
              <span>{cls.subject}</span>
              <span className="pill">Critical</span>
            </div>
          ))
        ) : (
          <p className="muted">Attendance is safe today 🎉</p>
        )}
      </section>

    </div>
  );
}
