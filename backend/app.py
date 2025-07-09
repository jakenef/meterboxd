import io
import zipfile
from dataclasses import asdict
from flask import Flask, request, jsonify
from csvReader import load_ratings_csv
from stats import get_rating_data, get_obscurity_data

app = Flask(__name__)

@app.route("api/upload", methods=["POST"])
def upload_and_stats():
    if 'zip' not in request.files:
        return jsonify(error="No file part"), 400
    zip_file = request.files['zip']
    if zip_file.filename == "":
        return jsonify(error="No file selected"), 400
    
    try:
        zip_contents = zipfile.ZipFile(io.BytesIO(zip_file.read()))

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

    except Exception as e:
        app.logger.exception(e)
        return jsonify(error="Server error while processing ZIP"), 500


if __name__ == "__main__":
    # For development only; in production use gunicorn or similar WSGI server
    app.run(host="0.0.0.0", port=4000, debug=True)

