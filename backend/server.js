require('dotenv').config();


const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors'); // Import CORS middleware
const { Pool } = require('pg');
const Redis = require('ioredis');
const axios = require('axios');

const app = express();
const port = 3001;

// Connect to Redis
const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
});

// Database connection configuration
const pool = new Pool({
  user: process.env.PG_USER,        // PostgreSQL username
  host: process.env.PG_HOST,        // Database host
  database: process.env.PG_DATABASE, // Database name
  password: process.env.PG_PASSWORD, // PostgreSQL password
  port: process.env.PG_PORT,        // PostgreSQL port
});

// Middleware
app.use(cors());               // Enable CORS
app.use(bodyParser.json());    // Parse JSON request bodies

// Endpoint: User Registration
app.post('/register', async (req, res) => {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the database
    const result = await pool.query(
      'INSERT INTO streamly.user_accounts (user_name, password_hash) VALUES ($1, $2) RETURNING *',
      [user_name, hashedPassword]
    );

    res.status(201).json({ message: 'User registered successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error registering user:', error);

    // Check for unique username violation
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Username already exists' });
    }

    res.status(500).json({ message: 'Internal server error' });
  }
});

// User Login
app.post('/login', async (req, res) => {
  const { user_name, password } = req.body;

  if (!user_name || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  try {
    // Check if user exists
    const result = await pool.query(
      'SELECT * FROM streamly.user_accounts WHERE user_name = $1',
      [user_name]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const user = result.rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({
      message: 'Login successful',
      user: { user_id: user.user_id, user_name: user.user_name },
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Update the users streaming platforms 
app.post('/update-streaming-services', async (req, res) => {
  const { user_id, streaming_services } = req.body;
  console.log(`User ID: ${user_id}, Streaming Services: ${streaming_services}`);

  if (!user_id || !streaming_services || !streaming_services.length) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    // Clear existing services for the user
    await pool.query('DELETE FROM streamly.users_streaming_services WHERE user_id = $1', [user_id]);

    // Insert new streaming services
    const insertQueries = streaming_services.map((service) =>
      pool.query(
        'INSERT INTO streamly.users_streaming_services (user_id, streaming_service_name) VALUES ($1, $2)',
        [user_id, service]
      )
    );
    await Promise.all(insertQueries);

    await redis.del(`user:${user_id}:recommendations`); // Invalidate cache
    console.log(`Cache invalidated for user ${user_id}`);

    res.status(200).json({ message: 'Streaming services updated successfully' });
  } catch (error) {
    console.error('Error updating streaming services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get the users streaming platforms 
app.get('/get-streaming-services', async (req, res) => {
  const { user_id } = req.query; // Extract user_id from query params

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Query the database to get streaming services for the user
    const result = await pool.query(
      'SELECT streaming_service_name FROM streamly.users_streaming_services WHERE user_id = $1',
      [user_id]
    );

    // Send the list of streaming services back
    res.json(result.rows.map((row) => row.streaming_service_name));
  } catch (error) {
    console.error('Error fetching streaming services:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// Search for Movies or Shows
app.get('/search-movies-shows', async (req, res) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  try {
    // Full-text search on the media table
    const result = await pool.query(
      `SELECT movie_id, title, type 
       FROM streamly.media 
       WHERE title_tsv @@ to_tsquery('english', $1)
       LIMIT 10`,
      [title.trim().replace(/\s+/g, ':* & ') + ':*'] // Convert input to full-text search format
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error searching movies and shows:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Add a Liked Movie for a User
app.post('/add-liked-movie-show', async (req, res) => {
  const { user_id, movie_id } = req.body;

  if (!user_id || !movie_id) {
    return res.status(400).json({ message: 'User ID and Movie ID are required' });
  }

  try {
    // Check if the record already exists
    const checkResult = await pool.query(
      `SELECT * FROM streamly.users_liked_movies WHERE user_id = $1 AND movie_id = $2`,
      [user_id, movie_id]
    );

    if (checkResult.rows.length > 0) {
      // If the record exists, inform the user
      return res.status(200).json({ message: 'This movie or show is already in your liked list.' });
    }

    // Insert the record if it doesn't exist
    await pool.query(
      `INSERT INTO streamly.users_liked_movies (user_id, movie_id)
       VALUES ($1, $2)`,
      [user_id, movie_id]
    );

    // Invalidate Redis cache
    await redis.del(`user:${user_id}:recommendations`);
    console.log(`Cache invalidated for user ${user_id}`);

    res.status(200).json({ message: 'Movie or show added to liked movies/shows successfully.' });
  } catch (error) {
    console.error('Error adding liked movie or show:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Get users liked movies and shows
app.get('/get-liked-movies', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT m.movie_id, m.title, array_agg(a.streaming_service_name) AS streaming_services
       FROM streamly.users_liked_movies ulm
       JOIN streamly.media m ON ulm.movie_id = m.movie_id
       LEFT JOIN streamly.availability a ON m.movie_id = a.movie_id
       WHERE ulm.user_id = $1
       GROUP BY m.movie_id, m.title`,
      [user_id]
    );

    res.json(result.rows); // Return movie details including title and streaming services
  } catch (error) {
    console.error('Error fetching liked movies:', error);
    res.status(500).json({ message: 'Failed to fetch liked movies.' });
  }
});

// Get recommendations for the user
app.get('/recommend-movies', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    // Define Redis cache key
    const cacheKey = `user:${user_id}:recommendations`;

    // Check Redis for cached recommendations
    const cachedRecommendations = await redis.get(cacheKey);

    if (cachedRecommendations) {
      console.log('Cache hit: Serving recommendations from Redis');
      return res.status(200).json({ recommendations: JSON.parse(cachedRecommendations) });
    }

    console.log('Cache miss: Fetching recommendations from PostgreSQL');

    // Set search path
    await pool.query(`SET search_path TO streamly, public;`);

    // Sum and normalize all dimensions of genres_cube for the user's liked movies
    const normalizedCubeResult = await pool.query(
      `SELECT cube(array_agg(dimension_weight)) AS weighted_cube
       FROM (
         SELECT i AS dimension_index, 
                SUM(COALESCE(cube_ll_coord(m.genres_cube, i), 0))::float / COUNT(*) OVER () AS dimension_weight
         FROM streamly.media m
         JOIN streamly.users_liked_movies ulm 
           ON m.movie_id = ulm.movie_id,
              generate_series(1, (SELECT cube_dim(m.genres_cube) 
                                  FROM streamly.media m 
                                  WHERE m.genres_cube IS NOT NULL LIMIT 1)) AS i
         WHERE ulm.user_id = $1 
           AND m.genres_cube IS NOT NULL
         GROUP BY i
       ) AS normalized_dimensions`,
      [user_id]
    );

    const weightedCube = normalizedCubeResult.rows[0]?.weighted_cube;

    // Check if the weighted cube exists
    if (!weightedCube) {
      return res.status(200).json({ message: 'No liked movies to base recommendations on.', recommendations: [] });
    }

    // Fetch recommended movies filtered by user's countries and streaming services
    const recommendationsResult = await pool.query(
      `SELECT 
        m.movie_id, 
        m.title, 
        m.type, 
        m.imdb_id,
        m.imdb_rating,
        array_agg(DISTINCT a.streaming_service_name) AS streaming_services
      FROM streamly.media m
      JOIN streamly.availability a 
        ON m.movie_id = a.movie_id
      JOIN streamly.users_streaming_services uss 
        ON LOWER(a.streaming_service_name) = LOWER(uss.streaming_service_name)
      JOIN streamly.users_countries uc 
        ON uc.user_id = $1
      JOIN streamly.media_available_countries ac
        ON m.movie_id = ac.movie_id AND uc.country_id = ac.country_id
      WHERE uss.user_id = $1
        AND m.genres_cube IS NOT NULL
        AND m.movie_id NOT IN (
          SELECT ulm.movie_id 
          FROM streamly.users_liked_movies ulm 
          WHERE ulm.user_id = $1
        )
      GROUP BY m.movie_id, m.title, m.type, m.imdb_rating
      ORDER BY MIN(m.genres_cube <-> $2::cube)
      LIMIT 30;`,
      [user_id, weightedCube]
    );

    const recommendations = recommendationsResult.rows;

    // Perform POST requests to fetch movie/show posters from TMDB
    const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

    const recommendationsWithPosters = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          console.log(`Fetching poster for: ${rec.title}, IMDb ID: ${rec.imdb_id}`);

          // Use GET request with Bearer Token
          const response = await axios.get(
            `https://api.themoviedb.org/3/find/${rec.imdb_id}`, 
            {
              headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_BEARER_TOKEN}`, 
              },
              params: {
                external_source: 'imdb_id', // IMDb search
              },
            }
          );

          console.log(`TMDB Response for ${rec.title}:`, JSON.stringify(response.data, null, 2));

          // Extract poster path
          const posterPath = response.data.movie_results[0]?.poster_path;
          console.log(`Poster Path for ${rec.title}:`, posterPath);

          return {
            ...rec,
            posterUrl: posterPath ? `https://image.tmdb.org/t/p/w500${posterPath}` : null,
          };
        } catch (error) {
          console.error(`Error fetching poster for ${rec.title}:`, error);
          return { ...rec, posterUrl: null }; // Fallback if poster fetch fails
        }
      })
    );

    // Cache the recommendations in Redis
    await redis.set(cacheKey, JSON.stringify(recommendationsWithPosters), 'EX', 3600);

    // Return recommendations to the client
    res.status(200).json({ recommendations: recommendationsWithPosters });
    console.log('Recommendations fetched from PostgreSQL and TMDB');
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/search-media', async (req, res) => {
  const { searchText, selectedGenre, selectedService, selectedType, selectedRating } = req.query;

  try {
    let query = `
      SELECT 
        m.title, 
        m.type, 
        m.imdb_id,
        m.imdb_rating AS rating, 
        mg.genre, 
        array_agg(DISTINCT a.streaming_service_name) AS services
      FROM streamly.media m
      LEFT JOIN streamly.media_genres mg ON m.movie_id = mg.movie_id
      LEFT JOIN streamly.availability a ON m.movie_id = a.movie_id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    // Title search filter
    if (searchText) {
      query += ` AND m.title_tsv @@ to_tsquery('english', $${paramIndex})`;
      params.push(searchText.trim().replace(/\s+/g, ':* & ') + ':*'); // Format searchText for to_tsquery
      paramIndex++;
    }

    // Genre filter
    if (selectedGenre) {
      const genresArray = selectedGenre.split(',').map(g => g.trim());
      query += ` AND mg.genre = ANY($${paramIndex})`;
      params.push(genresArray); // Ensure it's an array
      paramIndex++;
    }

    // Streaming service filter
    if (selectedService) {
      const servicesArray = selectedService.split(',').map(s => s.trim());
      query += ` AND a.streaming_service_name = ANY($${paramIndex})`;
      params.push(servicesArray); // Ensure it's an array
      paramIndex++;
    }

    // Rating filter (min and max rating)
    if (selectedRating) {
      const minRating = parseFloat(selectedRating);
      const maxRating = 10; // Default max value
      query += ` AND m.imdb_rating >= $${paramIndex} AND m.imdb_rating <= $${paramIndex + 1}`;
      params.push(minRating, maxRating);
      paramIndex += 2;
    }

    // Type filter (Movie or Show)
    if (selectedType) {
      query += ` AND m.type = ANY($${paramIndex})`;
      params.push(selectedType.split(','));
      paramIndex++;
    }

    query += `
      GROUP BY m.movie_id, m.title, m.type, m.imdb_rating, mg.genre
      ORDER BY m.title
      LIMIT 200;
    `;

    // Execute the query
    console.log('Query Params:', { searchText, selectedGenre, selectedService, selectedRating });
    console.log('Executing Query:', query);

    const result = await pool.query(query, params);

    // TMDB Bearer Token
    const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;

    // Fetch posters for each media entry using IMDb ID
    const mediaWithPosters = await Promise.all(
      result.rows.map(async (media) => {
        try {
          const response = await axios.get(
            `https://api.themoviedb.org/3/find/${media.imdb_id}`,
            {
              headers: {
                accept: 'application/json',
                Authorization: `Bearer ${TMDB_BEARER_TOKEN}`,
              },
              params: { external_source: 'imdb_id' },
            }
          );

          // Extract poster path
          const posterPath = response.data.movie_results?.[0]?.poster_path;
          return {
            ...media,
            posterUrl: posterPath
              ? `https://image.tmdb.org/t/p/w500${posterPath}`
              : null,
          };
        } catch (error) {
          console.error(`Error fetching poster for ${media.title}:`, error.message);
          return { ...media, posterUrl: null }; // Return null if poster fetch fails
        }
      })
    );

    console.log('Filtered Media Results:', mediaWithPosters); // Log the rows correctly
    res.status(200).json(mediaWithPosters);
  } catch (error) {
    console.error('Error fetching filtered media:', error);

    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/update-regions', async (req, res) => {
  const { user_id, country_ids } = req.body;

  if (!user_id || !Array.isArray(country_ids)) {
    return res.status(400).json({ message: 'Invalid input' });
  }

  try {
    // Clear existing countries for the user
    await pool.query('DELETE FROM streamly.users_countries WHERE user_id = $1', [user_id]);

    // Insert new selected countries
    const insertQueries = country_ids.map((country_id) =>
      pool.query(
        'INSERT INTO streamly.users_countries (user_id, country_id) VALUES ($1, $2)',
        [user_id, country_id]
      )
    );
    await Promise.all(insertQueries);

    // Invalidate Redis cache
    await redis.del(`user:${user_id}:recommendations`);
    console.log(`Cache invalidated for user ${user_id}`);

    res.status(200).json({ message: 'Regions updated successfully' });
  } catch (error) {
    console.error('SQL Error:', error.message);

    console.error('Error updating regions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint: Fetch user's selected regions
app.get('/get-user-regions', async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await pool.query(
      `SELECT country_id 
       FROM streamly.users_countries 
       WHERE user_id = $1`,
      [user_id]
    );

    const countryIds = result.rows.map((row) => row.country_id);
    res.json(countryIds);
  } catch (error) {
    console.error('Error fetching user regions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});