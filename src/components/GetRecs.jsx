import React, { useEffect, useState } from 'react';
import axios from 'axios';

const GetRecs = ({ userId }) => {
  const [recommendations, setRecommendations] = useState([]);

  // Fetch recommendations when component mounts
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
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
    }
  };

  return (
    <div style={{ padding: '10px', width: '100%' }}>
      {recommendations.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
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
  );
};

export default GetRecs;