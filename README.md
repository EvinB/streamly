## Overview
Streamly is a full-stack web application built in 48 hours during a hackathon to solve the frustrating problem of content discovery across multiple streaming services. Users can search for movies and shows across Netflix, Hulu, and Amazon from one place, filter by genre, rating, and service, and get personalized recommendations based on their liked content.

## Key Features
- Cross Platfrom search: Search and filter content across Netflix, Hulu, and Amazon
- User Accounts: Register/login system secured using Bcrypt
- Like Content: Like movies/shows to build your watch history and preferences 
- Personalized Recommendations: Recommendations generated using PostgreSQL cube extension 
- Redis Caching: Fask lookups for recommendations 
- TMDB Integration: Movie/show images fetched using TMDB Api

## Architecture 
Frontend:

- React with Vite for fast dev/build.
- React Router for navigation (register, login, dashboard).
- Axios for API calls.
- Component-based structure

Backend: 

- Express Server
- PostgreSQL for persistent data (users, liked content, ratingsm, availability, countries)
- Redis for caching recommendations, subscriptions, and liked movies
- Full-text search using PostgreSQL tsvector queries
- Genre similarity via vector math using the cube extension

APIs:
- TMDB (poster fetches using IMDb IDs)


![Screenshot](https://github.com/EvinB/streamly/blob/main/streamlyRecs.png)
![Screenshot](https://github.com/EvinB/streamly/blob/main/streamlySearch.png)
![Screenshot](https://github.com/EvinB/streamly/blob/main/StreamlySchema.png)



## Data Sets
https://www.kaggle.com/datasets/octopusteam/full-hulu-dataset

https://www.kaggle.com/datasets/octopusteam/full-netflix-dataset

https://www.kaggle.com/datasets/octopusteam/full-amazon-prime-dataset
