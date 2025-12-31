import './App.css';
import logo from './assets/logo.png';

function App() {
  return (
    <div className="app-root">
      <div className="container"> 
         <div style={{ maxWidth: "200px" }}>
       <img src={logo} alt="logo" /></div>
      </div>
      {/* Desktop Message */}
      <div className="desktop-message" >
        <p>This app is designed for mobile devices.</p>
        <p>Please open this link on your phone 📱</p>
      </div>

      {/* Mobile App */}
      <div className="mobile-app">
        <h1>Planly</h1>
        <p>Your smart planning companion.</p>
      </div>

    </div>
  );
}

export default App;
