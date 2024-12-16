import React, { useState } from 'react';
import axios from 'axios';

const AddLiked = ({ userId, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [message, setMessage] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);

  const style = {
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
      width: '400px',
    },
    button: {
      margin: '10px',
      padding: '10px 20px',
      backgroundColor: '#555',
      color: '#fff',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    },
    searchInput: {
      width: '100%',
      padding: '8px',
      marginBottom: '10px',
      boxSizing: 'border-box',
    },
    resultList: {
      listStyle: 'none',
      padding: 0,
      maxHeight: '150px',
      overflowY: 'auto',
    },
    listItem: {
      padding: '5px',
      cursor: 'pointer',
    },
    selected: {
      backgroundColor: 'lightblue',
    },
  };

  // Fetch search results from the backend
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await axios.get('http://localhost:3001/search-movies-shows', {
        params: { title: searchQuery },
      });
      setSearchResults(response.data);
      setMessage('');
    } catch (error) {
      console.error('Error searching movies:', error);
      setMessage('Failed to fetch search results.');
    }
  };

  // Handle movie selection
  const selectMovie = (movie) => {
    setSelectedMovie(movie);
  };

  // Submit the selected movie to the backend
  const handleAddMovie = async () => {
    if (!selectedMovie) {
      setMessage('Please select a movie to add.');
      return;
    }

    try {
      await axios.post('http://localhost:3001/add-liked-movie-show', {
        user_id: userId,
        movie_id: selectedMovie.movie_id,
      });
      setMessage(`"${selectedMovie.title}" added successfully!`);
      setSelectedMovie(null);
      setSearchResults([]);
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding movie:', error);
      setMessage('Failed to add the movie.');
    }
  };

  return (
    <div style={style.modal}>
      <h3>Add Liked Movies</h3>
      <input
        type="text"
        placeholder="Search for movies or shows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={style.searchInput}
      />
      <button style={style.button} onClick={handleSearch}>
        Search
      </button>

      <ul style={style.resultList}>
        {searchResults.map((movie, index) => (
            <li
            key={movie.movie_id || index} // Use movie.movie_id if available, otherwise fallback to index
            style={{
                ...style.listItem,
                ...(selectedMovie?.movie_id === movie.movie_id ? style.selected : {}),
            }}
            onClick={() => selectMovie(movie)}
            >
            {movie.title} ({movie.type})
            </li>
        ))}
    </ul>

      {message && <p>{message}</p>}

      <button style={style.button} onClick={handleAddMovie}>
        Add to Liked Movies
      </button>
      <button style={style.button} onClick={onClose}>
        Close
      </button>
    </div>
  );
};

export default AddLiked;