import React from 'react';

const Dashboard = () => {
  const handleLogout = () => {
    // Clear user data and redirect to login page
    localStorage.removeItem('user'); // Remove stored user data
    window.location.href = '/'; // Redirect to login page
  };

  const style = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      position: 'relative',
    },
    logoutButton: {
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '10px 20px',
      backgroundColor: '#ff4d4d',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
      fontSize: '16px',
    },
    placeholder: {
      fontSize: '24px',
      color: '#555',
    },
  };

  return (
    <div style={style.container}>
      <button style={style.logoutButton} onClick={handleLogout}>
        Logout
      </button>
      <div style={style.placeholder}>Welcome to the Main Page!</div>
    </div>
  );
};

export default Dashboard;
