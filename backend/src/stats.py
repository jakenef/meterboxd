from typing import Tuple, Optional, List
from backend.src.csvReader import getStats
from dataclasses import dataclass
from backend.src.publicMovieData import get_public_movie_data, load_cache

@dataclass
class MovieData:
    title: str
    year: int
    public_rating: float
    user_rating: float
    rating_difference: float
    vote_count: float
    normalized_vote_count: float
    popularity: float
    vote_count_popularity: float

    def __str__(self):
        return (
            f"🎬 '{self.title}' ({self.year})\n"
            f"   - User Rating: {self.user_rating:.1f}/5\n"
            f"   - Public Rating: {self.public_rating:.1f}/5\n"
            f"   - Difference: {self.rating_difference:+.1f}\n"
            f"   - Vote Count: {self.vote_count:,} votes\n"
            f"   - Normalized Vote Count: {self.normalized_vote_count:+.1f}\n"
            f"   - Popularity: {self.popularity:+.1f}\n"
            f"   - Vote Count Popularity: {self.vote_count_popularity:+.1f}\n"
        )

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

def get_rating_data(file_path) -> Tuple[Optional[float], Optional[List[MovieData]], Optional[List[MovieData]]]:
    csv_data = getStats(file_path)
    return analyze_movies(csv_data, lambda movie: movie.rating_difference)

def get_obscurity_data(file_path) -> Tuple[Optional[float], Optional[List[MovieData]], Optional[List[MovieData]]]:
    csv_data = getStats(file_path)
    return analyze_movies(csv_data, lambda movie: movie.vote_count_popularity)
