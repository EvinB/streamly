import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';

const GetRecs = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch recommendations when component mounts
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    console.log('Fetching recommendations...');
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:3001/recommend-movies', {
        params: { user_id: userId },
      });

      setRecommendations(
        response.data.recommendations.length > 0
          ? response.data.recommendations
          : [{ title: 'No recommendations available', type: '', imdb_rating: '' }]
      );
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([{ title: 'Failed to fetch recommendations', type: '', imdb_rating: '' }]);
    } finally {
      setLoading(false);
      console.log('Fetching complete.');
    }
  };

  return (
    <div style={{ padding: '10px', width: '100%', height: '100%', boxSizing: 'border-box' }}>
      {/* Top bar with Refresh Button */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: '10px',
          zIndex: 10,
        }}
      >
        <button
          onClick={fetchRecommendations}
          style={{
            padding: '10px',
            backgroundColor: '#444',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            zIndex: 20,
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

      {/* Scrollable Recommendations List */}
      <div
        style={{
          textAlign: 'center',
          maxHeight: '220px', // Restrict the height of the list
          overflowY: 'auto', // Add vertical scroll when content overflows
          paddingRight: '10px', // Prevent content from hiding behind scrollbar
        }}
      >
        {recommendations.length > 0 ? (
          <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            {recommendations.map((rec, index) => (
              <li key={index} style={{ marginBottom: '10px' }}>
                <strong>{rec.title}</strong> ({rec.type || 'Unknown'}) - IMDb: {rec.imdb_rating || 'N/A'}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: 'center' }}>Add movies or shows to your liked list to get recommendations.</p>
        )}
      </div>
    </div>
  );
};

export default GetRecs;