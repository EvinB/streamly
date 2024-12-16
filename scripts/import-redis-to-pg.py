import redis
import psycopg2
from dotenv import load_dotenv
import os
import math

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../backend/.env"))

# Connect to Redis
redis_client = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

# Connect to PostgreSQL
pg_conn = psycopg2.connect(
    dbname=os.getenv("PG_DATABASE"),            
    user=os.getenv("PG_USER"),               
    password=os.getenv("PG_PASSWORD"),             
    host=os.getenv("PG_HOST"),       
    port=os.getenv("PG_PORT")                         
)
pg_cursor = pg_conn.cursor()

# Function to insert data into PostgreSQL
def import_to_postgres():
    # Fetch all Redis keys
    redis_keys = redis_client.keys("*:*")  # Matches keys like amazon:1, hulu:2, etc.
    
    for key in redis_keys:
        # Split the key to extract prefix (streaming service) and id
        prefix, _ = key.split(":")
        movie_data = redis_client.hgetall(key)

        # Extract fields from Redis
        title = movie_data.get('title')
        type_ = movie_data.get('type')
        genres_names = movie_data.get('genres', 'Unknown')
        genres_cube = None 
        imdb_rating = movie_data.get('imdbAverageRating')
        imdb_id = movie_data.get('imdbId', 'Unknown')

        # Skip records with invalid or missing imdb_id
        # Skip records with invalid or missing imdb_id
        if not imdb_id or imdb_id == 'Unknown' or imdb_id.lower() == 'nan' or \
        (isinstance(imdb_id, str) and imdb_id.strip() == "") or \
        (isinstance(imdb_id, float) and math.isnan(imdb_id)):
            print(f"Skipping {type_}: {title} from {prefix} due to missing or invalid IMDb ID.")
            continue

        print(f"Processing {type_}: {title} from {prefix} with IMDb ID: {imdb_id}")

        try:
            # Check if the movie or show already exists in the media table
            pg_cursor.execute("SELECT movie_id FROM streamly.media WHERE imdb_id = %s", (imdb_id,))
            existing_record = pg_cursor.fetchone()

            if existing_record:
                # If it exists, add only to the availability table
                movie_id = existing_record[0]
                print(f"IMDb ID {imdb_id} already exists. Adding availability for {prefix}.")
                pg_cursor.execute("""
                    INSERT INTO streamly.availability (movie_id, streaming_service_name)
                    VALUES (%s, %s)
                    ON CONFLICT DO NOTHING;
                """, (movie_id, prefix))
            else:
                # If it doesn't exist, add to media table and availability table
                pg_cursor.execute("""
                    INSERT INTO streamly.media (title, type, genres_names, genres_cube, imdb_rating, imdb_id)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING movie_id
                """, (title, type_, genres_names, genres_cube, imdb_rating, imdb_id))

                movie_id = pg_cursor.fetchone()[0]

                # Add availability for the newly inserted movie
                pg_cursor.execute("""
                    INSERT INTO streamly.availability (movie_id, streaming_service_name)
                    VALUES (%s, %s)
                """, (movie_id, prefix))

        except Exception as e:
            print(f"Error processing {type_} {title} from {prefix}: {e}")
            pg_conn.rollback()
        else:
            pg_conn.commit()

    print("Data imported successfully!")

# Run the import function
import_to_postgres()

# Close connections
pg_cursor.close()
pg_conn.close()