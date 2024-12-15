import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/'); // Redirect to root page if user is not logged in
    }
  }, [navigate]);

  const [showModal, setShowModal] = useState(false); // Modal state
  const [selectedServices, setSelectedServices] = useState([]); // Selected checkboxes

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleCheckboxChange = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service]
    );
  };

  const handleApply = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      await axios.post('http://localhost:3001/update-streaming-services', {
        user_id: user.user_id,
        streaming_services: selectedServices,
      });
      alert('Streaming services updated successfully!');
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error('Error updating streaming services:', error);
      alert('Failed to update streaming services. Please try again.');
    }
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
    movieRecBox: {
      display: 'flex',
      alignItems: 'center',
      width: '80%',
      height: '200px',
      border: '2px solid #444',
      borderRadius: '10px',
      overflowX: 'auto',
      marginTop: '20px',
    },
    modal: {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      backgroundColor: '#333',
      color: '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    },
    modalButton: {
      margin: '10px',
      padding: '10px 20px',
      backgroundColor: '#555',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
  };

  const body = {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
    padding: '20px 0',
    gap: '20px',
  };

  return (
    <div style={style.container}>
      <button style={style.logoutButton} onClick={handleLogout}>
        Logout
      </button>

      {/* Buttons */}
      <div style={body}>
        <button style={{ margin: '10px', padding: '10px 50px' }}>Add Liked Movies</button>
        <button
          style={{ margin: '10px', padding: '10px 50px' }}
          onClick={() => setShowModal(true)}
        >
          Add Your Subscriptions
        </button>
      </div>

      {/* Movie Recommendation Box */}
      <div style={style.movieRecBox}>
        <p style={{ textAlign: 'center', width: '100%' }}>Movie Recommendations Box</p>
      </div>

      {/* Movie Filter Box */}
      <div style={style.movieRecBox}>
        <p style={{ textAlign: 'center', width: '100%' }}>Movie search filter options stuff here</p>
      </div>

      {/* Modal for Streaming Services */}
      {showModal && (
        <div style={style.modal}>
          <h3>Select Streaming Services</h3>
          <label>
            <input
              type="checkbox"
              value="Netflix"
              onChange={() => handleCheckboxChange('Netflix')}
            />
            Netflix
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              value="Hulu"
              onChange={() => handleCheckboxChange('Hulu')}
            />
            Hulu
          </label>
          <br />
          <label>
            <input
              type="checkbox"
              value="Amazon Video"
              onChange={() => handleCheckboxChange('Amazon Video')}
            />
            Amazon Video
          </label>
          <br />
          <button style={style.modalButton} onClick={handleApply}>
            Apply
          </button>
          <button style={style.modalButton} onClick={() => setShowModal(false)}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
