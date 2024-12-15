import React, { useState } from 'react';
import axios from 'axios';

const Login = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', {
        user_name: userName,
        password,
      });
      setMessage(response.data.message); // Display server message
    } catch (error) {
      if (error.response && error.response.data.message) {
        setMessage(error.response.data.message); // Display specific error message
      } else {
        setMessage('Error logging in. Please try again.');
      }
    }
  };
  

  const style = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    textAlign: 'center',
    margin: 0,
    padding: 0,
  };

  const formStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px', // Increased gap for spacing
    width: '300px', // Increase form width
  };

  const inputStyle = {
    padding: '15px', // Increase padding to make inputs larger
    fontSize: '18px', // Larger text
    border: '1px solid #444',
    borderRadius: '5px',
    textAlign: 'center',
    outline: 'none',
  };

  const buttonStyle = {
    padding: '15px 20px', // Larger padding for the button
    fontSize: '18px', // Larger button text
    backgroundColor: '#000',
    color: '#fff',
    border: '1px solid #444',
    borderRadius: '5px',
    cursor: 'pointer',
  };

  return (
    <div style={style}>
      <h2 style={{ fontSize: '32px' }}>Login</h2> {/* Larger heading */}
      <form onSubmit={handleLogin} style={formStyle}>
        <input
          type="text"
          placeholder="Username"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={inputStyle}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />
       <button style={{ margin: '10px', padding: '10px 20px' }}>
         Login
       </button>
      </form>
      {message && <p style={{ fontSize: '18px', marginTop: '10px' }}>{message}</p>}
    </div>
  );
};

export default Login;
