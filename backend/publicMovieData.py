from typing import Tuple
import json
import requests
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

CACHE_FILE = 'cache/movie_cache.json'
OVERRIDES_FILE = 'overrides/overrides.json'
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            return json.load(f)
    return {}

def load_overrides():
    if os.path.exists(OVERRIDES_FILE):
        with open(OVERRIDES_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_cache(cache):
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f, indent=4)

overrides = load_overrides()

def get_public_movie_data(title: str, year: int, cache: dict) -> Tuple[float, float, float, str]:
    key = f"{title} ({year})"

    # Check if this movie has an override
    if key in overrides:
        override = overrides[key]
        public_rating = override.get("public_rating", 0.0)
        vote_count = override.get("vote_count", 0)
        popularity = override.get("popularity", 0)
        poster_path = override.get("poster_path", "")
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""
        return public_rating, vote_count, popularity, poster_url
    
    if key in cache:
        data = cache[key]
        poster_path = data.get("poster_path", "")
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""
        return data["public_rating"], data["vote_count"], data["popularity"], poster_url
    
    # Otherwise, fetch from TMDb API
    full_api_data = fetch_from_tmdb(title, year)
    
    # Handle case where no movie was found
    if not full_api_data:
        return 0.0, 0.0, 0.0, ""
    
    # Extract the values we need
    public_rating = full_api_data.get("vote_average", 0.0) / 2.0  # Convert TMDB 10-point to 5-point scale
    vote_count = full_api_data.get("vote_count", 0.0)
    popularity = full_api_data.get("popularity", 0.0)

    # Cache everything at the top level - no nesting or duplication
    cache[key] = {
        # Our processed values (what we actually use)
        "public_rating": public_rating,
        "vote_count": vote_count,
        "popularity": popularity,
        
        # Additional TMDB fields that might be useful later
        "tmdb_id": full_api_data.get("id"),
        "original_title": full_api_data.get("original_title"),
        "overview": full_api_data.get("overview"),
        "poster_path": full_api_data.get("poster_path"),
        "backdrop_path": full_api_data.get("backdrop_path"),
        "genre_ids": full_api_data.get("genre_ids", []),
        "release_date": full_api_data.get("release_date"),
        "original_language": full_api_data.get("original_language"),
        "adult": full_api_data.get("adult", False),
        "video": full_api_data.get("video", False),
        
        # Store original unprocessed rating for reference
        "tmdb_vote_average": full_api_data.get("vote_average", 0.0)
    }
    save_cache(cache)

    # Create the poster URL
    poster_path = full_api_data.get("poster_path", "")
    poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""

    return public_rating, vote_count, popularity, poster_url

def fetch_from_tmdb(title: str, year: int) -> dict:
    """
    Fetch movie data from TMDb based on movie title and year.
    Returns the full API response for the first matching movie, or empty dict if not found.
    """
    if not TMDB_API_KEY:
        raise ValueError("TMDB_API_KEY is not set!")

    url = "https://api.themoviedb.org/3/search/movie"
    params = {
        "api_key": TMDB_API_KEY,
        "query": title,
        "year": str(year),
    }

    response = requests.get(url, params=params)
    response.raise_for_status()

    data = response.json()

    if not data["results"]:
        # No matching movie found
        return {}

    # Return the first matching movie's full data
    return data["results"][0]