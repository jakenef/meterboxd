from typing import Tuple

from backend.csvReader import getStats
from dataclasses import dataclass
from backend.publicMovieData import getPublicMovieData, load_cache
@dataclass
class MovieData:
    title: str
    year: int
    publicRating: float
    userRating: float
    ratingDifference: float
    vote_count: float

def analyze_movies(csv_data, metric_function) -> Tuple[float | None, MovieData | None, MovieData | None]:
    maxMovie = None
    minMovie = None
    collected_metrics = []
    cache = load_cache()

    for index, row in csv_data.iterrows():
        title = row['Name']
        year = row['Year']
        userRating = row['Rating']

        publicRating, vote_count = getPublicMovieData(title, year, cache)
        difference = (userRating * 2) - publicRating

        movie = MovieData(
            title=title,
            year=int(year),
            publicRating=publicRating,
            userRating=userRating,
            ratingDifference=difference,
            vote_count=vote_count
        )

        metric = metric_function(movie)
        collected_metrics.append(metric)

        if maxMovie is None:
            maxMovie = movie
        elif metric > metric_function(maxMovie):
            maxMovie = movie

        if minMovie is None:
            minMovie = movie
        elif metric < metric_function(minMovie):
            minMovie = movie

    avgMetric = sum(collected_metrics) / len(collected_metrics) if collected_metrics else 0.0

    return (avgMetric, maxMovie, minMovie)

def getRatingData(file_path) -> Tuple[float | None, MovieData | None, MovieData | None]:
    csv_data = getStats(file_path)
    return analyze_movies(csv_data, lambda movie: movie.ratingDifference)

def getObscurityData(file_path) -> Tuple[float | None, MovieData | None, MovieData | None]:
    csv_data = getStats(file_path)
    return analyze_movies(csv_data, lambda movie: movie.vote_count)
