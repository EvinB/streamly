import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.connect()
  .then((client) => {
    console.log('Connected to PostgreSQL successfully!');
    client.release();
    pool.end();
  })
  .catch(err => {
    console.error('Connection error:', err.message);
    pool.end();
  });
