import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AddLiked from './AddLiked';
import SelectRegions from './SelectRegions';


const Dashboard = () => {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);



  const [showAddLikedModal, setShowAddLikedModal] = useState(false);

  const [showLikedModal, setShowLikedModal] = useState(false); // Add this line
  const [selectedServices, setSelectedServices] = useState([]); 
  const [userServices, setUserServices] = useState([]); 
  const [likedMovies, setLikedMovies] = useState([]);

  //filter box options 
  const [searchText, setSearchText] = useState('');
  const [selectedGenre, setSelectedGenre] = useState([]);
  const [selectedService, setSelectedService] = useState([]);
  const [selectedType, setSelectedType] = useState([]);
  const [selectedRating, setSelectedRating] = useState([1, 10]);


  //store search results 
  const [searchResults, setSearchResults] = useState([]);

  //region handling 
  const [showRegionsModal, setShowRegionsModal] = useState(false);


  const [selectedRegions, setSelectedRegions] = useState([]); // Array of country IDs
  const [availableCountries, setAvailableCountries] = useState([]); // List of countries from DB





  const ratings = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const types = ['movie', 'tv'];
  const genres = ['Drama', 'Comedy', 'Action & Adventure', 'Thriller', 'Romance'];
  const availableServices = ['netflix', 'hulu', 'amazon']; // Static list of options

  const [showAllGenres, setShowAllGenres] = useState(false);
  const allGenres = [
    'Action & Adventure', 'Adult', 'Animation', 'Biography', 'Comedy',
    'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
    'Film Noir', 'Game Show', 'History', 'Horror', 'Kids',
    'Musical', 'Mystery', 'News', 'Reality', 'Romance',
    'Science Fiction', 'Short', 'Soap', 'Sport', 'Talk Show',
    'Thriller', 'TV Movie', 'War', 'Western'
  ];


  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/'); // Redirect if not logged in
    } else {
      fetchUserServices(user.user_id); // Fetch user's current streaming services
      fetchUserRegions(user.user_id);
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
  
      // Map response to display title and streaming services
      setLikedMovies(
        response.data.map((movie) => ({
          title: movie.title,
          streamingServices: movie.streaming_services.join(', '), // Combine services into a string
        }))
      );
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


  const handleSearch = async () => {
    const filters = {
      searchText,
      selectedGenre: selectedGenre.join(','), // Convert array to comma-separated string
      selectedService: selectedService.join(','),
      selectedType: selectedType.join(','),
      selectedRating, // Send as a single value
    };
  
    try {
      const response = await axios.get('http://localhost:3001/search-media', {
        params: filters,
      });
  
      console.log('Filtered Media Results:', response.data);
  
      // Group results by title to combine genres
      const groupedResults = response.data.reduce((acc, movie) => {
        const existingMovie = acc.find((m) => m.title === movie.title);
  
        if (existingMovie) {
          // If movie already exists, add new genre to its list
          if (!existingMovie.genre.includes(movie.genre)) {
            existingMovie.genre.push(movie.genre);
          }
        } else {
          // If new movie, add it to the accumulator
          acc.push({
            ...movie,
            genre: [movie.genre], // Initialize genre as an array
          });
        }
  
        return acc;
      }, []);
  
      // Format genres as a comma-separated string
      const formattedResults = groupedResults.map((movie) => ({
        ...movie,
        genre: movie.genre.join(', '), // Join genres into a single string
      }));
  
      setSearchResults(formattedResults.slice(0, 20)); // Limit to 20 results
    } catch (error) {
      console.error('Error fetching media:', error);
      alert('Failed to fetch media.');
    }
  };

  const handleSaveRegions = async () => {
    console.log('Selected Regions (Before Save):', selectedRegions);

    const user = JSON.parse(localStorage.getItem('user'));
    try {
      await axios.post('http://localhost:3001/update-regions', {
        user_id: user.user_id,
        country_ids: selectedRegions, // This now contains valid country_id integers
      });
      alert('Regions updated successfully!');
      setShowRegionsModal(false);
    } catch (error) {
      console.error('Error updating regions:', error);
      alert('Failed to update regions.');
    }
  };
  
  const fetchUserRegions = async (userId) => {
    try {
      const response = await axios.get('http://localhost:3001/get-user-regions', {
        params: { user_id: userId },
      });
      setSelectedRegions(response.data); // Pre-select user's regions
    } catch (error) {
      console.error('Error fetching user regions:', error);
    }
  };
  
  
  // Styling
  const style = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
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
      height: '300px',
      border: '2px solid #444',
      borderRadius: '10px',
      overflowX: 'auto',
      marginTop: '20px',
    },
    movieFilterBox: {
      display: 'flex',
      alignItems: 'center',
      width: '80%',
      height: '400px',
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
      resultsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr', // 2 columns
        gap: '20px',
        width: '80%',
        marginTop: '20px',
      },
      tile: {
        border: '1px solid #444',
        borderRadius: '10px',
        padding: '10px',
        backgroundColor: '#222',
        color: '#fff',
        textAlign: 'center',
      },
      placeholderImage: {
        width: '100%',
        height: '150px',
        backgroundColor: '#555',
        marginBottom: '10px',
      },
  };

  const ResultStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '20px',
      color: '#fff',
      backgroundColor: '#000',
      minHeight: '100vh',
    },
    movieFilterBox: {
      display: 'flex',
      flexDirection: 'column',
      width: '80%',
      padding: '20px',
      border: '2px solid #444',
      borderRadius: '10px',
      marginBottom: '20px',
    },
    resultsContainer: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      width: '80%',
      marginTop: '20px',
    },
    tile: {
      display: 'flex',            // Flexbox for side-by-side layout
      alignItems: 'center',       // Center vertically
      border: '1px solid #444',
      borderRadius: '10px',
      padding: '10px',
      backgroundColor: '#222',
      color: '#fff',
      textAlign: 'left',
    },
    placeholderImage: {
      width: '100px',             // Set image width
      height: '150px',            // Set image height
      backgroundColor: '#555',
      marginRight: '15px',        // Add space between image and content
      borderRadius: '5px',
    },
    tileContent: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between', // Distribute content
      height: '100%',
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
        <button
          style={{ margin: '10px', padding: '10px 50px' }}
          onClick={() => setShowRegionsModal(true)}
        >
          Select Regions
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
      
        {/* Movie recommendation box */}
        <div style={style.movieRecBox}>
          movie rec here
        </div>

      {/* Movie search filter box =====================================================*/}
      {/* Movie search filter box */}
      <div style={style.movieFilterBox}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: '15px',
            padding: '20px',
            color: '#fff',
          }}
        >
          {/* Filter Sections */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              width: '100%',
              alignItems: 'flex-start',
            }}
          >
            {/* Genres Section */}
            <div>
              <h4 style={{ marginBottom: '10px' }}>Genres</h4>
              {genres.map((genre) => (
                <label key={genre} style={{ display: 'block', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    value={genre}
                    onChange={(e) => {
                      setSelectedGenre((prev) =>
                        prev.includes(e.target.value)
                          ? prev.filter((g) => g !== e.target.value)
                          : [...prev, e.target.value]
                      );
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  {genre}
                </label>
              ))}

              {/* Select More Button */}
              <button
                onClick={() => setShowAllGenres(true)}
                style={{
                  marginTop: '10px',
                  padding: '5px 10px',
                  borderRadius: '5px',
                  backgroundColor: '#555',
                  color: '#fff',
                  cursor: 'pointer'
                }}
              >
                Select More
              </button>
            </div>


            {/* Streaming Services Section */}
            <div>
              <h4 style={{ marginBottom: '10px' }}>Streaming Services</h4>
              {availableServices.map((service) => (
                <label key={service} style={{ display: 'block', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    value={service}
                    onChange={(e) => {
                      setSelectedService((prev) =>
                        prev.includes(e.target.value)
                          ? prev.filter((s) => s !== e.target.value)
                          : [...prev, e.target.value]
                      );
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  {service}
                </label>
              ))}
            </div>
            {/* Media Rating Section */}
            <div>
              <h4 style={{ marginBottom: '10px' }}>Rating</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>1</span>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={selectedRating || 5} // Default to 5
                  onChange={(e) => setSelectedRating(e.target.value)}
                  style={{ width: '150px'}}
                />
                <span>10</span>
              </div>
              <p>Selected Rating: {selectedRating}+</p>
            </div>


            {/* Media Type Section */}
            <div>
              <h4 style={{ marginBottom: '10px' }}>Media Type</h4>
              {types.map((type) => (
                <label key={type} style={{ display: 'block', marginBottom: '5px' }}>
                  <input
                    type="checkbox"
                    value={type}
                    onChange={(e) => {
                      setSelectedType((prev) =>
                        prev.includes(e.target.value)
                          ? prev.filter((t) => t !== e.target.value)
                          : [...prev, e.target.value]
                      );
                    }}
                    style={{ marginRight: '8px' }}
                  />
                  {type}
                </label>
              ))}
            </div>
            
          </div>

          {/* Search Bar */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <input
              type="text"
              placeholder="Add text to your search..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                padding: '10px',
                borderRadius: '5px',
                border: '1px solid #555',
                backgroundColor: '#222',
                color: '#fff',
                fontSize: '16px',
                width: '50%',
                marginTop: '10px',
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button
              onClick={handleSearch}
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                backgroundColor: '#555',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Search
            </button>

            <button
              style={{
                padding: '10px 20px',
                borderRadius: '5px',
                backgroundColor: '#777',
                color: '#fff',
                fontSize: '16px',
                cursor: 'pointer',
              }}
              onClick={() => {
                setSearchText('');
                setSelectedGenre([]);
                setSelectedService([]);
                setSelectedType([]);
                console.log('Filters reset');
              }}
            >
              Reset
            </button>
          </div>
        </div>

      </div>

      <div style={ResultStyles.resultsContainer}>
          {searchResults.length > 0 ? (
            searchResults.map((movie, index) => (
              <div key={index} style={ResultStyles.tile}>
                {/* Image Placeholder */}
                <div style={ResultStyles.placeholderImage}></div>
                
                {/* Tile Content */}
                <div style={ResultStyles.tileContent}>
                  <h4 style={{ margin: '0', fontWeight: 'bold' }}>{movie.title}</h4>
                  <p style={{ margin: '5px 0' }}>Type: {movie.type}</p>
                  <p style={{ margin: '5px 0' }}>Genre: {movie.genre}</p>
                  <p style={{ margin: '5px 0' }}>Rating: {movie.rating}</p>
                  <p style={{ margin: '5px 0' }}>Availibility: {movie.services.join(', ')}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p>No results found.</p>
          )}
        </div>




       {/* Liked Movies Modal */}
        {showLikedModal && (
          <div style={style.likedMoviesModal}>
            <h3>Liked Movies</h3>
            {likedMovies.length > 0 ? (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {likedMovies.map((movie, index) => (
                  <li key={index} style={{ marginBottom: '10px' }}>
                    <strong>{movie.title}</strong> <br />
                    Available on: {movie.streamingServices || 'Not available on any service'}
                  </li>
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

      {/* Full Genre Modal */}
      {showAllGenres && (
        <div style={style.modal}>
          <h3>Select Genres</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr', // Two equal columns
            gap: '10px', // Space between columns and rows
            maxHeight: '400px', // Limit height
            overflowY: 'auto' // Scroll if the content is too long
          }}>
            {allGenres.map((genre) => (
              <label key={genre} style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  value={genre}
                  onChange={(e) => {
                    setSelectedGenre((prev) =>
                      prev.includes(e.target.value)
                        ? prev.filter((g) => g !== e.target.value)
                        : [...prev, e.target.value]
                    );
                  }}
                  style={{ marginRight: '8px' }}
                  checked={selectedGenre.includes(genre)}
                />
                {genre}
              </label>
            ))}
          </div>

          <button
            style={style.modalButton}
            onClick={() => setShowAllGenres(false)}
          >
            Close
          </button>
        </div>
      )}

      {/* Regions popup*/}
      {showRegionsModal && (
        <SelectRegions
        selectedRegions={selectedRegions}
        setSelectedRegions={setSelectedRegions}
        onSave={handleSaveRegions} // Save handler
        onClose={() => setShowRegionsModal(false)}
      />
      )}


    </div>
  );
};

export default Dashboard;
