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

def getRatingData(csv_data) -> Tuple[float | None, MovieData | None, MovieData | None]:
    maxDifMovie = None
    minDifMovie = None
    ratingData = []

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

        ratingData.append(difference)

        if maxDifMovie is None:
            maxDifMovie = movie
        elif difference > maxDifMovie.ratingDifference:
            maxDifMovie = movie

        if minDifMovie is None:
            minDifMovie = movie
        elif difference < minDifMovie.ratingDifference:
            minDifMovie = movie

    avgDifference = sum(ratingData) / len(ratingData) if ratingData else 0.0

    return (avgDifference, maxDifMovie, minDifMovie)

def getObscurityData(csv_data) -> Tuple[float | None, MovieData | None, MovieData | None]:
    mostObscureMovie = None
    leastObscureMovie = None
    obscurityData = []

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

        obscurityData.append(popularity)

        if leastObscureMovie is None:
            leastObscureMovie = movie
        elif popularity > leastObscureMovie.popularityScore:
            leastObscureMovie = movie

        if mostObscureMovie is None:
            mostObscureMovie = movie
        elif popularity < mostObscureMovie.popularityScore:
            mostObscureMovie = movie

    avgObscurity = sum(obscurityData) / len(obscurityData) if obscurityData else 0.0

    return (avgObscurity, mostObscureMovie, leastObscureMovie)

def getPublicMovieData(title, year) -> Tuple[float, float]:
    return (0.0, 0.0)
