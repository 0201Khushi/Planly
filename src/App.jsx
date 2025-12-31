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
       <div className="app-container">
      
      {/* TOP BAR */}
      <header className="top-bar">
        <img src={logo} alt="Planly" className="top-logo" />
        <FiSettings className="settings-icon" />
      </header>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <p>Your content will go here</p>
      </main>

    </div>

    </div>
  );
}

export default App;
