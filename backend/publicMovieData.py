from typing import Tuple
import json
import requests
import os

CACHE_FILE = 'cache/movie_cache.json'
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

def load_cache():
    if os.path.exists(CACHE_FILE):
        with open(CACHE_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_cache(cache):
    os.makedirs(os.path.dirname(CACHE_FILE), exist_ok=True)
    with open(CACHE_FILE, 'w') as f:
        json.dump(cache, f, indent=4)

def getPublicMovieData(title: str, year: int, cache: dict) -> Tuple[float, float]:
    key = f"{title} ({year})"
    
    if key in cache:
        print(f"Cache hit: {key}")
        data = cache[key]
        return data["publicRating"], data["vote_count"]
    
    # Otherwise, fetch from TMDb API
    publicRating, vote_count = fetch_from_tmdb(title, year)

    # Cache it
    cache[key] = {
        "publicRating": publicRating,
        "vote_count": vote_count
    }
    save_cache(cache)

    return publicRating, vote_count

def fetch_from_tmdb(title: str, year: int) -> Tuple[float, float]:
    """
    Fetch public rating and popularity score from TMDb based on movie title and year.
    Returns (vote_average, vote_count).
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
        return 0.0, 0.0

    first_result = data["results"][0]
    public_rating = first_result.get("vote_average", 0.0)
    vote_count = first_result.get("vote_count", 0.0)

    return public_rating, vote_count