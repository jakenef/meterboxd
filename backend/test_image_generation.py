#!/usr/bin/env python3
"""
Simple test script for the image generation functionality
"""

import requests

# Test data that mimics the stats structure
test_stats = {
    "rating_stats": {
        "average_rating_difference": 0.7,
        "overrated_movies": [
            {
                "title": "The Godfather",
                "user_rating": 3.5,
                "public_rating": 4.6,
                "rating_difference": -1.1,
                "year": 1972,
                "poster_url": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg"
            }
        ],
        "underrated_movies": [
            {
                "title": "Blade Runner 2049",
                "user_rating": 5.0,
                "public_rating": 4.0,
                "rating_difference": 1.0,
                "year": 2017,
                "poster_url": "https://image.tmdb.org/t/p/w500/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg"
            }
        ]
    },
    "obscurity_stats": {
        "obscurity_score": 0.5,
        "most_obscure_movies": [],
        "least_obscure_movies": []
    }
}

def test_image_generation():
    """Test the image generation endpoint"""
    url = "http://localhost:4000/api/generate-image"
    
    try:
        response = requests.post(url, json=test_stats, timeout=30)
        
        if response.status_code == 200:
            # Save the generated image
            with open('test_generated_image.png', 'wb') as f:
                f.write(response.content)
            print("✅ Image generation successful! Saved as 'test_generated_image.png'")
            print(f"Image size: {len(response.content)} bytes")
        else:
            print(f"❌ Image generation failed with status {response.status_code}")
            print(f"Response: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    print("Testing image generation endpoint...")
    test_image_generation()
