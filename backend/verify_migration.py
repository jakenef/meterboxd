"""
Script to verify migration status
"""
import os
import json
from database import MovieDatabase
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("migration-verification")

def verify_migration(mongodb_uri=None):
    """
    Verify that all data from JSON files has been migrated to MongoDB.
    
    Args:
        mongodb_uri: Optional MongoDB URI
    
    Returns:
        bool: True if migration is verified, False otherwise
    """
    # Connect to database
    db = MovieDatabase(mongodb_uri)
    
    # Check database collections have data
    movie_count = db.movies_collection.count_documents({})
    override_count = db.overrides_collection.count_documents({})
    
    logger.info(f"Found {movie_count} movies and {override_count} overrides in MongoDB")
    
    # Load JSON files to compare
    cache_path = os.path.join(os.path.dirname(__file__), "cache", "movie_cache.json")
    overrides_path = os.path.join(os.path.dirname(__file__), "overrides", "overrides.json")
    
    try:
        with open(cache_path, 'r') as f:
            movie_cache = json.load(f)
            cache_count = len(movie_cache)
            logger.info(f"Found {cache_count} movies in JSON cache")
    except Exception as e:
        logger.error(f"Error loading movie cache: {e}")
        return False
        
    try:
        with open(overrides_path, 'r') as f:
            overrides = json.load(f)
            overrides_count = len(overrides)
            logger.info(f"Found {overrides_count} overrides in JSON file")
    except Exception as e:
        logger.error(f"Error loading overrides: {e}")
        return False
    
    # Check counts match
    if movie_count != cache_count:
        logger.error(f"Movie count mismatch: {movie_count} in DB vs {cache_count} in file")
        return False
        
    if override_count != overrides_count:
        logger.error(f"Override count mismatch: {override_count} in DB vs {overrides_count} in file")
        return False
    
    # Sample some random entries to verify content
    logger.info("Sampling random entries to verify content...")
    
    # Check a few movie entries
    for i, (key, value) in enumerate(movie_cache.items()):
        if i >= 5:
            break
            
        # Fetch from MongoDB - use the updated collection name
        movie = db.movies_collection.find_one({"title_with_year": key})
        
        # Skip if not found (shouldn't happen if counts match)
        if not movie:
            logger.error(f"Movie {key} not found in database")
            continue
            
        # Compare essential fields
        if (movie.get("public_rating") != value.get("public_rating") or
            movie.get("vote_count") != value.get("vote_count") or
            movie.get("popularity") != value.get("popularity")):
            logger.error(f"Data mismatch for movie {key}")
            return False
    
    # Check all override entries (usually fewer of these)
    for key, value in overrides.items():
        # Fetch from MongoDB using the overrides collection directly
        override = db.overrides_collection.find_one({"title_with_year": key})
        
        # Skip if not found
        if not override:
            logger.error(f"Override {key} not found in database")
            return False
            
        # Compare fields
        for field, expected in value.items():
            if override.get(field) != expected:
                logger.error(f"Override field mismatch for {key}.{field}")
                return False
    
    logger.info("Migration verification successful!")
    return True

if __name__ == "__main__":
    verify_migration()
