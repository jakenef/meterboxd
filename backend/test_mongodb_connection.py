"""
Test connection to MongoDB cluster
"""
import os
import logging
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("mongodb-connection-test")

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env'))

def test_mongodb_connection():
    """Test connection to MongoDB cluster"""
    try:
        # Get MongoDB URI from environment variable
        uri = os.getenv("MONGODB_URI")
        
        if not uri:
            logger.error("MONGODB_URI environment variable is not set")
            return False
        
        logger.info(f"Attempting to connect to MongoDB with URI: {uri.replace('://', '://***:***@') if '://' in uri else uri}")
        
        # Connect with a short timeout
        client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        
        # Force a connection attempt
        client.admin.command('ping')
        
        # Get database name from URI or use default
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
        
        # Get database
        db = client[db_name]
        
        # List collections
        collections = db.list_collection_names()
        logger.info(f"Connection successful! Database: {db_name}")
        logger.info(f"Available collections: {', '.join(collections) if collections else 'No collections found'}")
        
        # Check if collections exist
        if "movie-data" in collections:
            count = db["movie-data"].count_documents({})
            logger.info(f"Found {count} documents in movie-data collection")
        else:
            logger.info("No movie-data collection found")
            
        if "overrides" in collections:
            count = db["overrides"].count_documents({})
            logger.info(f"Found {count} documents in overrides collection")
        else:
            logger.info("No overrides collection found - will be created during migration")
            
        return True
        
    except ServerSelectionTimeoutError:
        logger.error("Timed out when connecting to MongoDB. Check your connection string and network connectivity.")
        return False
    except ConnectionFailure:
        logger.error("Failed to connect to MongoDB. Server may not be available.")
        return False
    except Exception as e:
        logger.error(f"Error connecting to MongoDB: {e}")
        return False

if __name__ == "__main__":
    test_mongodb_connection()
