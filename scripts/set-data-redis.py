import redis
import pandas as pd
import os

# Connect to Redis
r = redis.StrictRedis(host='localhost', port=6379, decode_responses=True)

# Base path for datasets
base_path = os.path.join(os.path.dirname(__file__), 'datasets')

# Function to load a CSV into Redis with a specific prefix
def load_csv_to_redis(file_path, prefix):
    # Load the CSV
    df = pd.read_csv(file_path)

    # Iterate through rows and store in Redis
    for index, row in df.iterrows():
        # Use platform and a unique identifier (like title or ID) to create a key
        key = f"{prefix}:{row['id']}" if 'id' in row else f"{prefix}:{index}"
        r.hset(key, mapping=row.to_dict())  # Store the entire row as a hash

    print(f"Data from {file_path} loaded successfully under prefix '{prefix}'!")

# File paths and prefixes
datasets = {
    "amazon": os.path.join(base_path, "amazon.csv"),
    "hulu": os.path.join(base_path, "hulu.csv"),
    "netflix": os.path.join(base_path, "netflix.csv")
}

# Load each dataset into Redis
for prefix, file_path in datasets.items():
    load_csv_to_redis(file_path, prefix)