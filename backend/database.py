"""
Database connection and operations for MeterBoxd
"""
import os
from typing import Dict, List, Optional
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("meterboxd-db")

class MovieDatabase:
    """Database access layer for movie data and overrides"""
    
    _instance = None
    
    def __new__(cls, *args, **kwargs):
        """Singleton pattern to ensure a single database connection"""
        if cls._instance is None:
            cls._instance = super(MovieDatabase, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self, mongodb_uri=None):
        """Initialize database connection if not already initialized"""
        if self._initialized:
            return
            
        self.client = None
        self.db = None
        self.movies_collection = None
        self.overrides_collection = None
        
        # Connect to database
        self.connect(mongodb_uri)
        self._initialized = True
    
    def connect(self, mongodb_uri=None):
        """Connect to MongoDB database"""
        try:
            # Use provided URI, environment variable, or default to localhost
            uri = mongodb_uri or os.getenv("MONGODB_URI") or "mongodb://localhost:27017/"
            
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
            
            logger.info(f"Connecting to MongoDB with database: {db_name}")
            self.client = MongoClient(uri)
            
            # Test connection
            self.client.admin.command('ping')
            logger.info("Connected to MongoDB successfully")
            
            # Initialize database and collections
            self.db = self.client[db_name]
            self.movies_collection = self.db["movie-data"]  # Use existing collection name
            self.overrides_collection = self.db["overrides"]  # Will be created if it doesn't exist
            
            # Ensure indexes exist
            self._ensure_indexes()
            
            return True
        except ConnectionFailure:
            logger.error("Failed to connect to MongoDB. Is the server running?")
            return False
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            return False
    
    def _ensure_indexes(self):
        """Create necessary indexes if they don't exist"""
        self.movies_collection.create_index("title_with_year")
        self.movies_collection.create_index("tmdb_id")
        self.overrides_collection.create_index("title_with_year")
    
    def get_movie(self, title_with_year: str) -> Optional[Dict]:
        """
        Get movie data from database
        
        Args:
            title_with_year: Movie title with year in format "Title (Year)"
            
        Returns:
            Dictionary with movie data or None if not found
        """
        try:
            return self.movies_collection.find_one({"title_with_year": title_with_year})
        except Exception as e:
            logger.error(f"Error retrieving movie {title_with_year}: {e}")
            return None
    
    def get_override(self, title_with_year: str) -> Optional[Dict]:
        """
        Get movie override from database
        
        Args:
            title_with_year: Movie title with year in format "Title (Year)"
            
        Returns:
            Dictionary with override data or None if not found
        """
        try:
            return self.overrides_collection.find_one({"title_with_year": title_with_year})
        except Exception as e:
            logger.error(f"Error retrieving override {title_with_year}: {e}")
            return None
    
    def add_or_update_movie(self, title_with_year: str, movie_data: Dict) -> bool:
        """
        Add or update movie in database
        
        Args:
            title_with_year: Movie title with year in format "Title (Year)"
            movie_data: Dictionary with movie data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Ensure title_with_year is part of the data
            movie_data["title_with_year"] = title_with_year
            
            # Use upsert to insert or update
            result = self.movies_collection.update_one(
                {"title_with_year": title_with_year}, 
                {"$set": movie_data},
                upsert=True
            )
            
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error saving movie {title_with_year}: {e}")
            return False
    
    def add_or_update_override(self, title_with_year: str, override_data: Dict) -> bool:
        """
        Add or update movie override in database
        
        Args:
            title_with_year: Movie title with year in format "Title (Year)"
            override_data: Dictionary with override data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Ensure title_with_year is part of the data
            override_data["title_with_year"] = title_with_year
            
            # Use upsert to insert or update
            result = self.overrides_collection.update_one(
                {"title_with_year": title_with_year}, 
                {"$set": override_data},
                upsert=True
            )
            
            return result.acknowledged
        except Exception as e:
            logger.error(f"Error saving override {title_with_year}: {e}")
            return False
    
    def get_all_movies(self) -> List[Dict]:
        """Get all movies from database"""
        try:
            return list(self.movies_collection.find({}))
        except Exception as e:
            logger.error(f"Error retrieving all movies: {e}")
            return []
    
    def get_all_overrides(self) -> List[Dict]:
        """Get all overrides from database"""
        try:
            return list(self.overrides_collection.find({}))
        except Exception as e:
            logger.error(f"Error retrieving all overrides: {e}")
            return []
            
    def close(self):
        """Close database connection"""
        if self.client:
            self.client.close()
            logger.info("Database connection closed")
