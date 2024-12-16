require('dotenv').config();


const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors'); // Import CORS middleware
const { Pool } = require('pg');

const app = express();
const port = 3001;

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

// Endpoint: User Login
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

    res.status(200).json({ message: 'Streaming services updated successfully' });
  } catch (error) {
    console.error('Error updating streaming services:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//get the users streaming platforms 
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


// Endpoint: Search for Movies or Shows
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

// Endpoint: Add a Liked Movie for a User
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

    res.status(200).json({ message: 'Movie or show added to liked movies/shows successfully.' });
  } catch (error) {
    console.error('Error adding liked movie or show:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//get liked movies 
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



// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
