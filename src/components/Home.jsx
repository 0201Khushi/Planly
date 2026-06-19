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
        <p className="date-display">{getFormattedDate()}</p>
      </div>
      

      {/* STATS */}
      <div className="stats-row">
        <div className="stat-card">
          <p className="stat-title">Today's Classes</p>
          <p className="stat-number">{todayClasses.length}</p>
        </div>

        <div className="stat-card">
          <p className="stat-title">Deadlines Today</p>
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
