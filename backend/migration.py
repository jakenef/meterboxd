import json
import os
from pymongo import MongoClient
from pymongo.errors import BulkWriteError, ConnectionFailure, ServerSelectionTimeoutError
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("meterboxd-migration")

def migrate_to_mongodb(mongodb_uri=None):
    """
    Migrate movie cache and overrides from JSON files to MongoDB.
    
    Args:
        mongodb_uri (str): MongoDB connection URI. Defaults to localhost if not provided.
    
    Returns:
        bool: True if migration was successful, False otherwise
    """
    try:
        # Connect to MongoDB (adjust URI as needed)
        uri = mongodb_uri or os.getenv("MONGODB_URI") or "mongodb://localhost:27017/"
        logger.info(f"Attempting to connect to MongoDB with URI: {uri.replace('://', '://***:***@') if '://' in uri else uri}")
        
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        
        # Test connection
        client.admin.command('ping')
        logger.info("Connected to MongoDB successfully")
        
        # Extract database name from the URI if specified
        db_name = "meterboxd"  # default name
        if "?" in uri:
            # URI with query parameters
            base_uri = uri.split("?")[0]
            if "/" in base_uri:
                parts = base_uri.split("/")
                if len(parts) > 3 and parts[-1]:  # Check if there's a database name
                    db_name = parts[-1]
        elif "/" in uri:
            # URI without query parameters
            parts = uri.split("/")
            if len(parts) > 3 and parts[-1]:  # Check if there's a database name
                db_name = parts[-1]
        
        logger.info(f"Using database: {db_name}")
        db = client[db_name]
        movies_collection = db["movie-data"]  # Use existing collection name
        overrides_collection = db["overrides"]  # Will be created if it doesn't exist
        
        # Check if collections already have data
        existing_movies = movies_collection.count_documents({})
        existing_overrides = overrides_collection.count_documents({})
        
        if existing_movies > 0 or existing_overrides > 0:
            logger.warning(f"Found existing data in MongoDB: {existing_movies} movies, {existing_overrides} overrides")
            user_input = input("Do you want to clear existing data before migration? (y/n): ")
            if user_input.lower() == 'y':
                movies_collection.delete_many({})
                overrides_collection.delete_many({})
                logger.info("Existing data cleared")
            else:
                logger.info("Migration aborted to prevent duplicate data")
                return False

        # Load and insert movie cache
        movie_cache_path = os.path.join(os.path.dirname(__file__), "cache", "movie_cache.json")
        logger.info(f"Loading movie cache from {movie_cache_path}")
        with open(movie_cache_path, "r") as f:
            movies = json.load(f)
            
            # Process movies for MongoDB
            if isinstance(movies, dict):
                # Convert dict to list of movies with key as title_with_year
                processed_movies = []
                for title_with_year, movie_data in movies.items():
                    # Add the title_with_year as a field for easier querying
                    movie_data['title_with_year'] = title_with_year
                    processed_movies.append(movie_data)
            else:
                processed_movies = movies
                
            # Insert with ordered=False to continue on errors
            logger.info(f"Migrating {len(processed_movies)} movies to MongoDB")
            try:
                if processed_movies:
                    result = movies_collection.insert_many(processed_movies, ordered=False)
                    logger.info(f"Inserted {len(result.inserted_ids)} movies")
            except BulkWriteError as bwe:
                logger.error(f"Error inserting movies: {bwe.details}")

        # Create indexes for faster querying
        movies_collection.create_index("title_with_year")
        movies_collection.create_index("tmdb_id")
        
        # Load and insert overrides
        overrides_path = os.path.join(os.path.dirname(__file__), "overrides", "overrides.json")
        logger.info(f"Loading overrides from {overrides_path}")
        with open(overrides_path, "r") as f:
            overrides = json.load(f)
            
            # Process overrides for MongoDB
            if isinstance(overrides, dict):
                processed_overrides = []
                for title_with_year, override_data in overrides.items():
                    # Add the title_with_year as a field for easier querying
                    override_data['title_with_year'] = title_with_year
                    processed_overrides.append(override_data)
            else:
                processed_overrides = overrides
                
            # Insert with ordered=False to continue on errors
            logger.info(f"Migrating {len(processed_overrides)} overrides to MongoDB")
            try:
                if processed_overrides:
                    result = overrides_collection.insert_many(processed_overrides, ordered=False)
                    logger.info(f"Inserted {len(result.inserted_ids)} overrides")
            except BulkWriteError as bwe:
                logger.error(f"Error inserting overrides: {bwe.details}")
                
        # Create index for overrides too
        overrides_collection.create_index("title_with_year")
        
        logger.info("Migration complete!")
        return True
        
    except ConnectionFailure as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        return False
    except ServerSelectionTimeoutError as e:
        logger.error(f"Timed out when connecting to MongoDB: {e}")
        return False
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        logger.exception("Exception details:")
        return False

if __name__ == "__main__":
    migrate_to_mongodb()