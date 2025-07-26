from typing import Tuple, Optional, List
from models import MovieData
from publicMovieData import get_public_movie_data, load_cache

"""
Analyzes a dataset of movies and computes metrics based on a given metric function.

Args:
    csv_data: A pandas DataFrame containing movie data with columns 'Name', 'Year', and 'Rating'.
    metric_function: A callable that takes a `MovieData` object and returns a numeric metric.

Returns:
    A tuple containing:
    - avg_metric (float | None): The average value of the computed metric across all movies.
    - highest_metric_list (list[MovieData] | None): A list of the top 5 movies with the highest metric values.
    - lowest_metric_list (list[MovieData] | None): A list of the bottom 5 movies with the lowest metric values.

Notes:
    - Movies with missing or invalid public data (e.g., public rating, vote count, or popularity) are skipped.
    - The metric is computed for each movie using the provided `metric_function`.
    - The movies are sorted by their metric values in descending order to determine the top and bottom lists.
    - Normalized vote count is calculated as `vote_count / (2025 - year + 1)`.
    - Vote count popularity is calculated as a weighted combination of normalized vote count (70%) and popularity (30%).
"""
def analyze_movies(csv_data, metric_function) -> Tuple[Optional[float], Optional[List[MovieData]], Optional[List[MovieData]]]:
    movie_list = []
    collected_metrics = []
    cache = load_cache()

    for index, row in csv_data.iterrows():
        title = row['Name']
        year = row['Year']
        user_rating = row['Rating']

        public_rating, vote_count, popularity = get_public_movie_data(title, year, cache)

        if public_rating == 0 or vote_count == 0 or popularity == 0:
            continue

        difference = user_rating - public_rating
        normalized_vote_count = (vote_count/(2025 - year + 1))
        vote_count_popularity = (normalized_vote_count * .7) + (popularity * .3)

        movie = MovieData(
            title=title,
            year=int(year),
            public_rating=public_rating,
            user_rating=user_rating,
            rating_difference=difference,
            vote_count=vote_count,
            normalized_vote_count=normalized_vote_count,
            popularity=popularity,
            vote_count_popularity=vote_count_popularity
        )

        metric = metric_function(movie)
        collected_metrics.append(metric)
        movie_list.append((metric, movie))

    avg_metric = sum(collected_metrics) / len(collected_metrics) if collected_metrics else 0.0
    sorted_movies = sorted(movie_list, key=lambda x: x[0], reverse=True)
    highest_metric_list = [movie for _, movie in sorted_movies[:5]]
    lowest_metric_list = [movie for _, movie in sorted_movies[-5:]][::-1]

    return (avg_metric, highest_metric_list, lowest_metric_list)

def get_rating_data(csv_data) -> Tuple[Optional[float], Optional[List[MovieData]], Optional[List[MovieData]]]:
    return analyze_movies(csv_data, lambda movie: movie.rating_difference)

def get_obscurity_data(csv_data) -> Tuple[Optional[float], Optional[List[MovieData]], Optional[List[MovieData]]]:
    return analyze_movies(csv_data, lambda movie: -movie.vote_count_popularity)
