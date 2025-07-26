import io
import zipfile
from dataclasses import asdict
from flask import Flask, request, jsonify
from flask_cors import CORS
from csvReader import load_ratings_csv
from stats import get_rating_data, get_obscurity_data

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/api/upload", methods=["POST"])
def upload_and_stats():
    if 'zip' not in request.files:
        return jsonify(error="No file part"), 400
    zip_file = request.files['zip']
    if zip_file.filename == "":
        return jsonify(error="No file selected"), 400
    
    # Security: Check file size (10MB limit)
    if len(zip_file.read()) > 10 * 1024 * 1024:
        return jsonify(error="File too large (max 10MB)"), 413
    zip_file.seek(0)  # Reset file pointer after reading
    
    # Security: Validate file extension
    if not zip_file.filename.lower().endswith('.zip'):
        return jsonify(error="Only ZIP files are allowed"), 400
    
    try:
        zip_contents = zipfile.ZipFile(io.BytesIO(zip_file.read()))
        
        # Security: Check for zip bombs and directory traversal
        total_extracted_size = 0
        for file_info in zip_contents.infolist():
            # Check for directory traversal attacks
            if '..' in file_info.filename or file_info.filename.startswith('/'):
                return jsonify(error="Invalid file path in ZIP"), 400
            
            # Check for zip bombs (files that expand too much)
            total_extracted_size += file_info.file_size
            if total_extracted_size > 100 * 1024 * 1024:  # 100MB limit
                return jsonify(error="ZIP contents too large"), 400

        # Find the ratings.csv file within the uploaded ZIP archive
        # Letterboxd exports contain a ratings.csv file that we need to process
        ratings_csv_filename = None
        for filename in zip_contents.namelist():
            if filename.lower().endswith("ratings.csv"):
                ratings_csv_filename = filename
                break
        
        if ratings_csv_filename is None:
            return jsonify(error="ratings.csv not found in ZIP archive"), 400

        with zip_contents.open(ratings_csv_filename) as csvfile:
            ratings_data = load_ratings_csv(csvfile)
        
        # Security: Limit the number of movies processed to prevent API abuse
        if len(ratings_data) > 1000:
            return jsonify(error="Too many movies to process (max 1000)"), 413

        # Calculate statistics
        avg_rating_diff, underrated_list, overrated_list = get_rating_data(ratings_data)
        obscurity_score, most_obscure_list, least_obscure_list = get_obscurity_data(ratings_data)

        # Convert movie dataclasses to JSON-serializable dictionaries and
        # Build the response object for the frontend
        response = {
            "rating_stats": {
                "average_rating_difference": avg_rating_diff,
                "underrated_movies": [asdict(movie) for movie in underrated_list],
                "overrated_movies": [asdict(movie) for movie in overrated_list]
            },
            "obscurity_stats": {
                "obscurity_score": obscurity_score,
                "most_obscure_movies": [asdict(movie) for movie in most_obscure_list],
                "least_obscure_movies": [asdict(movie) for movie in least_obscure_list]
            }
        }

        return jsonify(response)

    except zipfile.BadZipFile:
        return jsonify(error="Invalid ZIP file"), 400
    except ValueError as e:
        # Handle specific validation errors without exposing details
        app.logger.warning(f"Validation error: {str(e)}")
        return jsonify(error="Invalid file format"), 400
    except Exception as e:
        # Log the full error internally but don't expose details
        app.logger.exception(f"Unexpected error processing upload: {str(e)}")
        return jsonify(error="Server error while processing file"), 500


if __name__ == "__main__":
    # For development only; in production use gunicorn or similar WSGI server
    app.run(host="0.0.0.0", port=4000, debug=True)

