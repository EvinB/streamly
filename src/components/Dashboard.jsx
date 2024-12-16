import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddLiked from './AddLiked';

const Dashboard = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);



  const [showAddLikedModal, setShowAddLikedModal] = useState(false);

  const [showLikedModal, setShowLikedModal] = useState(false); // Add this line
  const [selectedServices, setSelectedServices] = useState([]); 
  const [userServices, setUserServices] = useState([]); 
  const [likedMovies, setLikedMovies] = useState([]);
  
  const availableServices = ['Netflix', 'Hulu', 'Amazon Video']; // Static list of options

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/'); // Redirect if not logged in
    } else {
      fetchUserServices(user.user_id); // Fetch user's current streaming services
    }
  }, [navigate]);

  // Fetch user streaming services from the backend
  const fetchUserServices = async (userId) => {
    try {
      const response = await axios.get('http://localhost:3001/get-streaming-services', {
        params: { user_id: userId },
      });
  
      console.log('Fetched user services:', response.data); // Confirm response format
  
      setUserServices(response.data); // Directly set the array
      setSelectedServices(response.data); // Pre-check in modal
    } catch (error) {
      console.error('Error fetching user services:', error);
    }
  };
  
  const fetchLikedMovies = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const response = await axios.get('http://localhost:3001/get-liked-movies', {
        params: { user_id: user.user_id },
      });
      setLikedMovies(response.data.map((item) => `Movie ID: ${item.movie_id}`));
      setShowLikedModal(true); // Show modal after fetching
    } catch (error) {
      console.error('Error fetching liked movies:', error);
      alert('Failed to fetch liked movies.');
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear user data
    navigate('/'); // Redirect to root page
  };

  // Handle checkbox change in the modal
  const handleCheckboxChange = (service) => {
    setSelectedServices((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service) // Remove if already checked
        : [...prev, service] // Add if not checked
    );
  };

  // Apply updated streaming services to the backend
  const handleApply = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      await axios.post('http://localhost:3001/update-streaming-services', {
        user_id: user.user_id,
        streaming_services: selectedServices,
      });
      alert('Streaming services updated successfully!');
      setShowModal(false);
      fetchUserServices(user.user_id); // Refresh the list below the buttons
    } catch (error) {
      console.error('Error updating streaming services:', error);
      alert('Failed to update streaming services. Please try again.');
    }
  };

  // Styling
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
    serviceList: {
      marginTop: '20px',
      textAlign: 'center',
      fontSize: '18px',
      color: '#fff',
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
    likedMoviesModal: {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#333',
        color: '#fff',
        padding: '30px', // Increase padding
        width: '400px', // Set a larger width
        minHeight: '300px', // Set a larger height
        borderRadius: '10px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
        display: 'flex', // Center content
        flexDirection: 'column', // Stack elements vertically
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        textAlign: 'center', // Ensure text is centered
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

        <button 
          style={{ margin: '10px', padding: '10px 50px' }}
          onClick={() => setShowAddLikedModal(true)}
        >
          Add Liked Movies and Shows

        </button>

        <button
          style={{ margin: '10px', padding: '10px 50px' }}
          onClick={fetchLikedMovies}
        >
          View Liked Movies
        </button>

        <button
          style={{ margin: '10px', padding: '10px 50px' }}
          onClick={() => setShowModal(true)}
        >
          Update Subscriptions
        </button>
      </div>
      

      

      {/* Display current streaming services */}
      <div style={style.serviceList}>
        <p>
            Your Subscriptions:{" "}
            {userServices.length > 0
            ? userServices.join(", ") // Join the services with commas
            : "No streaming services selected yet."}
        </p>
        </div>

      {/* Movie Recommendation Box */}
      <div style={style.movieRecBox}>
        <p style={{ textAlign: 'center', width: '100%' }}>Movie Recommendations Box</p>
      </div>

      {/* Movie Filter Box */}
      <div style={style.movieRecBox}>
        <p style={{ textAlign: 'center', width: '100%' }}>Movie search filter options stuff here</p>
      </div>

       {/* Liked Movies Modal */}
        {showLikedModal && (
        <div style={style.likedMoviesModal}>
            <h3>Liked Movies</h3>
            {likedMovies.length > 0 ? (
            <ul>
                {likedMovies.map((movie, index) => (
                <li key={index}>{movie}</li>
                ))}
            </ul>
            ) : (
            <p>No liked movies yet.</p>
            )}
            <button style={style.modalButton} onClick={() => setShowLikedModal(false)}>
            Close
            </button>
        </div>
        )}
    
    
      {/* Modal for Streaming Services */}
      {showModal && (
        <div style={style.modal}>
          <h3>Select Streaming Services</h3>
          {availableServices.map((service) => (
            <div key={service}>
              <input
                type="checkbox"
                checked={selectedServices.includes(service)}
                onChange={() => handleCheckboxChange(service)}
              />
              <label>{service}</label>
            </div>
          ))}
          <button style={style.modalButton} onClick={handleApply}>
            Apply
          </button>
          <button style={style.modalButton} onClick={() => setShowModal(false)}>
            Close
          </button>
        </div>
      )}

      {showAddLikedModal && (
        <AddLiked
          userId={JSON.parse(localStorage.getItem('user')).user_id}
          onClose={() => setShowAddLikedModal(false)} // Close handler
        />
)}

    </div>
  );
};

export default Dashboard;
