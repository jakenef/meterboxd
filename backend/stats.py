from typing import Tuple
from backend.csvReader import load_ratings_csv
from dataclasses import dataclass
@dataclass
class MovieData:
    title: str
    year: int
    publicRating: float
    userRating: float
    ratingDifference: float
    popularityScore: float

def getStats(file):
    csv_data = load_ratings_csv(file)

    return csv_data

def analyze_movies(csv_data, metric_function) -> Tuple[float | None, MovieData | None, MovieData | None]:
    maxMovie = None
    minMovie = None
    collected_metrics = []

    for index, row in csv_data.iterrows():
        title = row['Title']
        year = row['Year']
        userRating = row['Rating']

        publicRating, popularity = getPublicMovieData(title, year)
        difference = userRating - publicRating

        movie = MovieData(
            title=title,
            year=int(year),
            publicRating=publicRating,
            userRating=userRating,
            ratingDifference=difference,
            popularityScore=popularity
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

def getRatingData(csv_data) -> Tuple[float | None, MovieData | None, MovieData | None]:
    return analyze_movies(csv_data, lambda movie: movie.ratingDifference)

def getObscurityData(csv_data) -> Tuple[float | None, MovieData | None, MovieData | None]:
    return analyze_movies(csv_data, lambda movie: movie.popularityScore)

def getPublicMovieData(title, year) -> Tuple[float, float]:
    return (0.0, 0.0)
