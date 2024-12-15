import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/register', {
        user_name: userName,
        password,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Error registering');
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
    gap: '20px',
    width: '300px',
  };

  const inputStyle = {
    padding: '15px',
    fontSize: '18px',
    border: '1px solid #444',
    borderRadius: '5px',
    textAlign: 'center',
    outline: 'none',
  };


  return (
    <div style={style}>
      <h2 style={{ fontSize: '32px' }}>Register</h2>
      <form onSubmit={handleRegister} style={formStyle}>
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
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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

export default Register;
