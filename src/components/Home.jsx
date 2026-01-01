
function Home() {
  // --- Greeting Logic ---
  const hour = new Date().getHours();
  let greeting = "Good Morning";

  if (hour >= 12 && hour < 17) greeting = "Good Afternoon";
  else if (hour >= 17) greeting = "Good Evening";

  // --- Quotes ---
  const quotes = [
    "Small steps every day lead to big results.",
    "Discipline beats motivation.",
    "Focus on progress, not perfection.",
    "Consistency is the real superpower.",
    "Your future self will thank you."
  ];

  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  // --- Mock Data (can be dynamic later) ---
  const todayData = {
    classes: 5,
    deadlines: 3,
    meetings: 2,
    lowAttendance: 1
  };

  return (
    <div className="home-container">

      {/* Greeting */}
      <h2 className="home-greeting">{greeting} 👋</h2>
      <p className="home-quote">"{randomQuote}"</p>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{todayData.classes}</h3>
          <p>Classes Today</p>
        </div>

        <div className="stat-card">
          <h3>{todayData.deadlines}</h3>
          <p>Deadlines</p>
        </div>

        <div className="stat-card">
          <h3>{todayData.meetings}</h3>
          <p>Meetings</p>
        </div>

        <div className="stat-card warning">
          <h3>{todayData.lowAttendance}</h3>
          <p>Low Attendance</p>
        </div>
      </div>
    </div>
  );
}

export default Home;
