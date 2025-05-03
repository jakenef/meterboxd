from typing import Tuple
import json
import requests
import os

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

def get_public_movie_data(title: str, year: int, cache: dict) -> Tuple[float, float, float]:
    key = f"{title} ({year})"

    # Check if this movie has an override
    if key in overrides:
        override = overrides[key]
        if override.get("ignore"):
            print(f"Skipping {key} due to override.")
            return 0.0, 0, 0
        public_rating = override.get("public_rating", 0.0)
        vote_count = override.get("vote_count", 0)
        popularity = override.get("popularity", 0)
        return public_rating, vote_count, popularity
    
    if key in cache:
        data = cache[key]
        return data["public_rating"], data["vote_count"], data["popularity"]
    
    # Otherwise, fetch from TMDb API
    public_rating, vote_count, popularity = fetch_from_tmdb(title, year)

    public_rating = public_rating / 2.0

    # Cache it
    cache[key] = {
        "public_rating": public_rating,
        "vote_count": vote_count,
        "popularity": popularity
    }
    save_cache(cache)

    return public_rating, vote_count, popularity

def fetch_from_tmdb(title: str, year: int) -> Tuple[float, float, float]:
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
        return 0.0, 0.0, 0.0

    first_result = data["results"][0]
    public_rating = first_result.get("vote_average", 0.0)
    vote_count = first_result.get("vote_count", 0.0)
    popularity = first_result.get("popularity", 0.0)

    return public_rating, vote_count, popularity