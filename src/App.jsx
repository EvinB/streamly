import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';

function App() {
  const style = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',  // centers vertically in a column layout
    alignItems: 'center',       // centers horizontally
    height: '100vh',
    width: '100vw',
    textAlign: 'center',
    margin: 0,
    padding: 0,
  };

  return (
    <Router>
      <div style={style}>
        <h1>Streamly</h1>
        <div>
          <Link to="/register">
            <button style={{ margin: '10px', padding: '10px 20px' }}>Register</button>
          </Link>
          <Link to="/login">
            <button style={{ margin: '10px', padding: '10px 20px' }}>Login</button>
          </Link>
        </div>
      </div>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
