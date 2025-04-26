from typing import Tuple
import json
import os

CACHE_FILE = 'cache/movie_cache.json'

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
        return data["publicRating"], data["popularityScore"]
    
    # Otherwise, fetch from TMDb API
    publicRating, popularityScore = fetch_from_tmdb(title, year)

    # Cache it
    cache[key] = {
        "publicRating": publicRating,
        "popularityScore": popularityScore
    }
    save_cache(cache)

    return publicRating, popularityScore

def fetch_from_tmdb(title, year) -> Tuple[float, float]:
    return None