import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/'); // Redirect to root page if user is not logged in
    }
  }, [navigate]);

  const handleLogout = () => {
    // Clear user data and redirect to login page
    localStorage.removeItem('user'); // Remove stored user data
    navigate('/'); // Redirect to root page
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
    movieRecBox: {
        display: 'flex',
        alignItems: 'center',
        width: '80%', // Make it responsive
        height: '200px', // Fixed height
        border: '2px solid #444', // Add a visible border
        borderRadius: '10px',
        overflowX: 'auto', // Enable horizontal scrolling
        //backgroundColor: '#222', // Placeholder background color
        marginTop: '20px',
      },
  };

  const body = {
    display: 'flex',
    flexDirection: 'row', // Keep buttons side by side
    justifyContent: 'center', // Center buttons horizontally
    alignItems: 'flex-start', // Align to the top
    width: '100%', // Full container width
    padding: '20px 0', // Add space from the top
    gap: '20px', // Spacing between buttons
  };
  

  return (
    <div style={style.container}>
      <button style={style.logoutButton} onClick={handleLogout}>
        Logout
      </button>
  
      <div style={body}>
        <button style={{ margin: '10px', padding: '10px 50px' }}>Add Liked Movies</button>
        <button style={{ margin: '10px', padding: '10px 50px' }}>Add Your Subscriptions</button>
      </div>

      <div style={style.movieRecBox}>
        {/* Placeholder content */}
        <p style={{ textAlign: 'center', width: '100%' }}>
          Movie Recommendations Box
        </p>
      </div>

      <div style={style.movieRecBox}>
        {/* Placeholder content */}
        <p style={{textAlign: 'center', width: '100%' }}>
          Movie search filter options stuff here 
        </p>
      </div>

    </div>
  );
};

export default Dashboard;
