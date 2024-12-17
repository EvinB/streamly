import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const GetRecs = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/recommend-movies', {
        params: { user_id: userId },
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
    
  };

  const ResultStyles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px',
      color: '#fff',
      backgroundColor: '#000',
      height: '100%',
      width: '100%',
      boxSizing: 'border-box',
    },
    refreshButton: {
      display: 'flex',
      justifyContent: 'flex-end',
      width: '100%',
      marginBottom: '10px',
    },
    resultsContainer: {
      display: 'flex', // Use flexbox for horizontal layout
      flexDirection: 'row',
      gap: '15px',
      height: '100%',
      width: '100%',
      overflowX: 'auto', // Enable horizontal scrolling
      boxSizing: 'border-box',
      padding: '10px',
    },
    tile: {
      flex: '0 0 200px', // Each tile has a fixed width
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #444',
      borderRadius: '10px',
      backgroundColor: '#222',
      color: '#fff',
      boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
      overflow: 'hidden',
    },
    placeholderImage: {
      width: '100%',
      flex: '2',
      backgroundColor: '#555',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      color: '#fff',
    },
    tileContent: {
      display: 'flex',
      flexDirection: 'column',
      padding: '10px',
    },
  };
  

  return (
    <div style={ResultStyles.container}>
      {/* Refresh Button */}
      <div style={ResultStyles.refreshButton}>
        <button
          onClick={fetchRecommendations}
          style={{
            padding: '10px',
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          title="Refresh Recommendations"
        >
          <FontAwesomeIcon
            icon={faSyncAlt}
            spin={loading}
            style={{ color: '#fff', fontSize: '20px' }}
          />
        </button>
      </div>

      {/* Recommendations List */}
      <div style={ResultStyles.resultsContainer}>
        {recommendations.length > 0 ? (
          recommendations.map((rec, index) => (
            <div key={index} style={ResultStyles.tile}>
              {/* Poster Image */}
              <div style={ResultStyles.placeholderImage}>
                {rec.posterUrl ? (
                  <img
                    src={rec.posterUrl}
                    alt={rec.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span>No Image</span>
                )}
              </div>

              {/* Movie Details */}
              <div style={ResultStyles.tileContent}>
                <h4 style={{ margin: '0 0 5px', fontWeight: 'bold' }}>{rec.title}</h4>
                <p style={{ margin: '5px 0' }}>Type: {rec.type || 'Unknown'}</p>
                <p style={{ margin: '5px 0' }}>IMDb: {rec.imdb_rating || 'N/A'}</p>
                {rec.streaming_services && rec.streaming_services.length > 0 && (
                  <p style={{ margin: '5px 0' }}>
                    Available on: {rec.streaming_services.join(', ')}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <p style={{ textAlign: 'center', width: '100%' }}>
            Add movies or shows to your liked list to get recommendations.
          </p>
        )}
      </div>
    </div>
  );
};

export default GetRecs;