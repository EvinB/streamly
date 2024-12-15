const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors'); // Import CORS middleware
const { Pool } = require('pg');

const app = express();
const port = 3001;

// Database connection configuration
const pool = new Pool({
  user: 'your_pg_user',       // Replace with your PostgreSQL username
  host: 'localhost',          // Database host
  database: 'mdb_student30',  // Your database name
  password: 'your_pg_password', // Replace with your PostgreSQL password
  port: 5432,                 // PostgreSQL port
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

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
