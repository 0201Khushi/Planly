import { useEffect, useState } from "react";
import "./Home.css";

const PLANNER_KEY = "planly_planner_data";
const ATTENDANCE_KEY = "planly_attendance";
const TIMETABLE_KEY = "planly_savedWeek";
const TARGET_ATTENDANCE = 75;

const QUOTES = [
  "You don't have to carry it all in your head.",
  "Let your mind rest.",
  "Some things are better written down.",
  "Keep your thoughts. Lose the stress.",
  "Your brain deserves a break.",
"When everything has a place, nothing feels overwhelming.",
"Save your energy for what matters.",
"Less mental clutter. More mental space.",
"It's okay to slow down and organize.",
"Take a breath. We've got the details.",
"A calmer day starts here.",
"One less thing to worry about.",
"Planning doesn't have to feel stressful.",
"A little clarity goes a long way.",
"You are allowed to feel organized.",
"Today's chaos can be tomorrow's plan.",
"The day feels lighter when it's written down.",
"You don't need to figure it all out at once.",
"Keep your ideas safe.",
"A home for deadlines, ideas, and everything in between.",
"Because important things deserve to be remembered.",
"Store the details. Keep the focus.",
"Remember less. Live more.",
"You're closer than you think.",
"Small plans lead to big achievements.",
"One step is enough for today.",
"Progress starts with a plan.",
"Every organized day begins with a single note.",
"You already know what to do. Let's keep track of it.",
"A little planning can change a lot.",
"Future you will appreciate this.",
"The hardest part is starting.",
"You are more capable than your to-do list suggests.",
"Clear mind. Clear path.",
"Thoughtfully organized.",
"Make room for what matters.",
"Find clarity.",
"Plan with confidence.",
"Stay grounded.",
"Simple plans. Peaceful days.",
"Organized, effortlessly.",
"Everything in its place.",
"Clarity, one task at a time."
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

const getFormattedDate = () => {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric"
  });
};

export default function Home() {
  const [quote, setQuote] = useState();
  const [todayClasses, setTodayClasses] = useState([]);
  const [todayDeadlines, setTodayDeadlines] = useState([]);
  const [tomorrowDeadlines, setTomorrowDeadlines] = useState([]);
  const [mustAttend, setMustAttend] = useState([]);
  const [userName, setUserName] = useState("");
  const [tempName, setTempName] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);

    const storedName = localStorage.getItem("planly_user_name");
    if (storedName) {
      setUserName(storedName);
    } else {
      setShowPopup(true);
    }

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

  const handleNameSubmit = (e) => {
    e.preventDefault();
    const trimmed = tempName.trim();
    if (trimmed) {
      localStorage.setItem("planly_user_name", trimmed);
      setUserName(trimmed);
      setShowPopup(false);
    }
  };

  const attendanceState =
    mustAttend.length === 0 ? "confirmation" : "critical";

  return (
    <div className="home">
      {showPopup && (
        <div className="name-modal-overlay">
          <div className="name-modal-content">
            <h2 className="name-modal-title">Welcome to Planly</h2>
            <p className="name-modal-subtitle">What should I call you?</p>
            <form onSubmit={handleNameSubmit} className="name-modal-form">
              <input
                type="text"
                className="name-modal-input"
                placeholder="Enter your name"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
                required
              />
              <button
                type="submit"
                className="name-modal-btn"
                disabled={!tempName.trim()}
              >
                Continue
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      
      <div className="header">
        <p className="greeting">{getGreeting()}</p>
        {userName && <p className="username-display">{userName}</p>}
        <p className="quote">{quote}</p>
        <p className="date-display">
          <span className="date-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor">
              <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zm0-13H5V6h14v1z" />
            </svg>
          </span>
          {getFormattedDate()}
        </p>
        <div className="header-graphics" aria-hidden="true">
          <svg viewBox="0 0 220 140" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">
            <g fill="#ffffff">
              <circle cx="170" cy="34" r="30" opacity="0.16" />
              <circle cx="190" cy="70" r="22" opacity="0.14" />
              <circle cx="150" cy="88" r="16" opacity="0.12" />
              <circle cx="200" cy="110" r="10" opacity="0.10" />
              <circle cx="130" cy="46" r="18" opacity="0.13" />
            </g>
          </svg>
        </div>
      </div>
      

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-icon book-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor" aria-hidden="true">
                <path d="M4 5.5C4 4.12 5.12 3 6.5 3h11C18.88 3 20 4.12 20 5.5v13c0 .83-.67 1.5-1.5 1.5H6.5A1.5 1.5 0 0 1 5 18.5v-13zM6.5 5.5v13h11v-13h-11zm2.75 2.25c.28 0 .5.22.5.5v7.5c0 .28-.22.5-.5.5h-.75a.5.5 0 0 1-.5-.5v-7.5c0-.28.22-.5.5-.5h.75zm8.5 0c.28 0 .5.22.5.5v7.5c0 .28-.22.5-.5.5h-.75a.5.5 0 0 1-.5-.5v-7.5c0-.28.22-.5.5-.5h.75z" />
              </svg>
            </span>
            <p className="stat-title">Today's Classes</p>
          </div>
          <p className="stat-number">{todayClasses.length}</p>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-icon clock-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="7.25" />
                <path d="M12 7.5v4.5h3" />
              </svg>
            </span>
            <p className="stat-title">Deadlines Today</p>
          </div>
          <p className="stat-number">{todayDeadlines.length}</p>
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
      <div className="footer-links">
        <a
          href="https://forms.gle/f9yKWS2sLUn3qejn7"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
        >
          Feedback
        </a>
        <span className="footer-divider">•</span>
        <a
          href="mailto:planly.team@gmail.com"
          className="footer-link"
        >
          Contact us
        </a>
      </div>


    </div>
  );
}
