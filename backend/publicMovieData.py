from typing import Tuple, Dict, Any, Optional, List
import requests
import os
import logging
import time
from dotenv import load_dotenv
from database import MovieDatabase

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("meterboxd-movie-data")

# Track API and database usage stats
stats = {
    "local_cache_hits": 0,
    "override_hits": 0,
    "db_hits": 0, 
    "api_hits": 0,
    "total_requests": 0
}

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Define constants
TMDB_API_KEY = os.getenv("TMDB_API_KEY")

# Initialize database connection
db = MovieDatabase()

# Cache for movie data to reduce database queries during a single session
_local_cache: Dict[str, Dict[str, Any]] = {}

def load_cache() -> Dict[str, Any]:
    """
    Load movie cache from MongoDB.
    This function is maintained for backward compatibility with existing code.
    
    Returns:
        Dictionary with movie data keyed by title_with_year
    """
    cache = {}
    try:
        start_time = time.time()
        # Get all movies from MongoDB
        movies = db.get_all_movies()
        
        # Convert to dictionary format
        for movie in movies:
            key = movie.get("title_with_year")
            if key:
                cache[key] = movie
        
        elapsed = time.time() - start_time
        logger.info(f"Loaded {len(cache)} movies from MongoDB in {elapsed:.2f} seconds")
        
        # Store in local cache for faster subsequent access
        global _local_cache
        _local_cache = cache
        
        return cache
    except Exception as e:
        logger.error(f"Error loading movie cache from MongoDB: {e}")
        return {}

def get_public_movie_data(title: str, year: int, cache: Optional[Dict[str, Any]] = None) -> Tuple[float, float, float, str]:
    """
    Get public movie data from database, local cache, or TMDb API.
    
    Args:
        title: Movie title
        year: Movie release year
        cache: Optional cache dict (for backward compatibility)
        
    Returns:
        Tuple of (public_rating, vote_count, popularity, poster_url)
    """
    global stats
    stats["total_requests"] += 1
    key = f"{title} ({year})"
    
    start_time = time.time()
    
    # First check local memory cache to reduce DB queries
    if key in _local_cache:
        stats["local_cache_hits"] += 1
        elapsed = time.time() - start_time
        logger.info(f"✅ LOCAL CACHE HIT for {key} in {elapsed*1000:.1f}ms (Hit rate: {stats['local_cache_hits']/stats['total_requests']*100:.1f}%)")
        data = _local_cache[key]
        poster_path = data.get("poster_path", "")
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""
        return data["public_rating"], data["vote_count"], data["popularity"], poster_url

    # Then check if this movie has an override in the database
    override_data = db.get_override(key)
    if override_data:
        stats["override_hits"] += 1
        elapsed = time.time() - start_time
        logger.info(f"✅ OVERRIDE HIT for {key} in {elapsed*1000:.1f}ms")
        public_rating = override_data.get("public_rating", 0.0)
        vote_count = override_data.get("vote_count", 0)
        popularity = override_data.get("popularity", 0)
        poster_path = override_data.get("poster_path", "")
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""
        
        # Cache in local memory
        _local_cache[key] = override_data
        
        return public_rating, vote_count, popularity, poster_url
    
    # Then check if the movie is in the database
    movie_data = db.get_movie(key)
    if movie_data:
        stats["db_hits"] += 1
        elapsed = time.time() - start_time
        logger.info(f"✅ DATABASE HIT for {key} in {elapsed*1000:.1f}ms")
        poster_path = movie_data.get("poster_path", "")
        poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""
        
        # Cache in local memory
        _local_cache[key] = movie_data
        
        return movie_data["public_rating"], movie_data["vote_count"], movie_data["popularity"], poster_url
    
    # Otherwise, fetch from TMDb API
    stats["api_hits"] += 1
    elapsed = time.time() - start_time
    logger.warning(f"⚠️ API LOOKUP for {key} in {elapsed*1000:.1f}ms (API hits: {stats['api_hits']}/{stats['total_requests']})")
    full_api_data = fetch_from_tmdb(title, year)
    
    # Handle case where no movie was found
    if not full_api_data:
        logger.warning(f"No data found for {key}")
        return 0.0, 0.0, 0.0, ""
    
    # Extract the values we need
    public_rating = full_api_data.get("vote_average", 0.0) / 2.0  # Convert TMDB 10-point to 5-point scale
    vote_count = full_api_data.get("vote_count", 0.0)
    popularity = full_api_data.get("popularity", 0.0)

    # Create movie data record
    movie_data = {
        # Our processed values (what we actually use)
        "public_rating": public_rating,
        "vote_count": vote_count,
        "popularity": popularity,
        
        # Additional TMDB fields that might be useful later
        "tmdb_id": full_api_data.get("id"),
        "original_title": full_api_data.get("original_title"),
        "overview": full_api_data.get("overview"),
        "poster_path": full_api_data.get("poster_path", ""),
        "backdrop_path": full_api_data.get("backdrop_path", ""),
        "genre_ids": full_api_data.get("genre_ids", []),
        "release_date": full_api_data.get("release_date", ""),
        "original_language": full_api_data.get("original_language", ""),
        "adult": full_api_data.get("adult", False),
        "video": full_api_data.get("video", False),
        
        # Store original unprocessed rating for reference
        "tmdb_vote_average": full_api_data.get("vote_average", 0.0)
    }
    
    # Save to database
    db.add_or_update_movie(key, movie_data)
    
    # For backward compatibility, also update the provided cache if present
    if cache is not None:
        cache[key] = movie_data
    
    # Also cache in local memory
    _local_cache[key] = movie_data

    # Create the poster URL
    poster_path = full_api_data.get("poster_path", "")
    poster_url = f"https://image.tmdb.org/t/p/w500{poster_path}" if poster_path else ""

    return public_rating, vote_count, popularity, poster_url

def fetch_from_tmdb(title: str, year: int) -> Dict[str, Any]:
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

def add_or_update_override(title: str, year: int, override_data: Dict[str, Any]) -> bool:
    """
    Add or update movie override in database
    
    Args:
        title: Movie title
        year: Movie release year
        override_data: Dictionary with override data
        
    Returns:
        True if successful, False otherwise
    """
    key = f"{title} ({year})"
    
    # Update database
    success = db.add_or_update_override(key, override_data)
    
    # Update local cache too
    if success:
        _local_cache[key] = override_data
        
    return success

def clear_local_cache() -> None:
    """Clear the local movie data cache"""
    _local_cache.clear()
    logger.info("Local movie cache cleared")

def log_stats() -> None:
    """Log statistics about movie data sources"""
    if stats["total_requests"] == 0:
        logger.info("No movie data requests made yet")
        return
    
    logger.info("=== MOVIE DATA SOURCE STATISTICS ===")
    logger.info(f"Total requests: {stats['total_requests']}")
    logger.info(f"Local cache hits: {stats['local_cache_hits']} ({stats['local_cache_hits']/stats['total_requests']*100:.1f}%)")
    logger.info(f"Override hits: {stats['override_hits']} ({stats['override_hits']/stats['total_requests']*100:.1f}%)")
    logger.info(f"Database hits: {stats['db_hits']} ({stats['db_hits']/stats['total_requests']*100:.1f}%)")
    logger.info(f"API hits: {stats['api_hits']} ({stats['api_hits']/stats['total_requests']*100:.1f}%)")
    logger.info("====================================")
    
    # Reset stats after logging
    stats["local_cache_hits"] = 0
    stats["override_hits"] = 0
    stats["db_hits"] = 0
    stats["api_hits"] = 0
    stats["total_requests"] = 0