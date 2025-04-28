from typing import Tuple

from backend.csvReader import getStats
from dataclasses import dataclass
from backend.publicMovieData import get_public_movie_data, load_cache
@dataclass
class MovieData:
    title: str
    year: int
    public_rating: float
    user_rating: float
    rating_difference: float
    vote_count: float
    popularity_score: float

    def __str__(self):
        return (
            f"🎬 '{self.title}' ({self.year})\n"
            f"   - User Rating: {self.user_rating:.1f}/10\n"
            f"   - Public Rating: {self.public_rating:.1f}/10\n"
            f"   - Difference: {self.rating_difference:+.1f}\n"
            f"   - Vote Count: {self.vote_count:,} votes\n"
            f"   - Popularity Score: {self.popularity_score:+.1f}"
        )

def analyze_movies(csv_data, metric_function) -> Tuple[float | None, MovieData | None, MovieData | None]:
    max_movie = None
    min_movie = None
    collected_metrics = []
    cache = load_cache()

    for index, row in csv_data.iterrows():
        title = row['Name']
        year = row['Year']
        user_rating = (row['Rating'] * 2)

        public_rating, vote_count = get_public_movie_data(title, year, cache)

        if public_rating == 0 or vote_count == 0:
            continue

        difference = user_rating - public_rating

        movie = MovieData(
            title=title,
            year=int(year),
            public_rating=public_rating,
            user_rating=user_rating,
            rating_difference=difference,
            vote_count=vote_count,
            popularity_score=(vote_count/(2025 - year + 1))
        )

        metric = metric_function(movie)
        collected_metrics.append(metric)

        if max_movie is None:
            max_movie = movie
        elif metric > metric_function(max_movie):
            max_movie = movie

        if min_movie is None:
            min_movie = movie
        elif metric < metric_function(min_movie):
            min_movie = movie

    avg_metric = sum(collected_metrics) / len(collected_metrics) if collected_metrics else 0.0

    return (avg_metric, max_movie, min_movie)

def get_rating_data(file_path) -> Tuple[float | None, MovieData | None, MovieData | None]:
    csv_data = getStats(file_path)
    return analyze_movies(csv_data, lambda movie: movie.rating_difference)

def get_obscurity_data(file_path) -> Tuple[float | None, MovieData | None, MovieData | None]:
    csv_data = getStats(file_path)
    return analyze_movies(csv_data, lambda movie: movie.popularity_score)
