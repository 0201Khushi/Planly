import './App.css';
import logo from './assets/logo.png';

function App() {
  return (
    <div className="app-root">
      {/* Desktop Message */}
      <div className="desktop-message" >
        <div className="container"> 
          <img src={logo} alt="logo" />
        </div>
        <p>This app is designed for <b>mobile devices</b></p>
        <p>Please open this link on your <b>phone</b>📱</p>
      </div>

      {/* Mobile App */}
      <div className="mobile-app">
        <div className="page-wrapper">
        {/* TOP BAR */}
        <header className="top-bar">
        </header>

        {/* MAIN CONTENT */}
        <main className="app-content">
          <h2>Planly</h2>
          <p>Your smart planning companion.</p>
        </main>
      </div>

    </div>
    </div>
  );
}

export default App;
