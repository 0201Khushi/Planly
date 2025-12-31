function App() {
  const isMobile = window.innerWidth <= 768;

  if (!isMobile) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: "20px",
          fontFamily: "sans-serif",
        }}
      >
        <h2>📱 Planly</h2>
        <p>
          This app is designed for mobile devices.<br />
          Please open it on your phone.
        </p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Planly</h2>
      <p>Your smart student planner.</p>
    </div>
  );
}

export default App;
